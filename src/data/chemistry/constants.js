/**
 * Chemistry Engine — constantes configuráveis.
 * Pares de jogadores: −100 … +100
 */

export const CHEMISTRY_MIN = -100
export const CHEMISTRY_MAX = 100
export const CHEMISTRY_NEUTRAL = 0

/** Escala usada em combineScore (0–100) */
export const CHEMISTRY_SCORE_SCALE = 100

/** Deltas semanais / por evento (pesos, sem RNG puro) */
export const CHEMISTRY_DELTAS = {
  weekTogether: 1,
  winTogether: 3,
  lossTogether: -1,
  trainingBond: 4,
  trainingSession: 2,
  discussion: -8,
  mediaConflict: -3,
  celebration: 2,
  eventPositive: 5,
  eventNegative: -6,
}

/** Soft decay semanal em direção a 0 quando |chem| alto */
export const CHEMISTRY_DECAY_THRESHOLD = 40
export const CHEMISTRY_DECAY_STEP = 1

/** Pesos de influência na simulação (combineScore) */
export const CHEMISTRY_SIM_WEIGHTS = {
  pass: 0.85,
  movement: 0.7,
  defense: 0.75,
  offenseEfficiency: 0.9,
  onBallPressure: 0.55,
  setPassBias: 0.65,
  setCutBias: 0.55,
  aiDecision: 0.5,
}

/** Caps de boost derivado (−1…+1 → aplicado como 0–100 factor) */
export const CHEMISTRY_EFFECT_CLAMP = 18
