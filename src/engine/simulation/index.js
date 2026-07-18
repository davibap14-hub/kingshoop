/**
 * Simulation Engine — API pública.
 *
 * Cada posse é dirigida pela Decision Engine (cérebro ponderado):
 * atributos · tendências · personalidade · química · coach ·
 * fadiga · momentum · matchup · placar · tempo · pressão · importância.
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

// Re-export Decision Engine (usada pela simulação)
export {
  decide,
  decideDuel,
  buildPossessionDecisionContext,
  decideBallHandler,
  decideScreener,
  decideCutter,
  decideReceiver,
  decideShooter,
  decideRebounder,
  decideStealer,
} from '../decision'
