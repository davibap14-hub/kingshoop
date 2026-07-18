/**
 * Fatigue Engine — cargas, limiares e efeitos.
 */

export const FATIGUE_MIN = 0
export const FATIGUE_MAX = 100

/** Componentes persistidos */
export const FATIGUE_COMPONENT_KEYS = [
  'game',
  'weekly',
  'season',
  'consecutiveMinutes',
  'travel',
  'backToBack',
  'overload',
]

export const FATIGUE_COMPONENT_LABELS = {
  game: 'Fadiga da partida',
  weekly: 'Fadiga semanal',
  season: 'Fadiga da temporada',
  consecutiveMinutes: 'Minutos consecutivos',
  travel: 'Viagens',
  backToBack: 'Back-to-Back',
  overload: 'Overload',
}

/** Pesos do score composto (0–100) */
export const FATIGUE_COMPOSITE_WEIGHTS = {
  game: 0.18,
  weekly: 0.28,
  season: 0.16,
  consecutiveMinutes: 0.12,
  travel: 0.1,
  backToBack: 0.08,
  overload: 0.08,
}

/** Minutos altos contam para streak de consecutiveMinutes */
export const HIGH_MINUTES_THRESHOLD = 32

/** Semanas seguidas com minutos altos → overload */
export const OVERLOAD_STREAK_WEEKS = 3

/** Carga de viagem */
export const TRAVEL_LOAD = {
  away: 12,
  roadTrip: 20, // away após away
  returnHome: 5, // home após away
  home: 0,
}

/** Bônus B2B (densidade de calendário) */
export const BACK_TO_BACK_LOAD = 14

/** Crescimento de fadiga in-game por quarto */
export const GAME_FATIGUE_PER_QUARTER = 7
export const GAME_FATIGUE_CLOCK = 6

/** Recuperação semanal base */
export const RECOVERY_BASE = {
  rest: 18,
  recovery: 24,
  train: -8,
  media: -3,
  bonding: -4,
  coach: -3,
  sponsor: -4,
  default: -2,
}

/** Idade: multiplicadores de recuperação (<1 = recupera menos) */
export const AGE_RECOVERY_MULT = [
  { maxAge: 21, mult: 1.2 },
  { maxAge: 25, mult: 1.1 },
  { maxAge: 29, mult: 1.0 },
  { maxAge: 32, mult: 0.85 },
  { maxAge: 35, mult: 0.7 },
  { maxAge: 99, mult: 0.55 },
]

/** Staff médico: 30–92 → multiplicador ~0.85–1.25 */
export const MEDICAL_RECOVERY_FACTOR = 0.004

/** Caps de penalidade de performance (multiplicadores mínimos) */
export const PERFORMANCE_FLOOR = {
  speed: 0.72,
  accuracy: 0.75,
  defense: 0.74,
  decision: 0.7,
  training: 0.35,
  recovery: 0.5,
}

/** Como o score composto vira penalidade (0 em 35, forte em 90+) */
export const PERFORMANCE_CURVE = {
  start: 28,
  full: 92,
}
