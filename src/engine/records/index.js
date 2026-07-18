/**
 * Records Engine — controla todos os recordes da liga.
 *
 * Pontos · Rebotes · Assistências · Roubos · Tocos ·
 * Triple Doubles · Vitórias · Temporadas · Sequências ·
 * Recordes de franquia · Recordes da NBA.
 *
 * Ao quebrar: History · News · Achievements · Legacy.
 * Sem Interface obrigatória.
 */

export {
  RECORDS_VERSION,
  RECORD_SCOPES,
  RECORD_BUCKETS,
  MAX_RECORD_BREAKS_PER_WEEK,
  HISTORY_RECORD_MIRROR,
  RECORD_DEFS,
  recordDefId,
  findRecordDef,
  labelForRecord,
} from '../../data/records'

export {
  createEmptyRecordBook,
  createEmptyTrackers,
  createRecordsState,
  hydrateRecordsState,
  migrateFromHistoryRecords,
  ensureFranchiseBook,
  getBookEntry,
} from './state.js'

export {
  accumulateSeasonTrackers,
  extractGameCandidates,
  extractSeasonCandidates,
  extractStreakCandidates,
  extractCareerCandidates,
} from './extract.js'

export {
  applyCandidatesToBook,
  evaluateRecordBreaks,
  countRecordsHeld,
} from './evaluate.js'

export {
  syncRecordsToHistory,
  buildRecordDecisions,
} from './sync.js'

export { processWeeklyRecords } from './weekly.js'
export { getRecordsView } from './view.js'
