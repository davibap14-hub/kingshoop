/**
 * Coach Engine — constantes configuráveis.
 */

export const COACH_ATTR_KEYS = [
  'offensiveSystem',
  'defensiveSystem',
  'rotation',
  'youthTrust',
  'rigor',
  'motivation',
  'development',
]

export const COACH_ATTR_LABELS = {
  offensiveSystem: 'Sistema ofensivo',
  defensiveSystem: 'Sistema defensivo',
  rotation: 'Rotação',
  youthTrust: 'Confiança em jovens',
  rigor: 'Rigor',
  motivation: 'Motivação',
  development: 'Desenvolvimento',
}

export const COACH_ATTR_MIN = 25
export const COACH_ATTR_MAX = 95

/** Focos semanais de treino (decisão automática) */
export const PRACTICE_FOCI = {
  offense: { id: 'offense', label: 'Ataque', attrBias: 'offensiveSystem' },
  defense: { id: 'defense', label: 'Defesa', attrBias: 'defensiveSystem' },
  development: {
    id: 'development',
    label: 'Desenvolvimento',
    attrBias: 'development',
  },
  conditioning: {
    id: 'conditioning',
    label: 'Condicionamento',
    attrBias: 'rigor',
  },
  morale: { id: 'morale', label: 'Motivação', attrBias: 'motivation' },
}

/** Pesos para decisões semanais (nunca aleatório puro) */
export const COACH_DECISION_WEIGHTS = {
  practiceFocus: {
    offensiveSystem: 1.1,
    defensiveSystem: 1.05,
    development: 1.0,
    rigor: 0.85,
    motivation: 0.8,
    recentLosses: 0.55,
    recentWins: 0.35,
  },
  minutes: {
    youthTrust: 0.9,
    rotation: 0.75,
    rigor: 0.55,
    relationship: 0.85,
    development: 0.45,
    age: 0.5,
  },
  style: {
    offensiveSystem: 1.0,
    defensiveSystem: 1.0,
    rosterFit: 0.85,
  },
  relationDelta: {
    motivation: 0.4,
    rigor: 0.35,
    development: 0.25,
  },
}

/** Bias de sets ofensivos derivados do sistema ofensivo (0–100 → pesos) */
export const OFFENSIVE_SET_BIAS_KEYS = [
  'pick_and_roll',
  'isolation',
  'drive',
  'post_up',
  'cut',
]
