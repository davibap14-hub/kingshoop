/**
 * Legacy Engine — legado de carreira e Legacy Score.
 * Influencia Hall da Fama, popularidade, valor histórico, narrativas e ranking.
 * Sem Interface obrigatória.
 */

export {
  LEGACY_SCORE_WEIGHTS,
  LEGACY_TIERS,
  LEGACY_HOF_BLEND,
  LEGACY_RANKING_SIZE,
} from '../../data/legacy'

export {
  createLegacyState,
  hydrateLegacyState,
  getPlayerLegacy,
  resolveLegacyTier,
} from './state.js'

export { gatherLegacyInputs } from './inputs.js'

export {
  calculateLegacyScore,
  blendLegacyIntoHofScore,
} from './score.js'

export { processWeeklyLegacy, getLegacyView } from './weekly.js'
