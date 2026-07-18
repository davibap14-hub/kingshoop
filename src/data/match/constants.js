/**
 * Constantes da Match Engine — dados puros.
 */

/** Posses aproximadas por quarto (NBA ~100 posses/jogo → ~25/quarto) */
export const POSSESSIONS_PER_QUARTER = 24

export const QUARTERS = 4

/** Bônus de mando de quadra no ataque/defesa (pontos de rating) */
export const HOME_COURT = {
  attack: 3.5,
  defense: 2.5,
  turnoverResist: 0.02,
}

/** Multiplicadores por momento da partida */
export const MOMENT_MODS = {
  q1: { pace: 1.02, clutch: 0 },
  q2: { pace: 1.0, clutch: 0 },
  q3: { pace: 0.98, clutch: 0 },
  q4: { pace: 0.95, clutch: 0.08 },
  q4_close: { pace: 0.9, clutch: 0.18 }, // diferença ≤ 8
}

/** Pesos para rating de ataque a partir dos grupos */
export const ATTACK_WEIGHTS = {
  arremesso: 0.42,
  fisico: 0.22,
  qi: 0.28,
  defesa: 0.08,
}

export const DEFENSE_WEIGHTS = {
  defesa: 0.5,
  fisico: 0.22,
  qi: 0.2,
  arremesso: 0.08,
}

/** Distribuição base de resultados de posse (antes dos ratings) */
export const POSSESSION_BASE = {
  twoPointRate: 0.42,
  threePointRate: 0.28,
  turnoverRate: 0.12,
  foulRate: 0.08,
  // resto = miss → rebote
}

export const MVP_WEIGHTS = {
  points: 1,
  rebounds: 1.2,
  assists: 1.5,
  steals: 2,
  blocks: 2,
  turnovers: -1,
  fouls: -0.3,
}
