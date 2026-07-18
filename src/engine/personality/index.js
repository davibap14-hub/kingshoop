/**
 * Personality Engine — API pública.
 *
 * Cada jogador possui traços 0–100:
 * Competitividade, Ego, Liderança, Lealdade, Temperamento,
 * Ambição, Disciplina, Confiança.
 *
 * Influencia: química, contratos, trocas, desenvolvimento,
 * eventos e escolhas do jogador.
 */

export {
  PERSONALITY_KEYS,
  PERSONALITY_LABELS,
  PERSONALITY_INFLUENCES,
} from '../../data/personality/constants'

export {
  trait,
  ensurePersonality,
  getPersonality,
  listPersonalityTraits,
  traitBias,
} from './traits'

export {
  calcRosterChemistry,
  calcTeammateChemistryDelta,
} from './chemistry'

export {
  calcXpPersonalityMultiplier,
  calcTrainingPersonalityMultiplier,
  applyPersonalityToXp,
} from './development'

export {
  calcSalaryDemandFactor,
  calcRenewWillingness,
  calcTradeWillingness,
  personalityContractScore,
} from './contracts'

export {
  calcEventWeightMultiplier,
  matchesPersonalityConditions,
  scoreChoiceAffinity,
  sortChoicesByPersonality,
  applyPersonalityToChoiceEffects,
} from './events'

export {
  scoreActivityPreference,
  sortActivitiesByPersonality,
  suggestWeeklyActivity,
} from './choices'
