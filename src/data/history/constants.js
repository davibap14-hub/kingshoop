/**
 * Constantes do History Engine — arquivo permanente da liga.
 */

/** Nunca descartar temporadas arquivadas */
export const HISTORY_KEEP_ALL_SEASONS = true

/**
 * Legado — a votação atual usa scores ponderados em
 * `data/hallOfFame` (Primeira votação / Hall da Fama / Não entrou).
 */
export const HOF_THRESHOLDS = {
  firstBallotMinScore: 78,
  hallOfFameMinScore: 55,
  autoInductOnRetirement: true,
}

export const RECORD_KEYS = [
  'highestTeamScore',
  'largestMargin',
  'longestWinStreak',
  'mostWinsSeason',
  'mostPointsGame',
  'tripleDoublesSeason',
]

export const RECORD_LABELS = {
  highestTeamScore: 'Maior pontuação de um time',
  largestMargin: 'Maior margem de vitória',
  longestWinStreak: 'Maior sequência de vitórias',
  mostWinsSeason: 'Mais vitórias em uma temporada',
  mostPointsGame: 'Mais pontos em um jogo',
  tripleDoublesSeason: 'Mais triplos-duplos na temporada',
}
