/**
 * Momentum Engine — momento psicológico da partida.
 * Modificadores pequenos e progressivos. Sem Interface.
 */

export { calcRivalryScore } from './rivalry.js'
export {
  clampMomentum,
  createGameMomentum,
  getSideMomentum,
  getOpponentMomentum,
} from './state.js'
export {
  buildMomentumEffects,
  applyMomentumToPlayer,
  withMomentumLineup,
  listMomentumEffectRows,
} from './effects.js'
export {
  updateMomentumFromPossession,
  maybeCallTimeout,
} from './update.js'
export { getMomentumView, summarizeMomentumForSave } from './view.js'
