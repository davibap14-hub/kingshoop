/**
 * Camada Data — jogadores.
 * Banco local em JS + schema + queries.
 */

export {
  POSITIONS,
  ATTRIBUTE_GROUPS,
  ATTRIBUTE_GROUP_KEYS,
  TENDENCY_KEYS,
  TENDENCY_LABELS,
  PLAYER_FIELDS,
} from './schema'

export {
  calcGroupRating,
  calcOverall,
  deriveTendencies,
  normalizeTendencies,
  normalizePlayer,
  formatMoney,
  listFlatAttributes,
  listTendencies,
} from './utils'

export { PLAYERS, PLAYER_COUNT } from './database'
export { PlayerDatabase, playerDb } from './db'

export const ROOKIE_DEFAULTS = {
  nome: 'Rookie',
  idade: 19,
  posicao: 'SG',
}

/** @deprecated use PLAYERS */
export const PLAYER_TEMPLATES = []
