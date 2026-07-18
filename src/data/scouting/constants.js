/**
 * Scouting Engine — constantes configuráveis.
 */

export const SCOUTING_INVESTMENT_MIN = 15
export const SCOUTING_INVESTMENT_MAX = 95
export const DEFAULT_SCOUTING_INVESTMENT = 42

/** Erro máximo de overall/potencial quando investimento = 0 */
export const SCOUTING_MAX_ERROR = 18

/** Confiança mínima / máxima do relatório */
export const SCOUTING_CONFIDENCE_MIN = 8
export const SCOUTING_CONFIDENCE_MAX = 96

/** Quantos pontos fortes / fracos revelar conforme confiança */
export const SCOUT_REVEAL_THRESHOLDS = {
  strengths: [
    { minConfidence: 25, count: 1 },
    { minConfidence: 50, count: 2 },
    { minConfidence: 75, count: 3 },
  ],
  weaknesses: [
    { minConfidence: 30, count: 1 },
    { minConfidence: 55, count: 2 },
    { minConfidence: 80, count: 3 },
  ],
  personality: 40,
  tendencies: 45,
}

/** Investimento base por objetivo da Franchise AI */
export const SCOUTING_BY_OBJECTIVE = {
  tank: 55,
  development: 72,
  playoffs: 48,
  title: 50,
  economy: 32,
}

/** Ganho semanal de investimento na offseason / draft */
export const SCOUTING_WEEKLY_GAIN = {
  offseason: 3,
  draftWindow: 5,
  regular: 1,
}
