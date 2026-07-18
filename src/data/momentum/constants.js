/**
 * Momentum Engine — momento psicológico da partida.
 * Modificadores sempre pequenos e progressivos.
 */

/** Valor neutro (0–100) */
export const MOMENTUM_NEUTRAL = 50

export const MOMENTUM_MIN = 18
export const MOMENTUM_MAX = 82

/**
 * Deltas por fator (aplicados de forma progressiva / com soft cap).
 * Valores propositalmente baixos — nunca alteração drástica.
 */
export const MOMENTUM_FACTOR_DELTAS = {
  make: 2.2,
  miss: -2.0,
  makeStreakBonus: 0.85, // por acerto extra na sequência (cap abaixo)
  missStreakPenalty: -0.75,
  threeMake: 3.2,
  threeStreakBonus: 1.1,
  dunk: 3.5,
  block: 3.0,
  steal: 2.4,
  turnoverAgainst: 1.6, // time que força o TO
  crowdHome: 1.4,
  clutchMult: 1.35, // multiplica deltas em clutch
  rivalryMult: 1.2,
  timeoutBoost: 5.5, // recovery do time que pede
  timeoutOpponentCut: -2.0, // corta um pouco o momentum do rival
}

/** Caps de sequência que ainda somam bônus */
export const STREAK_BONUS_CAP = 4
export const THREE_STREAK_BONUS_CAP = 3

/** Decay suave por posse sem evento forte (regressão à média) */
export const MOMENTUM_REGRESSION = 0.04

/** Timeout automático: miss streak + run do adversário */
export const TIMEOUT_MISS_STREAK = 3
export const TIMEOUT_OPP_MAKE_STREAK = 2
export const TIMEOUT_COOLDOWN_POSSESSIONS = 8

/**
 * Multiplicadores de performance — teto ±MOMENTUM_MOD_CAP.
 * Em 82 vs 50: (32)*0.00125 ≈ +0.04 (4%).
 */
export const MOMENTUM_MOD_SLOPE = 0.00125
export const MOMENTUM_MOD_CAP = 0.07 // ±7% máximo

export const MOMENTUM_EFFECT_KEYS = [
  'confidence',
  'decision',
  'accuracy',
  'aggressiveness',
]

export const MOMENTUM_EFFECT_LABELS = {
  confidence: 'Confiança',
  decision: 'Tomada de decisão',
  accuracy: 'Precisão',
  aggressiveness: 'Agressividade',
}

/** Pares de rivalidade (boost mútuo) */
export const RIVALRY_PAIRS = [
  ['lal', 'gsw'],
  ['bos', 'nyk'],
  ['mia', 'nyk'],
  ['lal', 'den'],
  ['bos', 'mia'],
  ['gsw', 'den'],
]

export const RIVALRY_SAME_CONFERENCE = 35
export const RIVALRY_PAIR_SCORE = 72
export const RIVALRY_DEFAULT = 20
