/**
 * Visão read-only da Analytics Engine para a Interface.
 */

import { ANALYTICS_METRICS } from '../../data/analytics'
import { createAnalyticsState } from './state.js'

/**
 * @param {object} state — career state (ou { analytics, player, currentTeamId })
 */
export function getAnalyticsView(state = {}) {
  const analytics = createAnalyticsState(state.analytics ?? {})
  const careerPlayerId = state.player?.id ?? 'career_player'
  const teamId = state.currentTeamId ?? null

  const seasonList = Object.values(analytics.season ?? {})
  const careerEntry =
    analytics.season?.[careerPlayerId] ??
    analytics.career?.[careerPlayerId] ??
    null

  const teamSeason = teamId
    ? seasonList.filter((p) => p.teamId === teamId)
    : []

  const leagueLeaders = [...seasonList]
    .filter((p) => p.averages?.per != null)
    .sort((a, b) => (b.averages.per ?? 0) - (a.averages.per ?? 0))
    .slice(0, 10)
    .map(toLeaderRow)

  const teamLeaders = [...teamSeason]
    .filter((p) => p.averages?.per != null)
    .sort((a, b) => (b.averages.per ?? 0) - (a.averages.per ?? 0))
    .slice(0, 8)
    .map(toLeaderRow)

  return {
    metrics: Object.values(ANALYTICS_METRICS),
    careerPlayer: careerEntry
      ? {
          playerId: careerEntry.playerId,
          playerName: careerEntry.playerName,
          teamId: careerEntry.teamId,
          games: careerEntry.totals?.games ?? 0,
          averages: careerEntry.averages,
          lastGame: careerEntry.lastGame,
          counting: {
            pts: careerEntry.totals?.pts ?? 0,
            reb: careerEntry.totals?.reb ?? 0,
            ast: careerEntry.totals?.ast ?? 0,
            stl: careerEntry.totals?.stl ?? 0,
            blk: careerEntry.totals?.blk ?? 0,
            tov: careerEntry.totals?.tov ?? 0,
            fgm: careerEntry.totals?.fgm ?? 0,
            fga: careerEntry.totals?.fga ?? 0,
            threePm: careerEntry.totals?.threePm ?? 0,
            ftm: careerEntry.totals?.ftm ?? 0,
            fta: careerEntry.totals?.fta ?? 0,
          },
        }
      : null,
    leagueLeaders,
    teamLeaders,
    lastWeek: analytics.lastWeek,
    seasonNumber: analytics.seasonNumber,
    playersTracked: seasonList.length,
    tip: 'PER · TS% · eFG% · USG% · AST% · REB% · ORtg · DRtg · Net · WS · PIE',
  }
}

function toLeaderRow(p) {
  return {
    playerId: p.playerId,
    playerName: p.playerName,
    teamId: p.teamId,
    games: p.totals?.games ?? 0,
    per: p.averages?.per,
    tsPct: p.averages?.tsPct,
    efgPct: p.averages?.efgPct,
    usgPct: p.averages?.usgPct,
    astPct: p.averages?.astPct,
    rebPct: p.averages?.rebPct,
    ortg: p.averages?.ortg,
    drtg: p.averages?.drtg,
    netRtg: p.averages?.netRtg,
    winShares: p.averages?.winShares,
    pie: p.averages?.pie,
  }
}
