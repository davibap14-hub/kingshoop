/**
 * Catálogo de recordes — liga (NBA) e franquia usam as mesmas defs.
 */

import { RECORD_BUCKETS } from './constants.js'

/**
 * @typedef {object} RecordDef
 * @property {string} key
 * @property {string} bucket
 * @property {'player'|'team'} holderKind
 * @property {string} label
 * @property {string} [stat] — campo no box/totals
 * @property {boolean} [composite] — valor derivado (ex.: soma TD)
 */

/** @type {RecordDef[]} */
export const RECORD_DEFS = [
  // —— Jogo (jogador) ——
  {
    key: 'points',
    bucket: RECORD_BUCKETS.game,
    holderKind: 'player',
    label: 'Mais pontos em um jogo',
    stat: 'points',
  },
  {
    key: 'rebounds',
    bucket: RECORD_BUCKETS.game,
    holderKind: 'player',
    label: 'Mais rebotes em um jogo',
    stat: 'rebounds',
  },
  {
    key: 'assists',
    bucket: RECORD_BUCKETS.game,
    holderKind: 'player',
    label: 'Mais assistências em um jogo',
    stat: 'assists',
  },
  {
    key: 'steals',
    bucket: RECORD_BUCKETS.game,
    holderKind: 'player',
    label: 'Mais roubos em um jogo',
    stat: 'steals',
  },
  {
    key: 'blocks',
    bucket: RECORD_BUCKETS.game,
    holderKind: 'player',
    label: 'Mais tocos em um jogo',
    stat: 'blocks',
  },
  {
    key: 'tripleDouble',
    bucket: RECORD_BUCKETS.game,
    holderKind: 'player',
    label: 'Melhor triple-double (pts+reb+ast)',
    composite: true,
  },

  // —— Temporada (jogador) ——
  {
    key: 'points',
    bucket: RECORD_BUCKETS.season,
    holderKind: 'player',
    label: 'Mais pontos em uma temporada',
    stat: 'points',
  },
  {
    key: 'rebounds',
    bucket: RECORD_BUCKETS.season,
    holderKind: 'player',
    label: 'Mais rebotes em uma temporada',
    stat: 'rebounds',
  },
  {
    key: 'assists',
    bucket: RECORD_BUCKETS.season,
    holderKind: 'player',
    label: 'Mais assistências em uma temporada',
    stat: 'assists',
  },
  {
    key: 'steals',
    bucket: RECORD_BUCKETS.season,
    holderKind: 'player',
    label: 'Mais roubos em uma temporada',
    stat: 'steals',
  },
  {
    key: 'blocks',
    bucket: RECORD_BUCKETS.season,
    holderKind: 'player',
    label: 'Mais tocos em uma temporada',
    stat: 'blocks',
  },
  {
    key: 'tripleDoubles',
    bucket: RECORD_BUCKETS.season,
    holderKind: 'player',
    label: 'Mais triple-doubles em uma temporada',
    stat: 'tripleDoubles',
  },

  // —— Carreira (jogador) ——
  {
    key: 'points',
    bucket: RECORD_BUCKETS.career,
    holderKind: 'player',
    label: 'Mais pontos na carreira',
    stat: 'points',
  },
  {
    key: 'rebounds',
    bucket: RECORD_BUCKETS.career,
    holderKind: 'player',
    label: 'Mais rebotes na carreira',
    stat: 'rebounds',
  },
  {
    key: 'assists',
    bucket: RECORD_BUCKETS.career,
    holderKind: 'player',
    label: 'Mais assistências na carreira',
    stat: 'assists',
  },
  {
    key: 'steals',
    bucket: RECORD_BUCKETS.career,
    holderKind: 'player',
    label: 'Mais roubos na carreira',
    stat: 'steals',
  },
  {
    key: 'blocks',
    bucket: RECORD_BUCKETS.career,
    holderKind: 'player',
    label: 'Mais tocos na carreira',
    stat: 'blocks',
  },
  {
    key: 'tripleDoubles',
    bucket: RECORD_BUCKETS.career,
    holderKind: 'player',
    label: 'Mais triple-doubles na carreira',
    stat: 'tripleDoubles',
  },
  {
    key: 'seasons',
    bucket: RECORD_BUCKETS.career,
    holderKind: 'player',
    label: 'Mais temporadas jogadas',
    stat: 'seasons',
  },

  // —— Time / vitórias / sequências ——
  {
    key: 'points',
    bucket: RECORD_BUCKETS.teamGame,
    holderKind: 'team',
    label: 'Maior pontuação de um time',
    stat: 'points',
  },
  {
    key: 'margin',
    bucket: RECORD_BUCKETS.teamGame,
    holderKind: 'team',
    label: 'Maior margem de vitória',
    stat: 'margin',
  },
  {
    key: 'wins',
    bucket: RECORD_BUCKETS.teamSeason,
    holderKind: 'team',
    label: 'Mais vitórias em uma temporada',
    stat: 'wins',
  },
  {
    key: 'wins',
    bucket: RECORD_BUCKETS.streak,
    holderKind: 'team',
    label: 'Maior sequência de vitórias',
    stat: 'wins',
  },
]

export function recordDefId(def) {
  return `${def.bucket}.${def.key}`
}

export function findRecordDef(bucket, key) {
  return RECORD_DEFS.find((d) => d.bucket === bucket && d.key === key) ?? null
}

export function labelForRecord(bucket, key) {
  return findRecordDef(bucket, key)?.label ?? `${bucket}.${key}`
}
