/**
 * Legacy Engine — pesos e tiers do Legacy Score.
 */

/** Pesos relativos (normalizados na soma) */
export const LEGACY_SCORE_WEIGHTS = {
  titles: 14,
  mvp: 12,
  finalsMvp: 10,
  allStar: 8,
  allNba: 10,
  defense: 8,
  records: 6,
  longevity: 8,
  popularity: 7,
  personality: 5,
  historicalMoments: 7,
  rivalries: 5,
}

/** Escalas de referência para normalizar → 0–100 */
export const LEGACY_STAT_SCALES = {
  titles: 4,
  mvp: 3,
  finalsMvp: 3,
  allStar: 10,
  allNba: 6,
  defense: 100, // fator já 0–100
  records: 5,
  longevitySeasons: 16,
  longevityGames: 1100,
  popularity: 100,
  personality: 100,
  historicalMoments: 40,
  rivalries: 100,
}

export const LEGACY_TIERS = {
  immortal: { id: 'immortal', label: 'Imortal', minScore: 88 },
  legend: { id: 'legend', label: 'Lenda', minScore: 75 },
  great: { id: 'great', label: 'Grande', minScore: 60 },
  notable: { id: 'notable', label: 'Notável', minScore: 45 },
  developing: { id: 'developing', label: 'Em construção', minScore: 0 },
}

/** Quantos jogadores manter no ranking histórico interno */
export const LEGACY_RANKING_SIZE = 40

/** Influência do Legacy Score no Hall da Fama (blend) */
export const LEGACY_HOF_BLEND = 0.22

/** Boost máximo de popularidade por legado (por semana, suave) */
export const LEGACY_POPULARITY_WEEKLY_CAP = 2
