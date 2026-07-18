/**
 * Simulation Engine — API pública.
 *
 * - events: micro-eventos de carreira (legado)
 * - game: simulação completa posse a posse com Play-by-Play
 *
 * Cada posse usa pesos combinados de atributos + Tendências (0–100):
 * Shoot3, Drive, Pass, Isolation, Post Up, Fast Break, Alley Oop,
 * Step Back, Fadeaway.
 */

export { rollWeeklyEvent } from './events'

export { simulateGame, simulateMatch } from './game'
export { simulatePossessionDetailed } from './possession'
export {
  combineScore,
  weightedSelect,
  contestedSelect,
  tendency,
} from './weights'
export { PLAY_ACTIONS, PLAY_ACTION_LABELS } from '../../data/simulation/constants'
