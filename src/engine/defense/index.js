/**
 * Defensive Engine — defesa coletiva em toda posse.
 * Nunca importa React / Interface.
 */

export {
  clampDefenseBias,
  resolveCoachDefenseBias,
  ensureCoachDefenseBias,
} from './preferences.js'

export { readOffensiveThreat } from './threat.js'
export { buildDefenseEffects, contestModifierForShot } from './effects.js'
export { decideDefensiveScheme, adaptDefenseToSet } from './decide.js'
export { processWeeklyDefense } from './weekly.js'
export { getDefenseView } from './view.js'
