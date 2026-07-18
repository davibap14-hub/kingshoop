/**
 * Trade Engine — trocas da liga (jogadores + escolhas de draft).
 * Valor de mercado · negociação IA · anti-trocas irreais.
 * Sem Interface.
 */

export {
  MARKET_VALUE_MIN,
  MARKET_VALUE_MAX,
  MAX_PLAYERS_PER_SIDE,
  MAX_PICKS_PER_SIDE,
  MAX_VALUE_RATIO,
  SALARY_MATCH_RATIO,
} from '../../data/trade'

export {
  pickAssetId,
  createPickAsset,
  buildInitialDraftPicks,
  hydrateDraftPicks,
  rollDraftPicksAfterSeason,
  getTeamPicks,
  findPick,
  calcPickMarketValue,
  resolvePickOwner,
  transferPicks,
} from './picks.js'

export {
  calcPlayerMarketValue,
  calcContextualAssetValue,
  calcPackageValue,
  listRosterMarketValues,
} from './value.js'

export {
  buildPlayerAsset,
  buildPickAsset,
  packageSalary,
  packagePlayerIds,
  packagePickIds,
  validateTrade,
} from './rules.js'

export { executeTrade, tradePlayers } from './execute.js'

export {
  findBestNegotiatedTrade,
  negotiateAndExecute,
  previewTradeFairness,
} from './negotiate.js'

export { getTradeView } from './view.js'
