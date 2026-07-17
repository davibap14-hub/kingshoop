/**
 * Simulation Engine — API pública.
 *
 * - events: micro-eventos de carreira (legado)
 * - game: simulação completa posse a posse com Play-by-Play
 *
 * Cada posse usa pesos combinados de atributos (Ball Handler, defesa
 * individual, ajuda, PnR, Isolation, Drive, Kick Out, Corte, Screen,
 * Post Up, Fast Break, Offensive Rebound).
 */

export { rollWeeklyEvent } from './events'

export { simulateGame, simulateMatch } from './game'
export { simulatePossessionDetailed } from './possession'
export { combineScore, weightedSelect, contestedSelect } from './weights'
export { PLAY_ACTIONS, PLAY_ACTION_LABELS } from '../../data/simulation/constants'
