/**
 * Draft Night Engine — monta a transmissão pick a pick.
 * A Interface só avança frames; a Engine decide escolhas e DTOs.
 */

import {
  DRAFT_NIGHT_BOARD_SIZE,
  DRAFT_NIGHT_CLOCK_MS,
  DRAFT_NIGHT_REVEAL_MS,
  DRAFT_NIGHT_SPEEDS,
  DRAFT_NIGHT_VERSION,
} from '../../data/draftNight'
import { DRAFT_MAX_PICKS_PER_TEAM } from '../../data/draft/constants'
import { ROSTER_SIZE_MAX } from '../../data/gm/constants'
import { TEAMS, getTeamById } from '../../data/teams'
import { resolveFranchiseObjective } from '../franchise/objective'
import { draftProspect } from '../gm/actions'
import { analyzeFranchise } from '../gm/situation'
import { hydrateDraftPicks, resolvePickOwner } from '../trade/picks.js'
import { enterUndraftedIntoLeague } from '../draft/run'
import { buildDraftOrder, expandDraftPicks } from '../draft/order'
import { selectProspectForTeam, getDraftBoard } from '../draft/select'
import { sortByMockRank } from '../draft/mock'
import { analyzeProspect, compareProspects } from './analysis.js'
import { buildCrowdReaction } from './crowd.js'
import { buildDraftNightNews } from './news.js'

/**
 * Status read-only: há draft ao vivo, replay ou nada.
 */
export function getDraftNightStatus({
  gm = null,
  season = null,
  currentSeason = 1,
  currentWeek = 1,
  currentTeamId = null,
} = {}) {
  if (!gm) {
    return {
      available: false,
      mode: 'idle',
      message: 'Carreira não iniciada.',
      canStartLive: false,
      canReplay: false,
    }
  }

  const classSize = (gm.draftClass ?? []).length
  const canStartLive = classSize > 0 && !gm.draftComplete
  const canReplay = Boolean(gm.lastDraft?.picks?.length)
  const seasonNumber =
    season?.seasonNumber ?? currentSeason ?? gm.lastDraft?.seasonNumber ?? 1

  if (canStartLive) {
    return {
      available: true,
      mode: 'ready',
      message: `Classe de ${classSize} prospects pronta — inicie a transmissão.`,
      canStartLive: true,
      canReplay,
      classSize,
      seasonNumber,
      week: currentWeek,
      playerTeamId: currentTeamId,
      mockTop: sortByMockRank(gm.draftClass).slice(0, 5).map(briefProspect),
    }
  }

  if (canReplay) {
    return {
      available: true,
      mode: 'replay_ready',
      message: `Replay do Draft da temporada ${gm.lastDraft.seasonNumber ?? seasonNumber}.`,
      canStartLive: false,
      canReplay: true,
      classSize: 0,
      seasonNumber: gm.lastDraft.seasonNumber ?? seasonNumber,
      week: currentWeek,
      playerTeamId: currentTeamId,
      lastPickCount: gm.lastDraft.picks.length,
    }
  }

  return {
    available: false,
    mode: 'idle',
    message:
      'Sem classe de draft ativa. Avance a offseason até a revelação (semana 44) ou o Draft (45–46).',
    canStartLive: false,
    canReplay: false,
    seasonNumber,
    week: currentWeek,
    playerTeamId: currentTeamId,
  }
}

/**
 * Inicia transmissão ao vivo: executa o draft na Engine e gera frames.
 * Retorna finalGm para a store aplicar (como o draft da semana faria).
 */
export function buildDraftNightLive(gm, seasonState = {}, opts = {}) {
  if (!gm || !(gm.draftClass ?? []).length || gm.draftComplete) {
    return {
      ok: false,
      error: 'Nenhuma classe disponível para Draft Night ao vivo.',
    }
  }

  const speedId = opts.speed ?? 'normal'
  const playerTeamId = opts.playerTeamId ?? null
  const seasonNumber =
    opts.seasonNumber ??
    seasonState?.seasonNumber ??
    1

  const initialClass = gm.draftClass.map((p) => ({ ...p }))
  const run = runDraftCollecting(gm, seasonState, {
    maxPicksPerTeam: opts.maxPicksPerTeam,
  })

  const frames = buildFramesFromRun({
    initialClass,
    picks: run.picks,
    gmStart: gm,
    gmSteps: run.gmSteps,
    playerTeamId,
    seasonNumber,
    speedId,
    scouting: gm.scouting,
  })

  return {
    ok: true,
    mode: 'live',
    broadcast: {
      version: DRAFT_NIGHT_VERSION,
      mode: 'live',
      seasonNumber,
      playerTeamId,
      speedId,
      totalPicks: run.picks.length,
      frameCount: frames.length,
      frames,
      summary: run.summary,
      undraftedCount: run.undraftedIds.length,
    },
    gm: run.gm,
    decisions: run.decisions,
    picks: run.picks,
  }
}

/**
 * Replay a partir de gm.lastDraft (sem mutar a carreira).
 */
export function buildDraftNightReplay(gm, opts = {}) {
  const last = gm?.lastDraft
  if (!last?.picks?.length) {
    return { ok: false, error: 'Nenhum Draft anterior para replay.' }
  }

  const speedId = opts.speed ?? 'normal'
  const playerTeamId = opts.playerTeamId ?? null
  const seasonNumber = last.seasonNumber ?? opts.seasonNumber ?? 1

  const picks = last.picks.map((p) => enrichPick(p, gm))
  const undrafted = (last.undraftedIds ?? [])
    .map((id) => resolveProspectEntity(gm, id))
    .filter(Boolean)
  const initialClass = [
    ...picks.map((p) => resolveProspectEntity(gm, p.prospectId) ?? stubFromPick(p)),
    ...undrafted,
  ]

  const gmSteps = reconstructGmSteps(gm, picks)

  const frames = buildFramesFromRun({
    initialClass,
    picks,
    gmStart: gmSteps[0] ?? gm,
    gmSteps,
    playerTeamId,
    seasonNumber,
    speedId,
    scouting: gm.scouting,
  })

  return {
    ok: true,
    mode: 'replay',
    broadcast: {
      version: DRAFT_NIGHT_VERSION,
      mode: 'replay',
      seasonNumber,
      playerTeamId,
      speedId,
      totalPicks: picks.length,
      frameCount: frames.length,
      frames,
      summary: `Replay: ${picks.length} picks`,
      undraftedCount: undrafted.length,
    },
    gm: null,
    decisions: [],
    picks,
  }
}

export function getDraftNightFrame(broadcast, index = 0) {
  if (!broadcast?.frames?.length) return null
  const i = Math.max(0, Math.min(index, broadcast.frames.length - 1))
  return broadcast.frames[i]
}

export function rescaleDraftNightSpeed(broadcast, speedId = 'normal') {
  if (!broadcast) return broadcast
  const speed = DRAFT_NIGHT_SPEEDS[speedId] ?? DRAFT_NIGHT_SPEEDS.normal
  return {
    ...broadcast,
    speedId: speed.id,
    frames: broadcast.frames.map((frame) => ({
      ...frame,
      durationMs: Math.round(frame.baseDurationMs * speed.factor),
      clock: {
        ...frame.clock,
        totalMs: Math.round((frame.clock?.baseTotalMs ?? DRAFT_NIGHT_CLOCK_MS) * speed.factor),
      },
    })),
  }
}

/** —— internos —— */

function runDraftCollecting(gm, seasonState, opts = {}) {
  const maxPicksPerTeam = opts.maxPicksPerTeam ?? DRAFT_MAX_PICKS_PER_TEAM
  let state = cloneGmShallow(gm)
  const decisions = []
  const picksLog = []
  const gmSteps = [cloneGmShallow(state)]

  if (!state.draftOrder.length) {
    state.draftOrder = buildDraftOrder(seasonState)
  }

  const rounds = Math.max(
    1,
    Math.ceil((state.draftClass.length || 1) / Math.max(1, TEAMS.length)),
  )
  const cappedRounds = Math.min(rounds, maxPicksPerTeam)
  const naturalSlots = expandDraftPicks(state.draftOrder, cappedRounds, {
    snake: true,
  })
  state.draftPicks = hydrateDraftPicks(state.draftPicks)
  const pickSlots = naturalSlots.map((slot) => {
    const ownerId = resolvePickOwner(
      state.draftPicks,
      slot.teamId,
      slot.round,
      0,
    )
    return { ...slot, originalTeamId: slot.teamId, teamId: ownerId }
  })

  const picksTaken = Object.fromEntries(TEAMS.map((t) => [t.id, 0]))

  for (const slot of pickSlots) {
    if (!state.draftClass.length) break

    const rosterSize = (state.rosters[slot.teamId] ?? []).length
    if (rosterSize >= ROSTER_SIZE_MAX) continue
    if ((picksTaken[slot.teamId] ?? 0) >= maxPicksPerTeam) continue

    const resolved = resolveFranchiseObjective(state, slot.teamId, seasonState)
    const sit = {
      ...resolved.situation,
      objectiveId: resolved.objectiveId,
      objective: resolved.objective,
      weights: resolved.weights,
      personality: {
        ...resolved.situation.personality,
        weights: resolved.weights,
        label: resolved.label,
      },
    }
    const choice = selectProspectForTeam(
      state.draftClass,
      sit,
      state.scouting ?? gm.scouting ?? null,
    )
    if (!choice) break

    const result = draftProspect(state, slot.teamId, choice.id, slot.pickNumber)
    if (!result.ok) continue

    state = result.gm
    picksTaken[slot.teamId] = (picksTaken[slot.teamId] ?? 0) + 1
    decisions.push(result.decision)
    picksLog.push({
      pickNumber: slot.pickNumber,
      round: slot.round,
      teamId: slot.teamId,
      prospectId: choice.id,
      prospectName: choice.nome,
      posicao: choice.posicao,
      universidade: choice.universidade,
      overall: choice.overall,
      potencial: choice.potencial,
      mockRank: choice.mockDraft?.rank ?? null,
      arquetipo: choice.arquetipo,
    })
    gmSteps.push(cloneGmShallow(state))
  }

  const undrafted = enterUndraftedIntoLeague(state)
  state = undrafted.gm
  state.draftComplete = true
  state.draftOrder = []
  state.lastDraft = {
    seasonNumber: seasonState?.seasonNumber ?? null,
    picks: picksLog,
    undraftedIds: undrafted.undraftedIds,
    undraftedCount: undrafted.undraftedIds.length,
  }

  return {
    gm: state,
    decisions,
    picks: picksLog,
    undraftedIds: undrafted.undraftedIds,
    gmSteps,
    summary: `Draft Night: ${picksLog.length} seleção(ões); ${undrafted.undraftedIds.length} undrafted.`,
  }
}

function buildFramesFromRun({
  initialClass,
  picks,
  gmStart,
  gmSteps,
  playerTeamId,
  seasonNumber,
  speedId,
  scouting,
}) {
  const speed = DRAFT_NIGHT_SPEEDS[speedId] ?? DRAFT_NIGHT_SPEEDS.normal
  const frames = []
  let remaining = sortByMockRank(initialClass.map((p) => ({ ...p })))

  // Frame 0 — mesa aberta, primeira franquia no relógio
  frames.push(
    composeFrame({
      index: 0,
      phase: 'on_clock',
      picksSoFar: [],
      lastPick: null,
      remaining,
      nextPickMeta: picks[0] ?? null,
      gmAsOf: gmSteps[0] ?? gmStart,
      playerTeamId,
      seasonNumber,
      scouting,
      speed,
      baseDurationMs: DRAFT_NIGHT_CLOCK_MS,
    }),
  )

  for (let i = 0; i < picks.length; i++) {
    const pick = picks[i]
    remaining = remaining.filter((p) => p.id !== pick.prospectId)
    const gmAsOf = gmSteps[i + 1] ?? gmSteps[gmSteps.length - 1] ?? gmStart

    frames.push(
      composeFrame({
        index: i + 1,
        phase: i === picks.length - 1 ? 'final' : 'reveal',
        picksSoFar: picks.slice(0, i + 1),
        lastPick: pick,
        remaining,
        nextPickMeta: picks[i + 1] ?? null,
        gmAsOf,
        playerTeamId,
        seasonNumber,
        scouting,
        speed,
        baseDurationMs:
          i === picks.length - 1
            ? DRAFT_NIGHT_REVEAL_MS + 800
            : DRAFT_NIGHT_REVEAL_MS + DRAFT_NIGHT_CLOCK_MS * 0.35,
      }),
    )
  }

  return frames
}

function composeFrame({
  index,
  phase,
  picksSoFar,
  lastPick,
  remaining,
  nextPickMeta,
  gmAsOf,
  playerTeamId,
  seasonNumber,
  scouting,
  speed,
  baseDurationMs,
}) {
  const onClockTeamId = nextPickMeta?.teamId ?? null
  const onClockTeam = onClockTeamId ? getTeamById(onClockTeamId) : null
  const sit = onClockTeamId
    ? analyzeFranchise(gmAsOf, onClockTeamId, {
        seasonNumber,
        standings: {},
      })
    : null

  const needs = sit?.needs ?? []
  const focusProspect =
    lastPick != null
      ? remaining.find((p) => p.id === lastPick.prospectId) ??
        stubFromPick(lastPick)
      : remaining[0] ?? null

  // Para análise do pick anunciado, usa o prospect escolhido
  const analysisTarget =
    lastPick != null
      ? stubFromPick(lastPick)
      : focusProspect

  const analysis = analyzeProspect(analysisTarget, {
    scouting,
    teamId: onClockTeamId ?? playerTeamId,
    needs: lastPick ? (sit?.needs ?? needs) : needs,
  })

  // Comparação: top 2 disponíveis (ou last vs próximo)
  let comparison = null
  if (remaining.length >= 2) {
    comparison = compareProspects(remaining[0], remaining[1], {
      scouting,
      teamId: onClockTeamId ?? playerTeamId,
      needs,
    })
  } else if (lastPick && remaining[0]) {
    comparison = compareProspects(stubFromPick(lastPick), remaining[0], {
      scouting,
      teamId: playerTeamId,
      needs,
    })
  }

  const board = getDraftBoard(remaining, {
    scouting,
    teamId: playerTeamId,
  }).slice(0, DRAFT_NIGHT_BOARD_SIZE)

  const mockDraft = sortByMockRank(remaining)
    .slice(0, DRAFT_NIGHT_BOARD_SIZE)
    .map((p, i) => ({
      rank: p.mockDraft?.rank ?? i + 1,
      id: p.id,
      nome: p.nome,
      posicao: p.posicao,
      universidade: p.universidade,
      overall: p.overall,
      potencial: p.potencial,
      notes: p.mockDraft?.notes ?? null,
    }))

  // Mock “original” com picks já feitas marcadas
  const mockFull = buildMockWithResults(initialClassFromRemaining(remaining, picksSoFar), picksSoFar)

  const crowd = buildCrowdReaction(lastPick, {
    isPlayerTeam: lastPick?.teamId === playerTeamId,
    teamShort: lastPick ? getTeamById(lastPick.teamId)?.short : null,
  })

  const news = buildDraftNightNews({
    picksSoFar,
    lastPick,
    nextTeamId: onClockTeamId,
    remaining,
    playerTeamId,
    seasonNumber,
  })

  const franchiseNeeds = onClockTeamId
    ? {
        teamId: onClockTeamId,
        teamShort: onClockTeam?.short ?? onClockTeamId,
        teamName: onClockTeam?.name ?? onClockTeamId,
        needs,
        mode: sit?.mode ?? 'compete',
        rosterSize: sit?.rosterSize ?? 0,
        avgOvr: sit?.avgOvr ?? 0,
        objectiveLabel: sit?.personality?.label ?? null,
        blurb: needs.length
          ? `Prioridade clara: ${needs.join(' · ')}`
          : 'Elenco equilibrado — mira upside / BPA',
      }
    : null

  const clockBase = DRAFT_NIGHT_CLOCK_MS
  const durationMs = Math.round(baseDurationMs * speed.factor)

  return {
    index,
    phase,
    progress:
      picksSoFar.length === 0
        ? 0
        : Math.round((picksSoFar.length / Math.max(1, picksSoFar.length + remaining.length)) * 100),
    pickNumber: lastPick?.pickNumber ?? nextPickMeta?.pickNumber ?? null,
    totalAnnounced: picksSoFar.length,
    remainingCount: remaining.length,
    durationMs,
    baseDurationMs,
    clock: {
      label: phase === 'final' ? 'FINAL' : phase === 'reveal' ? 'ESCOLHA FEITA' : 'NO RELÓGIO',
      teamId: onClockTeamId,
      teamShort: onClockTeam?.short ?? null,
      pickNumber: nextPickMeta?.pickNumber ?? null,
      round: nextPickMeta?.round ?? null,
      totalMs: Math.round(clockBase * speed.factor),
      baseTotalMs: clockBase,
      running: phase === 'on_clock',
    },
    lastPick: lastPick
      ? {
          ...lastPick,
          teamShort: getTeamById(lastPick.teamId)?.short ?? lastPick.teamId,
          teamName: getTeamById(lastPick.teamId)?.name ?? lastPick.teamId,
          isPlayerTeam: lastPick.teamId === playerTeamId,
        }
      : null,
    picks: picksSoFar.map((p) => ({
      ...p,
      teamShort: getTeamById(p.teamId)?.short ?? p.teamId,
      isPlayerTeam: p.teamId === playerTeamId,
    })),
    mockDraft,
    mockBoard: mockFull,
    available: board,
    franchiseNeeds,
    analysis,
    comparison,
    crowd,
    news,
    animation: phase === 'reveal' || phase === 'final' ? 'pick-flash' : 'clock-pulse',
    headline:
      phase === 'final'
        ? 'Draft encerrado — mesa fecha a transmissão'
        : lastPick
          ? `Com a ${lastPick.pickNumber}ª escolha: ${getTeamById(lastPick.teamId)?.short ?? lastPick.teamId} seleciona ${lastPick.prospectName}`
          : onClockTeam
            ? `${onClockTeam.short} está no relógio`
            : 'Draft Night — abertura',
  }
}

function buildMockWithResults(allProspects, picksSoFar) {
  const taken = new Map(picksSoFar.map((p) => [p.prospectId, p]))
  return sortByMockRank(allProspects).map((p, i) => {
    const pick = taken.get(p.id)
    return {
      rank: p.mockDraft?.rank ?? i + 1,
      id: p.id,
      nome: p.nome,
      posicao: p.posicao,
      universidade: p.universidade,
      overall: p.overall,
      potencial: p.potencial,
      notes: p.mockDraft?.notes ?? null,
      drafted: Boolean(pick),
      draftedBy: pick?.teamId ?? null,
      draftedPick: pick?.pickNumber ?? null,
      draftedShort: pick ? getTeamById(pick.teamId)?.short ?? pick.teamId : null,
    }
  })
}

function initialClassFromRemaining(remaining, picksSoFar) {
  return [
    ...remaining,
    ...picksSoFar.map((p) => stubFromPick(p)),
  ]
}

function reconstructGmSteps(gm, picks) {
  // Estado “antes do draft”: remove todos os picks dos elencos
  let base = cloneGmShallow(gm)
  for (const pick of picks) {
    const roster = base.rosters[pick.teamId] ?? []
    base.rosters[pick.teamId] = roster.filter((id) => id !== pick.prospectId)
  }
  base.draftClass = picks.map((p) => resolveProspectEntity(gm, p.prospectId) ?? stubFromPick(p))
  base.draftComplete = false

  const steps = [cloneGmShallow(base)]
  let state = base
  for (const pick of picks) {
    const result = draftProspect(state, pick.teamId, pick.prospectId, pick.pickNumber)
    if (result.ok) state = result.gm
    steps.push(cloneGmShallow(state))
  }
  return steps
}

function enrichPick(pick, gm) {
  const entity = resolveProspectEntity(gm, pick.prospectId)
  return {
    ...pick,
    overall: pick.overall ?? entity?.overall ?? null,
    potencial: pick.potencial ?? entity?.potencial ?? null,
    universidade: pick.universidade ?? entity?.universidade ?? null,
    arquetipo: pick.arquetipo ?? entity?.arquetipo ?? null,
    mockRank: pick.mockRank ?? entity?.mockDraft?.rank ?? null,
  }
}

function resolveProspectEntity(gm, id) {
  if (!id || !gm) return null
  return (
    (gm.extraPlayers ?? []).find((p) => p.id === id) ??
    (gm.draftClass ?? []).find((p) => p.id === id) ??
    null
  )
}

function stubFromPick(pick) {
  return {
    id: pick.prospectId,
    nome: pick.prospectName,
    posicao: pick.posicao,
    universidade: pick.universidade,
    overall: pick.overall ?? 70,
    potencial: pick.potencial ?? 78,
    idade: pick.idade ?? 19,
    arquetipo: pick.arquetipo ?? 'twoWay',
    mockDraft: pick.mockRank
      ? { rank: pick.mockRank, notes: null, consensus: null }
      : null,
  }
}

function briefProspect(p) {
  return {
    id: p.id,
    nome: p.nome,
    posicao: p.posicao,
    mockRank: p.mockDraft?.rank ?? null,
    universidade: p.universidade,
  }
}

function cloneGmShallow(gm) {
  return {
    ...gm,
    draftClass: [...(gm.draftClass ?? [])],
    draftOrder: [...(gm.draftOrder ?? [])],
    draftPicks: (gm.draftPicks ?? []).map((p) => ({ ...p })),
    freeAgents: [...(gm.freeAgents ?? [])],
    extraPlayers: [...(gm.extraPlayers ?? [])],
    contracts: { ...(gm.contracts ?? {}) },
    rosters: Object.fromEntries(
      Object.entries(gm.rosters ?? {}).map(([k, v]) => [k, [...v]]),
    ),
    lastDraft: gm.lastDraft ? { ...gm.lastDraft, picks: [...(gm.lastDraft.picks ?? [])] } : null,
  }
}
