import { SEASON_PHASES } from '../../data/season/constants'
import { TEAMS } from '../../data/teams'
import { appendGmLog, createGmState, generateDraftClass } from './state'
import { decideForTeam, runDraft } from './decide'

/**
 * Pipeline semanal do General Manager Engine.
 * Decisões automáticas por franquia, influenciadas pela personalidade
 * e pela situação (standings, teto, idade, necessidades).
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
    messages.push('GM: nova temporada — contratos atualizados e draft board gerado.')
  }

  // Garante draft class na entrada da offseason
  if (
    phase === SEASON_PHASES.offseason &&
    week === 44 &&
    !(gm.draftClass ?? []).length &&
    !gm.draftComplete
  ) {
    gm.draftClass = generateDraftClass(seasonNumber, rng)
    messages.push('GM: classe de draft revelada.')
  }

  const seasonState = state.season ?? {}

  // Draft na semana 45 (se ainda não feito)
  if (
    phase === SEASON_PHASES.offseason &&
    week >= 45 &&
    week <= 46 &&
    !gm.draftComplete &&
    (gm.draftClass ?? []).length > 0
  ) {
    const draft = runDraft(gm, seasonState, rng)
    gm = draft.gm
    weekDecisions.push(...draft.decisions)
    messages.push(`Draft NBA: ${draft.decisions.length} picks realizados.`)
    for (const d of draft.decisions.slice(0, 4)) {
      messages.push(
        `${d.teamId.toUpperCase()} seleciona ${d.playerName} (#${d.pickNumber}).`,
      )
    }
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
      return `${d.teamId}: draft ${d.playerName} (#${d.pickNumber})`
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
    lastWeekDecisions: gm.lastWeekDecisions ?? [],
    recentLog: (gm.log ?? []).slice(-12).reverse(),
    teamRoster: teamId ? gm.rosters?.[teamId] ?? [] : [],
    teamPersonality: teamId ? gm.personalities?.[teamId] : null,
    teamContracts: teamId
      ? Object.values(gm.contracts ?? {}).filter((c) => c.teamId === teamId)
      : [],
  }
}
