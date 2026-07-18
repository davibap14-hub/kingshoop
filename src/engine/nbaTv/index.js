/**
 * NBA TV Engine — portal de notícias da liga.
 * Consome News · History · Analytics (e Records/Season para seções).
 * A Interface nunca gera notícias.
 */

export {
  NBA_TV_VERSION,
  NBA_TV_LIMITS,
  NBA_TV_MONTH_WEEKS,
} from '../../data/nbaTv'

export { getNbaTvView } from './view.js'
export {
  derivePlayerOfWeek,
  derivePlayerOfMonth,
  buildRookieBoard,
} from './awards.js'
export { buildPowerRankings } from './rankings.js'
