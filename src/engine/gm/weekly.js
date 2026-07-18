import {
  DRAFT_REVEAL_WEEK,
  DRAFT_RUN_WEEK_END,
  DRAFT_RUN_WEEK_START,
} from '../../data/draft/constants'
import { SEASON_PHASES } from '../../data/season/constants'
import { TEAMS } from '../../data/teams'
import { generateDraftClass, processDraft } from '../draft'
import { getDraftBoard } from '../draft/select'
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

  let gm = createGmState(state.gm ?? {})
  const messages = []
  const weekDecisions = []

  if (seasonRolled) {
    gm = rollGmContracts(gm)
    gm.draftClass = generateDraftClass(seasonNumber, rng)
    gm.draftComplete = false
    gm.draftOrder = []
    gm.lastDraft = null
    messages.push(
      `Draft Engine: nova classe ${seasonNumber} (${gm.draftClass.length} prospects + Mock Draft).`,
    )
  }

  // Garante draft class na entrada da offseason
  if (
    phase === SEASON_PHASES.offseason &&
    week === DRAFT_REVEAL_WEEK &&
    !(gm.draftClass ?? []).length &&
    !gm.draftComplete
  ) {
    gm.draftClass = generateDraftClass(seasonNumber, rng)
    messages.push(
      `Draft Engine: classe revelada — Mock Draft #1 ${gm.draftClass[0]?.nome ?? '—'}.`,
    )
  }

  const seasonState = state.season ?? {}

  // Draft Engine — semanas 45–46
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

  // Decisões de mercado: offseason intensa; temporada regular mais rara
  const marketWeek =
    phase === SEASON_PHASES.offseason ||
    phase === SEASON_PHASES.awards ||
    (phase === SEASON_PHASES.regular && week % 6 === 0)

  if (marketWeek) {
    for (const team of TEAMS) {
      // Pula o time do jogador em decisões automáticas agressivas? 
      // Requisitos: cada franquia decide — inclui o time do jogador (liga viva).
      const result = decideForTeam(gm, team.id, seasonState, rng)
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
      return `${d.teamId}: troca ${d.playerName} por ${d.acquiredName} (${d.partnerId})`
    case 'draft':
      return `${d.teamId}: draft #${d.pickNumber} ${d.playerName}${
        d.universidade ? ` (${d.universidade})` : ''
      }`
    default:
      return `${d.teamId}: ${d.type}`
  }
}

/** Visão read-only para a Interface */
export function getGmView(gm, opts = {}) {
  if (!gm) return null
  const teamId = opts.teamId
  return {
    personalities: gm.personalities,
    rosters: gm.rosters,
    freeAgentsCount: gm.freeAgents?.length ?? 0,
    draftRemaining: gm.draftClass?.length ?? 0,
    draftComplete: gm.draftComplete,
    draftBoard: getDraftBoard(gm.draftClass ?? []).slice(0, 12),
    lastDraft: gm.lastDraft ?? null,
    lastWeekDecisions: gm.lastWeekDecisions ?? [],
    recentLog: (gm.log ?? []).slice(-12).reverse(),
    teamRoster: teamId ? gm.rosters?.[teamId] ?? [] : [],
    teamPersonality: teamId ? gm.personalities?.[teamId] : null,
    teamContracts: teamId
      ? Object.values(gm.contracts ?? {}).filter((c) => c.teamId === teamId)
      : [],
  }
}
