/**
 * Analytics Engine — estatísticas avançadas.
 *
 * PER · True Shooting % · Effective FG % · Usage % · Assist % ·
 * Rebound % · Offensive Rating · Defensive Rating · Net Rating ·
 * Win Shares · Player Impact Estimate
 *
 * Todos os cálculos são puros (Engine). A Interface só exibe.
 */

export {
  ANALYTICS_METRICS,
  ANALYTICS_METRIC_IDS,
  ANALYTICS_LEAGUE,
  FTA_POSSESSION_FACTOR,
} from '../../data/analytics'

export {
  trueShootingPct,
  effectiveFgPct,
  usagePct,
  assistPct,
  reboundPct,
  estimatePossessions,
  offensiveRating,
  defensiveRating,
  netRating,
  playerEfficiencyRating,
  playerImpactEstimate,
  winShares,
  computeAdvancedStats,
} from './metrics.js'

export { analyzeGameBox, summarizeTeamBox } from './game.js'
export {
  createAnalyticsState,
  createPlayerAnalytics,
  emptyCountingTotals,
  emptyAdvancedAverages,
} from './state.js'
export {
  accumulateAnalyticsMap,
  recomputeAveragesFromTotals,
  attachTeamContext,
} from './aggregate.js'
export { processWeeklyAnalytics, analyzeWeekResult } from './weekly.js'
export { getAnalyticsView } from './view.js'
