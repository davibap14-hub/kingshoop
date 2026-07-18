/**
 * Contract Engine — contratos da carreira do jogador.
 *
 * Renovação · Ofertas · Player/Team Option · RFA/UFA ·
 * Trade Clause · Buyout · Extensões · Negociação
 *
 * Isolada da Interface.
 */

export {
  CONTRACT_OFFER_TYPES,
  CONTRACT_OFFER_LABELS,
  FREE_AGENCY_STATUS,
  TRADE_CLAUSE,
  TRADE_CLAUSE_LABELS,
  CONTRACT_DECISIONS,
  CONTRACT_YEARS_MIN,
  CONTRACT_YEARS_MAX,
  MAX_NEGOTIATE_ROUNDS,
} from '../../data/contracts'

export {
  createPlayerContract,
  createContractEngineState,
  migrateLegacyContract,
  resolveFreeAgencyStatus,
  withWeeklySalary,
} from './state.js'

export {
  generateFranchiseOffer,
  generateOptionOffer,
  generateBuyoutOffer,
  contractFromOffer,
  teamCanAffordOffer,
} from './offers.js'

export { negotiateOffer } from './negotiate.js'

export {
  resolveContractDecision,
  tickCareerContract,
} from './resolve.js'

export { processWeeklyContracts } from './weekly.js'

export { getContractView, summarizeOffer } from './view.js'
