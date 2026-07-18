/**
 * Franchise AI — API pública.
 *
 * Cada franquia persegue um objetivo (Tank, Playoffs, Título,
 * Desenvolvimento, Economia). O objetivo se adapta aos resultados
 * da temporada. Decisões são sempre por score — nunca aleatórias.
 */

export {
  FRANCHISE_OBJECTIVES,
  FRANCHISE_OBJECTIVE_IDS,
  PERSONALITY_DEFAULT_OBJECTIVE,
} from '../../data/franchise'

export {
  resolveFranchiseObjective,
  updateAllFranchiseObjectives,
  getFranchiseObjective,
} from './objective'

export {
  decideForFranchise,
  scoreKeep,
  scoreFa,
  findBestTrade,
} from './decide'
