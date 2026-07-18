/**
 * Constantes da Progression Engine.
 */

/** Grupos evoluíveis com pontos */
export const EVOLUTION_GROUPS = ['fisico', 'arremesso', 'defesa', 'qi']

export const EVOLUTION_GROUP_LABELS = {
  fisico: 'Físico',
  arremesso: 'Arremesso',
  defesa: 'Defesa',
  qi: 'QI',
}

/** XP base por tipo de atividade semanal */
export const WEEKLY_XP_BY_ACTIVITY = {
  train: { base: 28, bonus: 10 },
  rest: { base: 10, bonus: 0 },
  recovery: { base: 12, bonus: 0 },
  media: { base: 14, bonus: 4 },
  bonding: { base: 16, bonus: 4 },
  coach: { base: 20, bonus: 6 },
  sponsor: { base: 12, bonus: 4 },
}

/** Pontos de evolução por level-up (gradual) */
export const EVOLUTION_POINTS_PER_LEVEL = 1

/** Nível máximo */
export const MAX_LEVEL = 50

/** XP do nível 1 → 2 */
export const BASE_XP_TO_LEVEL = 100

/** Curva: cada nível exige ~12% a mais que o anterior */
export const XP_GROWTH_RATE = 1.12

/** Ganho máximo de atributo por ponto gasto (evolução gradual) */
export const POINT_STAT_GAIN = 1
