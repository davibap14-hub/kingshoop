/**
 * Match Engine — API pública.
 *
 * Simula partida por posses considerando ataque, defesa, fadiga,
 * química, overall, momento e mando de quadra.
 *
 * A Interface apenas exibe o resultado de `simulateMatch(...)`.
 */

export { simulateMatch, simulateMatchScoreOnly } from './simulate'
export { simulatePossession } from './possession'
export { computeTeamRatings, playerSideRating, resolveMomentKey } from './ratings'
export {
  createTeamBox,
  createPlayerLine,
  applyPossessionToBox,
  computeMvp,
} from './boxscore'
export { createEmptyBoxScore } from './legacy'
export { buildLineupFromDb, buildDefaultMatchup } from './lineups'
