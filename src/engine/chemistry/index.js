/**
 * Chemistry Engine — química entre todos os jogadores.
 *
 * Cada dupla: −100 … +100
 * Fontes: tempo juntos, personalidade, vitórias, derrotas,
 * discussões, eventos, treinos.
 *
 * Influencia (via pesos na Simulation Engine):
 * passe, movimentação, defesa, eficiência ofensiva, decisões da IA.
 *
 * Nunca usa RNG puro para química — apenas pesos determinísticos.
 */

export {
  CHEMISTRY_MIN,
  CHEMISTRY_MAX,
  CHEMISTRY_NEUTRAL,
  CHEMISTRY_DELTAS,
  CHEMISTRY_SIM_WEIGHTS,
} from '../../data/chemistry'

export {
  pairKey,
  clampChemistry,
  createChemistryState,
  getPairChemistry,
  setPairChemistry,
  adjustPairChemistry,
  chemistryToScore,
} from './state.js'

export {
  calcInitialPairChemistry,
  ensureRosterPairs,
} from './personality.js'

export {
  buildLineupChemistryEffects,
  boostToScoreFactor,
} from './effects.js'

export {
  adjustAllPairs,
  applyTimeTogether,
  applyGameResultToChemistry,
  applyTrainingChemistry,
  applyDiscussionChemistry,
  applyEventChemistry,
  applyChemistryDecay,
  tickRosterChemistry,
  getWeeksTogether,
} from './update.js'

export { processWeeklyChemistry } from './weekly.js'
export { getChemistryView, getPairView } from './view.js'
