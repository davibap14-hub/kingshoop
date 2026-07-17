/**
 * Match facade — lineups + ponte para a Simulation Engine.
 *
 * A simulação de partida vive em `engine/simulation`.
 * Este módulo mantém buildLineupFromDb / buildDefaultMatchup
 * e reexporta simulateMatch para compatibilidade.
 */

export { buildLineupFromDb, buildDefaultMatchup } from './lineups'
export { simulateMatch, simulateGame } from '../simulation/game'
export {
  createTeamBox,
  createPlayerLine,
  applyPossessionToBox,
  computeMvp,
} from '../simulation/boxscore'
