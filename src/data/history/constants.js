/**
 * Constantes do History Engine — arquivo permanente da liga.
 */

/** Nunca descartar temporadas arquivadas */
export const HISTORY_KEEP_ALL_SEASONS = true

/** Critérios mínimos para Hall da Fama */
export const HOF_THRESHOLDS = {
  minMvpSeasons: 1,
  minChampionships: 1,
  minFinalsMvp: 1,
  minGameMvps: 25,
  minAge: 34,
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
