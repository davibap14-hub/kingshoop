import { DRAFT_MAX_PICKS_PER_TEAM } from '../../data/draft/constants'
import { ROSTER_SIZE_MAX } from '../../data/gm/constants'
import { TEAMS } from '../../data/teams'
import { draftProspect } from '../gm/actions'
import { analyzeFranchise } from '../gm/situation'
import { generateDraftClass } from './generate'
import { buildDraftOrder, expandDraftPicks } from './order'
import { selectProspectForTeam } from './select'

/**
 * Executa o Draft completo.
 * Times escolhem por necessidade; ao final, todos entram na liga
 * (draftados nos elencos, não escolhidos como free agents).
 */
export function runDraft(gm, seasonState, rng = Math.random, opts = {}) {
  const maxPicksPerTeam = opts.maxPicksPerTeam ?? DRAFT_MAX_PICKS_PER_TEAM
  let state = {
    ...gm,
    draftClass: [...(gm.draftClass ?? [])],
    draftOrder: [...(gm.draftOrder ?? [])],
    freeAgents: [...(gm.freeAgents ?? [])],
    extraPlayers: [...(gm.extraPlayers ?? [])],
    contracts: { ...(gm.contracts ?? {}) },
    rosters: Object.fromEntries(
      Object.entries(gm.rosters ?? {}).map(([k, v]) => [k, [...v]]),
    ),
  }

  const decisions = []
  const picksLog = []

  if (!state.draftOrder.length) {
    state.draftOrder = buildDraftOrder(seasonState)
  }

  const rounds = Math.max(
    1,
    Math.ceil((state.draftClass.length || 1) / Math.max(1, TEAMS.length)),
  )
  const cappedRounds = Math.min(rounds, maxPicksPerTeam)
  const pickSlots = expandDraftPicks(state.draftOrder, cappedRounds, {
    snake: true,
  })

  const picksTaken = Object.fromEntries(TEAMS.map((t) => [t.id, 0]))

  for (const slot of pickSlots) {
    if (!state.draftClass.length) break

    const rosterSize = (state.rosters[slot.teamId] ?? []).length
    if (rosterSize >= ROSTER_SIZE_MAX) continue
    if ((picksTaken[slot.teamId] ?? 0) >= maxPicksPerTeam) continue

    const sit = analyzeFranchise(state, slot.teamId, seasonState)
    const choice = selectProspectForTeam(state.draftClass, sit, rng)
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
  }

  // Todos os restantes entram na liga como free agents
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
    summary: summarizeDraft(picksLog, undrafted.undraftedIds.length),
  }
}

/**
 * Prospects não escolhidos → freeAgents + extraPlayers (entram na liga).
 */
export function enterUndraftedIntoLeague(gm) {
  const next = {
    ...gm,
    draftClass: [...(gm.draftClass ?? [])],
    freeAgents: [...(gm.freeAgents ?? [])],
    extraPlayers: [...(gm.extraPlayers ?? [])],
  }

  const undrafted = next.draftClass
  const undraftedIds = []

  for (const prospect of undrafted) {
    undraftedIds.push(prospect.id)
    if (!next.extraPlayers.some((p) => p.id === prospect.id)) {
      next.extraPlayers.push({
        ...prospect,
        isProspect: false,
        undrafted: true,
      })
    }
    if (!next.freeAgents.includes(prospect.id)) {
      next.freeAgents.push(prospect.id)
    }
  }

  next.draftClass = []

  return {
    gm: next,
    undraftedIds,
    undraftedPlayers: undrafted,
  }
}

function summarizeDraft(picks, undraftedCount) {
  if (!picks.length && !undraftedCount) {
    return 'Draft sem movimentos.'
  }
  return `Draft: ${picks.length} seleção(ões); ${undraftedCount} undrafted na liga (FA).`
}

/**
 * Pipeline de alto nível: gera classe (se vazia) + executa draft.
 */
export function processDraft(gm, seasonState, rng = Math.random, opts = {}) {
  let state = { ...gm }
  const seasonNumber =
    opts.seasonNumber ?? seasonState?.seasonNumber ?? 1
  const messages = []

  if (!(state.draftClass ?? []).length && !state.draftComplete) {
    state.draftClass = generateDraftClass(seasonNumber, rng)
    messages.push(`Draft Engine: classe ${seasonNumber} gerada (${state.draftClass.length} prospects).`)
  }

  if (state.draftComplete) {
    return {
      gm: state,
      decisions: [],
      picks: [],
      undraftedIds: [],
      messages: ['Draft Engine: draft já concluído.'],
      summary: 'Draft já concluído.',
    }
  }

  const result = runDraft(state, seasonState, rng, opts)
  messages.push(result.summary)
  for (const p of result.picks.slice(0, 6)) {
    messages.push(
      `#${p.pickNumber} ${p.teamId.toUpperCase()}: ${p.prospectName} (${p.posicao}, ${p.universidade})`,
    )
  }

  return { ...result, messages }
}
