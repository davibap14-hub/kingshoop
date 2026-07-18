import {
  DEFAULT_SCOUTING_INVESTMENT,
  SCOUTING_BY_OBJECTIVE,
  SCOUTING_WEEKLY_GAIN,
} from '../../data/scouting'
import { SEASON_PHASES } from '../../data/season/constants'
import {
  DRAFT_REVEAL_WEEK,
  DRAFT_RUN_WEEK_END,
  DRAFT_RUN_WEEK_START,
} from '../../data/draft/constants'
import { TEAMS } from '../../data/teams'
import { resolveFranchiseObjective } from '../franchise/objective'
import { resolvePlayer } from '../gm/situation'
import { buildScoutReport } from './report.js'
import {
  createScoutingState,
  getTeamInvestment,
  setReport,
  setTeamInvestment,
} from './state.js'

/**
 * Ajusta investimento de scouting da franquia (objetivo + fase).
 */
export function updateTeamInvestment(scouting, teamId, context = {}) {
  const objectiveId = context.objectiveId ?? 'playoffs'
  const phase = context.phase ?? SEASON_PHASES.regular
  const week = context.week ?? 1
  const base =
    SCOUTING_BY_OBJECTIVE[objectiveId] ?? DEFAULT_SCOUTING_INVESTMENT

  let inv = getTeamInvestment(scouting, teamId)
  // Puxa em direção ao alvo do objetivo (pesos, não reset duro)
  inv = Math.round(inv * 0.85 + base * 0.15)

  let gain = SCOUTING_WEEKLY_GAIN.regular
  if (phase === SEASON_PHASES.offseason) {
    gain = SCOUTING_WEEKLY_GAIN.offseason
  }
  if (
    phase === SEASON_PHASES.offseason &&
    week >= DRAFT_REVEAL_WEEK &&
    week <= DRAFT_RUN_WEEK_END
  ) {
    gain = SCOUTING_WEEKLY_GAIN.draftWindow
  }

  return setTeamInvestment(scouting, teamId, inv + gain)
}

/**
 * Atualiza relatórios de um time sobre uma lista de jogadores.
 */
export function scoutPlayersForTeam(
  scouting,
  teamId,
  players,
  opts = {},
) {
  let state = createScoutingState(scouting)
  const investment = getTeamInvestment(state, teamId)

  for (const player of players) {
    if (!player?.id) continue
    const report = buildScoutReport(player, teamId, investment, {
      week: opts.week,
      seasonNumber: opts.seasonNumber,
      focusBonus: player.isProspect ? 12 : 4,
    })
    if (report) {
      state = setReport(state, teamId, player.id, report)
    }
  }

  return state
}

/**
 * Pipeline semanal da Scouting Engine.
 * Investimento ↑ → relatórios mais precisos para Draft e FA.
 */
export function processWeeklyScouting({
  scouting,
  gm,
  seasonState = {},
  week = null,
  seasonNumber = null,
  phase = null,
  seasonRolled = false,
} = {}) {
  const messages = []
  let state = createScoutingState(scouting ?? gm?.scouting)
  const w = week ?? seasonState.currentWeek ?? 1
  const sn = seasonNumber ?? seasonState.seasonNumber ?? 1
  const ph = phase ?? seasonState.phase ?? SEASON_PHASES.regular

  if (seasonRolled) {
    // Mantém investimento; limpa reports antigos de prospects
    state = {
      ...state,
      reports: {},
      lastUpdate: Date.now(),
    }
    messages.push('Scouting Engine: relatórios resetados para nova temporada.')
  }

  const draftClass = gm?.draftClass ?? []
  const faIds = gm?.freeAgents ?? []
  const freeAgents = faIds
    .map((id) => resolvePlayer(gm, id))
    .filter(Boolean)

  let reportsUpdated = 0

  for (const team of TEAMS) {
    const resolved = resolveFranchiseObjective(gm, team.id, {
      ...seasonState,
      currentWeek: w,
      phase: ph,
      seasonNumber: sn,
    })
    state = updateTeamInvestment(state, team.id, {
      objectiveId: resolved.objectiveId,
      phase: ph,
      week: w,
    })

    // Observa classe de draft + free agents
    const targets = [...draftClass, ...freeAgents]
    if (!targets.length) continue

    const before = Object.keys(state.reports[team.id] ?? {}).length
    state = scoutPlayersForTeam(state, team.id, targets, {
      week: w,
      seasonNumber: sn,
    })
    const after = Object.keys(state.reports[team.id] ?? {}).length
    reportsUpdated += Math.max(0, after - before)
  }

  // Janela de draft: reforça scouting da classe
  if (
    ph === SEASON_PHASES.offseason &&
    w >= DRAFT_RUN_WEEK_START &&
    w <= DRAFT_RUN_WEEK_END &&
    draftClass.length
  ) {
    messages.push(
      `Scouting Engine: cobertura intensiva da classe (${draftClass.length} prospects).`,
    )
  } else if (reportsUpdated > 0) {
    messages.push(
      `Scouting Engine: ${reportsUpdated} novos relatórios na liga.`,
    )
  }

  state = { ...state, lastUpdate: Date.now() }

  return {
    scouting: state,
    gm: gm ? { ...gm, scouting: state } : gm,
    messages,
    summary: {
      teams: TEAMS.length,
      draftProspects: draftClass.length,
      freeAgents: freeAgents.length,
      reportCount: Object.values(state.reports).reduce(
        (n, bag) => n + Object.keys(bag ?? {}).length,
        0,
      ),
    },
  }
}
