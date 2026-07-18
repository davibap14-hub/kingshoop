/**
 * Hall of Fame Engine — constantes de pontuação e classificação.
 */

export const HOF_CLASSIFICATION = {
  first_ballot: {
    id: 'first_ballot',
    label: 'Primeira votação',
    minScore: 78,
  },
  hall_of_fame: {
    id: 'hall_of_fame',
    label: 'Hall da Fama',
    minScore: 55,
  },
  not_inducted: {
    id: 'not_inducted',
    label: 'Não entrou',
    minScore: 0,
  },
}

/** Pesos da pontuação (soma relativa → score 0–100) */
export const HOF_SCORE_WEIGHTS = {
  titles: 14,
  mvps: 16,
  allStar: 10,
  allNba: 12,
  dpoy: 10,
  points: 10,
  assists: 7,
  rebounds: 7,
  longevity: 8,
  popularity: 6,
}

/** Escalas de referência para normalizar estatísticas → 0–100 */
export const HOF_STAT_SCALES = {
  titles: 4,
  mvps: 3,
  allStar: 8,
  allNba: 5,
  dpoy: 2,
  points: 12000,
  assists: 4000,
  rebounds: 5000,
  longevitySeasons: 14,
  longevityAge: 38,
  popularity: 100,
}

export const HOF_CLASSIFICATION_ORDER = [
  'first_ballot',
  'hall_of_fame',
  'not_inducted',
]
