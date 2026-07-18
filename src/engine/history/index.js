/**
 * History Engine — arquivo permanente da liga.
 *
 * Salva entre temporadas (nunca descarta):
 * MVPs · Campeões · Estatísticas · Líderes · Recordes ·
 * Hall da Fama · Aposentadorias · Premiações
 */

export {
  HISTORY_KEEP_ALL_SEASONS,
  HOF_THRESHOLDS,
  RECORD_KEYS,
  RECORD_LABELS,
} from '../../data/history'

export {
  createLeagueHistory,
  createEmptyRecords,
  cloneHistory,
} from './state.js'

export { computeSeasonLeaders, computeSeasonStats } from './leaders.js'
export {
  updateLeagueRecords,
  extractRecordCandidatesFromWeek,
  extractRecordCandidatesFromSeasonArchive,
} from './records.js'
export { buildSeasonArchive, appendSeasonToHistory } from './archive.js'
export {
  evaluateHallOfFame,
  createHofEntry,
  isInHallOfFame,
  getHofBallot,
} from './hof.js'
export {
  extractRetirementsFromGm,
  appendRetirements,
} from './retirements.js'
export { accumulateWeekTotals } from './totals.js'
export { processWeeklyHistory } from './weekly.js'
export { getHistoryView } from './view.js'
