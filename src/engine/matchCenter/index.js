/**
 * Match Center Engine — tela de pré-jogo.
 * Agrega Season, GM, Lineups, Injuries, Fatigue, Momentum, Franchise.
 * Sem lógica de simulação. Sem mutação de resultados.
 */

export {
  MATCH_CENTER_VERSION,
  MATCH_CENTER_RECENT_GAMES,
  REFEREE_CREW,
} from '../../data/matchCenter'

export { getMatchCenterView } from './build.js'
export { estimateWinProbability } from './probability.js'
export { assignRefereeCrew } from './referees.js'
