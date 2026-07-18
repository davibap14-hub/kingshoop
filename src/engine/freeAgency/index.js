/**
 * Free Agency Engine — mercado de agentes livres.
 * Agrega GM · Franchise · Scouting · Contract · News · History.
 * Negociação sempre via Contract Engine.
 */

export {
  FREE_AGENCY_VERSION,
  FA_INTEREST_TOP,
  FA_RUMOR_WINDOW,
  FA_POSITIONS,
  FA_DEFAULT_FILTERS,
  FA_INTEREST_LABELS,
} from '../../data/freeAgency'

export { getFreeAgencyView } from './view.js'
export { compareFreeAgents } from './compare.js'
export { buildFranchiseInterest } from './interest.js'
export { buildFaHistory } from './history.js'
export { buildFaRumors } from './rumors.js'
export {
  createFaOffer,
  negotiateFaOffer,
  acceptFaOffer,
  withdrawFaOffer,
  calcAskedSalary,
} from './negotiate.js'
