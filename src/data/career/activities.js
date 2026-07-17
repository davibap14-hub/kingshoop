/**
 * Catálogo de atividades semanais.
 * O jogador escolhe EXATAMENTE uma por semana.
 */

export const ACTIVITY_TYPES = {
  TRAIN: 'train',
  REST: 'rest',
  RECOVERY: 'recovery',
  MEDIA: 'media',
  BONDING: 'bonding',
  COACH: 'coach',
  SPONSOR: 'sponsor',
}

export const WEEKLY_ACTIVITIES = [
  {
    id: 'train_fisico',
    type: ACTIVITY_TYPES.TRAIN,
    label: 'Treino Físico',
    description: 'Velocidade, impulsão, força e resistência.',
    group: 'fisico',
    energyCost: 28,
    requiresHealthy: true,
    coachBias: 2,
    teammatesBias: 0,
  },
  {
    id: 'train_arremesso',
    type: ACTIVITY_TYPES.TRAIN,
    label: 'Treino de Arremesso',
    description: 'Bandeja, mid-range, 3PT e lance livre.',
    group: 'arremesso',
    energyCost: 24,
    requiresHealthy: true,
    coachBias: 3,
    teammatesBias: 0,
  },
  {
    id: 'train_defesa',
    type: ACTIVITY_TYPES.TRAIN,
    label: 'Treino Defensivo',
    description: 'Perímetro, garrafão, roubo e toco.',
    group: 'defesa',
    energyCost: 26,
    requiresHealthy: true,
    coachBias: 4,
    teammatesBias: 1,
  },
  {
    id: 'train_qi',
    type: ACTIVITY_TYPES.TRAIN,
    label: 'Treino de QI de Jogo',
    description: 'Passe, visão e tomada de decisão.',
    group: 'qi',
    energyCost: 18,
    requiresHealthy: true,
    coachBias: 3,
    teammatesBias: 2,
  },
  {
    id: 'rest',
    type: ACTIVITY_TYPES.REST,
    label: 'Descanso',
    description: 'Recupera energia e reduz risco de lesão.',
    energyCost: -35,
    requiresHealthy: false,
    coachBias: -1,
    teammatesBias: 0,
  },
  {
    id: 'recovery',
    type: ACTIVITY_TYPES.RECOVERY,
    label: 'Fisioterapia / Recovery',
    description: 'Acelera recuperação de lesão.',
    energyCost: -15,
    requiresHealthy: false,
    requiresInjury: true,
    coachBias: 1,
    teammatesBias: 0,
  },
  {
    id: 'media_day',
    type: ACTIVITY_TYPES.MEDIA,
    label: 'Dia de Mídia',
    description: 'Entrevistas e exposição — sobe popularidade.',
    energyCost: 12,
    requiresHealthy: false,
    coachBias: -1,
    teammatesBias: 0,
    popularityGain: [3, 7],
  },
  {
    id: 'team_bonding',
    type: ACTIVITY_TYPES.BONDING,
    label: 'Confraternização',
    description: 'Fortalece laços com companheiros.',
    energyCost: 8,
    requiresHealthy: false,
    coachBias: 0,
    teammatesBias: 6,
  },
  {
    id: 'coach_session',
    type: ACTIVITY_TYPES.COACH,
    label: 'Sessão com Treinador',
    description: 'Film study e alinhamento tático.',
    energyCost: 10,
    requiresHealthy: false,
    coachBias: 7,
    teammatesBias: 1,
  },
  {
    id: 'sponsor_event',
    type: ACTIVITY_TYPES.SPONSOR,
    label: 'Evento de Patrocínio',
    description: 'Ativa marca, bônus em dinheiro e fama.',
    energyCost: 14,
    requiresHealthy: false,
    coachBias: -2,
    teammatesBias: -1,
    cashBonus: [4_000, 12_000],
    popularityGain: [2, 5],
  },
]

export const ACTIVITY_BY_ID = Object.fromEntries(
  WEEKLY_ACTIVITIES.map((a) => [a.id, a]),
)

export function getActivity(activityId) {
  return ACTIVITY_BY_ID[activityId] ?? null
}
