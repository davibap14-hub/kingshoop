/**
 * Relationship Engine — constantes configuráveis.
 */

export const RELATIONSHIP_IDS = [
  'coach',
  'gm',
  'teammates',
  'fans',
  'press',
  'sponsors',
  'agent',
]

export const RELATIONSHIP_META = {
  coach: {
    id: 'coach',
    label: 'Treinador',
    description: 'Confiança e respeito do técnico.',
  },
  gm: {
    id: 'gm',
    label: 'GM',
    description: 'Relação com a diretoria / general manager.',
  },
  teammates: {
    id: 'teammates',
    label: 'Companheiros',
    description: 'Química e respeito do elenco.',
  },
  fans: {
    id: 'fans',
    label: 'Torcida',
    description: 'Apoio da torcida local.',
  },
  press: {
    id: 'press',
    label: 'Imprensa',
    description: 'Imagem perante a mídia.',
  },
  sponsors: {
    id: 'sponsors',
    label: 'Patrocinadores',
    description: 'Valor e estabilidade das marcas.',
  },
  agent: {
    id: 'agent',
    label: 'Agente',
    description: 'Alinhamento com o agente nas negociações.',
  },
}

export const RELATIONSHIP_MIN = 0
export const RELATIONSHIP_MAX = 100

export const DEFAULT_RELATIONSHIPS = {
  coach: 55,
  gm: 50,
  teammates: 55,
  fans: 35,
  press: 35,
  sponsors: 30,
  agent: 60,
}

/** Faixas de status textual */
export const RELATIONSHIP_TIERS = [
  { max: 19, id: 'hostile', label: 'Hostil' },
  { max: 39, id: 'cold', label: 'Frio' },
  { max: 59, id: 'neutral', label: 'Neutro' },
  { max: 79, id: 'good', label: 'Bom' },
  { max: 100, id: 'excellent', label: 'Excelente' },
]

/**
 * Deltas base por tipo de atividade semanal.
 * coachBias / teammatesBias do catálogo somam em cima destes.
 */
export const ACTIVITY_RELATIONSHIP_DELTAS = {
  train: { coach: 1, teammates: 0, agent: 0, gm: 0 },
  rest: { coach: -1, teammates: 0 },
  recovery: { coach: 1, agent: 1 },
  media: { press: 4, fans: 2, coach: -1, sponsors: 1, agent: 1 },
  bonding: { teammates: 5, coach: 1, press: 0, fans: 1 },
  coach: { coach: 6, teammates: 1, gm: 1, agent: 0 },
  sponsor: { sponsors: 5, press: 2, fans: 1, coach: -1, teammates: -1, agent: 2 },
}

/** Mapa de efeitos legados de status → relacionamentos */
export const STATUS_TO_RELATIONSHIP = {
  relTreinador: ['coach'],
  relCompanheiros: ['teammates'],
  popularidade: ['fans', 'press'],
}

/**
 * Limiares para efeitos derivados.
 */
export const EFFECT_THRESHOLDS = {
  high: 75,
  low: 35,
  criticalLow: 20,
}

/** Decay semanal leve em direção ao neutro (50) — evita inflação eterna */
export const WEEKLY_RELATIONSHIP_DECAY = 0.15
export const RELATIONSHIP_NEUTRAL = 50
