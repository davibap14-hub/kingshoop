/**
 * Balance Engine — equilíbrio configurável do jogo.
 *
 * Evita evolução exagerada, controla inflação de atributos,
 * contratos, crescimento de rookies e decadência de veteranos.
 * Todos os knobs vivem em `data/balance/constants.js`.
 */

export * from '../../data/balance'

export {
  clampAttribute,
  getEffectiveAttrCap,
  calcOverallGrowthMultiplier,
  calcAttrDiminishMultiplier,
  calcAgeGrowthMultiplier,
  applyBalancedTrainingGain,
} from './attributes.js'

export { balanceXpGain } from './xp.js'

export {
  balanceDemandFactor,
  calcLeagueInflation,
  calcBalancedSalary,
  calcBalancedRenewBump,
  clampSalary,
} from './contracts.js'

export { applySeasonalAging } from './aging.js'

export {
  processSeasonalBalance,
  applyLeagueAgingWithResolver,
} from './seasonal.js'

export { getBalanceView } from './view.js'
