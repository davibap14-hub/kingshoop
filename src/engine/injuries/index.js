/**
 * Injury Engine — risco, histórico, condição, minutos, fadiga.
 *
 * Tipos: Leve · Moderada · Grave
 * Cada lesão: tempo estimado, chance de recaída,
 * redução temporária de atributos, tratamento.
 *
 * Recuperação ponderada por: equipe médica, descanso, idade, condição física.
 *
 * Toda lógica fica na Engine — a Interface só lê via getInjuryView.
 */

export {
  INJURY_SEVERITY,
  INJURY_TREATMENTS,
  INJURY_CATALOG,
  RECOVERY_WEIGHTS,
  RISK_WEIGHTS,
  DEFAULT_MEDICAL_STAFF,
} from '../../data/injuries'

export {
  createInjuryProfile,
  createInjuryEngineState,
  hydrateInjuryEngine,
  normalizeLegacyInjury,
  toLegacyInjury,
  appendInjuryHistory,
  clampCondition,
  clampFatigue,
  clampRisk,
} from './state.js'

export { recalcInjuryProfile, calcSafetyScore } from './risk.js'

export {
  pickInjuryType,
  createInjuryInstance,
  rollInjuryEvent,
} from './roll.js'

export { calcRecoveryWeeks, tickInjuryRecovery } from './recovery.js'

export {
  getInjuryAttributeModifiers,
  applyInjuryToPlayer,
  injuryFatigueForTeam,
  careerInjurySimFatigue,
} from './effects.js'

export { processLeagueInjuries } from './league.js'
export { processWeeklyInjuries } from './weekly.js'
export { getInjuryView } from './view.js'
