/**
 * Fatigue Engine — carga física avançada (partida / semana / temporada).
 * Nunca importa React / Interface.
 */

export {
  clampFatigueValue,
  createFatigueState,
  hydrateFatigueState,
} from './state.js'

export {
  calcCompositeFatigue,
  buildFatigueEffects,
  applyFatigueToPlayer,
} from './effects.js'

export { calcWeeklyRecovery, applyRecoveryToComponents } from './recover.js'
export { analyzeWeekScheduleLoad, teamScheduleFatigue } from './schedule.js'
export {
  processWeeklyFatigue,
  getTrainingFatigueMultiplier,
} from './weekly.js'
export {
  resolveSideGameFatigue,
  calcInGameFatigue,
  buildInGameFatigueEffects,
  withFatigueLineup,
} from './game.js'
export { getFatigueView } from './view.js'
