/**
 * Constantes da Records Engine — livros de recordes da liga e franquias.
 */

export const RECORDS_VERSION = 1

/** Escopos */
export const RECORD_SCOPES = {
  league: 'league',
  franchise: 'franchise',
}

/** Buckets do livro */
export const RECORD_BUCKETS = {
  game: 'game',
  season: 'season',
  career: 'career',
  streak: 'streak',
  teamGame: 'teamGame',
  teamSeason: 'teamSeason',
}

/** Máximo de quebras anunciadas por semana (News / decisões) */
export const MAX_RECORD_BREAKS_PER_WEEK = 8

/**
 * Espelho dos 6 recordes legados do History Engine
 * → caminho no livro canônico da Records Engine.
 */
export const HISTORY_RECORD_MIRROR = {
  mostPointsGame: { bucket: 'game', key: 'points' },
  highestTeamScore: { bucket: 'teamGame', key: 'points' },
  largestMargin: { bucket: 'teamGame', key: 'margin' },
  longestWinStreak: { bucket: 'streak', key: 'wins' },
  mostWinsSeason: { bucket: 'teamSeason', key: 'wins' },
  tripleDoublesSeason: { bucket: 'season', key: 'tripleDoubles' },
}
