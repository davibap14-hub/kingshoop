/**
 * Dynasty Engine — critérios e limiares de dinastia.
 */

/** Janela de temporadas analisada (arquivo recente) */
export const DYNASTY_WINDOW_SEASONS = 8

/** Vitórias mínimas numa temporada para contar como domínio */
export const DYNASTY_DOMINANCE_WIN_PCT = 0.65

/** Score mínimo por tier */
export const DYNASTY_TIERS = {
  rising: {
    id: 'rising',
    label: 'Dinastia emergente',
    minScore: 55,
    reputation: 8,
    signingBias: 1.08,
  },
  dynasty: {
    id: 'dynasty',
    label: 'Dinastia',
    minScore: 85,
    reputation: 16,
    signingBias: 1.16,
  },
  super: {
    id: 'super',
    label: 'Super dinastia',
    minScore: 120,
    reputation: 28,
    signingBias: 1.28,
  },
}

/** Pesos dos critérios no score */
export const DYNASTY_CRITERIA_WEIGHTS = {
  titles: 28,
  consecutiveFinals: 14,
  avgWins: 0.35, // por vitória média na janela
  dominanceSeasons: 9,
  mvps: 11,
  allNbaProxy: 7,
}

/** Finais consecutivas mínimas para bônus de “era” */
export const DYNASTY_MIN_FINALS_STREAK = 3

/** Reputação de franquia (0–100) */
export const FRANCHISE_REPUTATION_MIN = 0
export const FRANCHISE_REPUTATION_MAX = 100
export const FRANCHISE_REPUTATION_BASE = 50
