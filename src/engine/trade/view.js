import { getTeamById } from '../../data/teams'
import { calcPickMarketValue, getTeamPicks, hydrateDraftPicks } from './picks.js'
import { listRosterMarketValues } from './value.js'

/**
 * Visão somente leitura da Trade Engine para a Interface.
 */
export function getTradeView(state = {}) {
  const gm = state.gm
  if (!gm) {
    return { available: false, message: 'GM não inicializado.' }
  }

  const teamId = state.currentTeamId ?? state.teamId
  const seasonState = {
    ...(state.season ?? {}),
    seasonNumber: state.season?.seasonNumber ?? state.currentSeason ?? 1,
  }

  const draftPicks = hydrateDraftPicks(gm.draftPicks)
  const teamPicks = teamId ? getTeamPicks(draftPicks, teamId) : []
  const market = teamId
    ? listRosterMarketValues(gm, teamId, seasonState).slice(0, 8)
    : []

  const recent = (gm.lastTrades ?? gm.lastWeekDecisions ?? [])
    .filter((d) => d.type === 'trade')
    .slice(-8)
    .reverse()
    .map(formatTradeRow)

  const weekTrades = (state.lastWeekResult?.gm?.decisions ??
    state.weekEffects?.gm?.decisions ??
    [])
    .filter((d) => d.type === 'trade')
    .map(formatTradeRow)

  return {
    available: true,
    teamId,
    teamShort: getTeamById(teamId)?.short ?? teamId,
    marketValues: market,
    draftPicks: teamPicks.map((p) => ({
      id: p.id,
      label: `R${p.round} · Y+${p.seasonOffset}`,
      originalTeamId: p.originalTeamId,
      originalShort: getTeamById(p.originalTeamId)?.short ?? p.originalTeamId,
      ownerTeamId: p.ownerTeamId,
      round: p.round,
      seasonOffset: p.seasonOffset,
      value: calcPickMarketValue(p, seasonState),
      traded: p.ownerTeamId !== p.originalTeamId,
    })),
    recentTrades: recent,
    weekTrades,
    rules: {
      maxPlayersPerSide: 3,
      maxPicksPerSide: 2,
      maxValueRatio: 1.22,
      salaryMatch: '125% + $5M',
    },
  }
}

function formatTradeRow(d) {
  return {
    teamId: d.teamId,
    partnerId: d.partnerId,
    teamShort: getTeamById(d.teamId)?.short ?? d.teamId,
    partnerShort: getTeamById(d.partnerId)?.short ?? d.partnerId,
    summary: d.assetsSummary ?? `${d.playerName} ⇄ ${d.acquiredName}`,
    reason: d.reason ?? '',
    fairness: d.fairness,
    sentPlayers: d.sent?.players?.length ?? (d.playerId ? 1 : 0),
    receivedPlayers: d.received?.players?.length ?? (d.acquiredId ? 1 : 0),
    sentPicks: d.sent?.picks?.length ?? 0,
    receivedPicks: d.received?.picks?.length ?? 0,
    at: d.at ?? null,
  }
}
