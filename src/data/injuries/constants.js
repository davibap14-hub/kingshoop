/**
 * Injury Engine — constantes configuráveis.
 */

export const INJURY_SEVERITY = {
  light: {
    id: 'light',
    label: 'Leve',
    baseWeeks: [1, 2],
    relapseChance: 0.08,
    riskWeight: 1,
  },
  moderate: {
    id: 'moderate',
    label: 'Moderada',
    baseWeeks: [2, 4],
    relapseChance: 0.18,
    riskWeight: 1.35,
  },
  severe: {
    id: 'severe',
    label: 'Grave',
    baseWeeks: [4, 10],
    relapseChance: 0.28,
    riskWeight: 1.8,
  },
}

/** Tratamentos disponíveis */
export const INJURY_TREATMENTS = {
  rest: {
    id: 'rest',
    label: 'Repouso',
    recoveryBonus: 6,
    relapseModifier: 1.1,
  },
  physio: {
    id: 'physio',
    label: 'Fisioterapia',
    recoveryBonus: 14,
    relapseModifier: 0.85,
  },
  conservative: {
    id: 'conservative',
    label: 'Tratamento conservador',
    recoveryBonus: 10,
    relapseModifier: 0.95,
  },
  surgery: {
    id: 'surgery',
    label: 'Cirurgia',
    recoveryBonus: 4,
    relapseModifier: 0.7,
  },
}

/** Pesos da recuperação semanal (nunca coin-flip puro) */
export const RECOVERY_WEIGHTS = {
  medicalStaff: 0.35,
  rest: 0.3,
  age: 0.25,
  condition: 0.28,
  treatment: 0.22,
  severity: 0.2,
}

/** Pesos do risco de nova lesão */
export const RISK_WEIGHTS = {
  baseRisk: 0.4,
  fatigue: 0.45,
  condition: 0.35,
  minutes: 0.3,
  age: 0.25,
  energy: 0.3,
  history: 0.2,
  activityLoad: 0.25,
}

export const CONDITION_MIN = 0
export const CONDITION_MAX = 100
export const FATIGUE_MIN = 0
export const FATIGUE_MAX = 100
export const RISK_MIN = 5
export const RISK_MAX = 95

export const DEFAULT_MEDICAL_STAFF = 55
export const DEFAULT_CONDITION = 72
export const DEFAULT_FATIGUE = 18

/** Cap do histórico persistido */
export const MAX_INJURY_HISTORY = 24

/** Fadiga de simulação por lesão ativa no elenco */
export const LEAGUE_INJURY_FATIGUE = 12
