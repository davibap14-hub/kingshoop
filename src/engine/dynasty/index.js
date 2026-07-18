/**
 * Dynasty Engine — identifica dinastias históricas automaticamente.
 * News · Achievements · History · reputação · contratações.
 * Sem Interface.
 */

export {
  DYNASTY_WINDOW_SEASONS,
  DYNASTY_TIERS,
  DYNASTY_CRITERIA_WEIGHTS,
} from '../../data/dynasty'

export {
  createDynastyState,
  hydrateDynastyState,
  getFranchiseReputation,
  getActiveDynasty,
  listActiveDynasties,
} from './state.js'

export {
  extractTeamSeasonSignals,
  calcFinalsStreak,
  evaluateTeamDynasty,
  detectDynasties,
  dynastyKey,
} from './detect.js'

export {
  applyDynastyReputation,
  getDynastySigningBias,
  applyDynastyToWeights,
  dynastyFaScoreBonus,
} from './effects.js'

export { processWeeklyDynasty } from './weekly.js'
