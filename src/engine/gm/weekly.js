import {
  DRAFT_REVEAL_WEEK,
  DRAFT_RUN_WEEK_END,
  DRAFT_RUN_WEEK_START,
} from '../../data/draft/constants'
import { SEASON_PHASES } from '../../data/season/constants'
import { TEAMS } from '../../data/teams'
import { generateDraftClass, processDraft } from '../draft'
import { getDraftBoard } from '../draft/select'
import { updateAllFranchiseObjectives } from '../franchise/objective'
import { processWeeklyScouting } from '../scouting'
import { ensureGmForActiveLeague } from '../expansion/ensure.js'
import { hydrateDraftPicks, rollDraftPicksAfterSeason } from '../trade/picks.js'
import { appendGmLog, createGmState } from './state'
import { decideForTeam } from './decide'

/**
 * Pipeline semanal do General Manager Engine.
 * Decisões automáticas por franquia, influenciadas pela personalidade
 * e pela situação (standings, teto, idade, necessidades).
 * Draft é orquestrado pela Draft Engine.
 */
export function processWeeklyGm(state, opts = {}) {
  const rng = opts.rng ?? Math.random
  const week = opts.week ?? state.currentWeek
  const phase = opts.phase ?? state.season?.phase ?? SEASON_PHASES.regular
  const seasonNumber = state.season?.seasonNumber ?? state.currentSeason ?? 1
  const seasonRolled = Boolean(opts.seasonRolled)

  let gm = ensureGmForActiveLeague(createGmState(state.gm ?? {}), {
    seasonNumber,
  })
  const messages = []
  const weekDecisions = []
  const draftClassSize = Math.max(18, TEAMS.length * 3)

  if (seasonRolled) {
    gm = rollGmContracts(gm)
    gm.draftClass = generateDraftClass(seasonNumber, rng, {
      classSize: draftClassSize,
    })
    gm.draftComplete = false
    gm.draftOrder = []
    gm.lastDraft = null
    gm.draftPicks = rollDraftPicksAfterSeason(gm.draftPicks)
    gm = ensureGmForActiveLeague(gm, { seasonNumber })
    messages.push(
      `Draft Engine: nova classe ${seasonNumber} (${gm.draftClass.length} prospects + Mock Draft).`,
    )
    messages.push('Trade Engine: escolhas de draft roladas para o novo ciclo.')
  } else {
    gm.draftPicks = hydrateDraftPicks(gm.draftPicks)
  }

  // Garante draft class na entrada da offseason
  if (
    phase === SEASON_PHASES.offseason &&
    week === DRAFT_REVEAL_WEEK &&
    !(gm.draftClass ?? []).length &&
    !gm.draftComplete
  ) {
    gm.draftClass = generateDraftClass(seasonNumber, rng, {
      classSize: draftClassSize,
    })
    messages.push(
      `Draft Engine: classe revelada — Mock Draft #1 ${gm.draftClass[0]?.nome ?? '—'}.`,
    )
  }

  const seasonState = {
    ...(state.season ?? {}),
    currentWeek: week,
    phase,
    seasonNumber,
  }

  // Franchise AI — atualiza objetivos conforme resultados
  const objUpdate = updateAllFranchiseObjectives(gm, seasonState)
  gm = objUpdate.gm
  for (const change of objUpdate.changes.slice(0, 4)) {
    messages.push(
      `Franchise AI: ${change.teamId.toUpperCase()} ${change.from} → ${change.to} (${change.reason}).`,
    )
  }

  // Scouting Engine — investimento + relatórios (antes de Draft/FA)
  const scoutResult = processWeeklyScouting({
    scouting: gm.scouting,
    gm,
    seasonState,
    week,
    seasonNumber,
    phase,
    seasonRolled,
  })
  gm = scoutResult.gm
  messages.push(...scoutResult.messages)

  // Draft Engine — semanas 45–46 (IA usa relatórios de scouting)
  if (
    phase === SEASON_PHASES.offseason &&
    week >= DRAFT_RUN_WEEK_START &&
    week <= DRAFT_RUN_WEEK_END &&
    !gm.draftComplete &&
    (gm.draftClass ?? []).length > 0
  ) {
    const draft = processDraft(gm, seasonState, rng, { seasonNumber })
    gm = draft.gm
    weekDecisions.push(...(draft.decisions ?? []))
    messages.push(...(draft.messages ?? []))
  }

  // Franchise AI — mercado FA (também consome Scouting Engine)
  const marketWeek =
    phase === SEASON_PHASES.offseason ||
    phase === SEASON_PHASES.awards ||
    (phase === SEASON_PHASES.regular && week % 6 === 0)

  if (marketWeek) {
    for (const team of TEAMS) {
      const result = decideForTeam(gm, team.id, seasonState)
      gm = result.gm
      weekDecisions.push(...result.decisions)
    }
  }

  if (weekDecisions.length) {
    messages.push(`GM: ${weekDecisions.length} decisão(ões) na semana ${week}.`)
    for (const d of weekDecisions.slice(0, 6)) {
      messages.push(formatDecision(d))
    }
  } else if (phase === SEASON_PHASES.offseason) {
    messages.push('GM: mercado calmo nesta semana.')
  }

  gm = {
    ...gm,
    lastWeekDecisions: weekDecisions,
    log: appendGmLog(gm.log, weekDecisions),
  }

  return {
    gm,
    decisions: weekDecisions,
    messages,
    summary: {
      week,
      phase,
      decisionsCount: weekDecisions.length,
      decisions: weekDecisions,
      personalities: gm.personalities,
      freeAgents: gm.freeAgents.length,
      draftRemaining: (gm.draftClass ?? []).length,
      draftComplete: gm.draftComplete,
      scouting: scoutResult.summary,
    },
  }
}

function rollGmContracts(gm) {
  const contracts = {}
  const freeAgents = [...(gm.freeAgents ?? [])]
  const rosters = Object.fromEntries(
    Object.entries(gm.rosters ?? {}).map(([k, v]) => [k, [...v]]),
  )

  for (const [playerId, contract] of Object.entries(gm.contracts ?? {})) {
    const years = (contract.yearsRemaining ?? 1) - 1
    if (years <= 0) {
      // vira FA
      const teamId = contract.teamId
      rosters[teamId] = (rosters[teamId] ?? []).filter((id) => id !== playerId)
      if (!freeAgents.includes(playerId)) freeAgents.push(playerId)
    } else {
      contracts[playerId] = { ...contract, yearsRemaining: years }
    }
  }

  return { ...gm, contracts, rosters, freeAgents }
}

function formatDecision(d) {
  switch (d.type) {
    case 'sign':
      return `${d.teamId}: contrata ${d.playerName}`
    case 'release':
      return `${d.teamId}: dispensa ${d.playerName}`
    case 'renew':
      return `${d.teamId}: renova ${d.playerName}`
    case 'trade':
      return `${d.teamId}: troca ${d.assetsSummary ?? `${d.playerName} por ${d.acquiredName}`} (${d.partnerId})`
    case 'draft':
      return `${d.teamId}: draft #${d.pickNumber} ${d.playerName}${
        d.universidade ? ` (${d.universidade})` : ''
      }`
    case 'expansion':
      return `Expansão: ${(d.teamIds ?? []).join(', ').toUpperCase()} entram na liga`
    case 'expansion_draft':
      return `${d.teamId}: Expansion Draft #${d.pickNumber} ${d.playerName} (de ${d.fromTeamId})`
    default:
      return `${d.teamId ?? 'liga'}: ${d.type}`
  }
}

/** Visão read-only para a Interface */
export function getGmView(gm, opts = {}) {
  if (!gm) return null
  const teamId = opts.teamId
  return {
    personalities: gm.personalities,
    objectives: gm.objectives ?? {},
    rosters: gm.rosters,
    freeAgentsCount: gm.freeAgents?.length ?? 0,
    draftRemaining: gm.draftClass?.length ?? 0,
    draftComplete: gm.draftComplete,
    draftBoard: getDraftBoard(gm.draftClass ?? [], {
      scouting: gm.scouting,
      teamId,
    }).slice(0, 12),
    lastDraft: gm.lastDraft ?? null,
    lastWeekDecisions: gm.lastWeekDecisions ?? [],
    recentLog: (gm.log ?? []).slice(-12).reverse(),
    teamRoster: teamId ? gm.rosters?.[teamId] ?? [] : [],
    teamPersonality: teamId ? gm.personalities?.[teamId] : null,
    teamObjective: teamId ? gm.objectives?.[teamId] ?? null : null,
    teamContracts: teamId
      ? Object.values(gm.contracts ?? {}).filter((c) => c.teamId === teamId)
      : [],
  }
}
