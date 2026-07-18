/**
 * Status de carreira — variáveis controladas pela Career Engine.
 */

export const CAREER_STATUS = {
  energia: {
    id: 'energia',
    label: 'Energia',
    min: 0,
    max: 100,
    description: 'Condição física da semana.',
  },
  motivacao: {
    id: 'motivacao',
    label: 'Motivação',
    min: 0,
    max: 100,
    description: 'Disposição mental e foco.',
  },
  popularidade: {
    id: 'popularidade',
    label: 'Popularidade',
    min: 0,
    max: 100,
    description: 'Reconhecimento da mídia e dos fãs.',
  },
  felicidade: {
    id: 'felicidade',
    label: 'Felicidade',
    min: 0,
    max: 100,
    description: 'Bem-estar pessoal — influenciado pelo dinheiro e pelo estilo de vida.',
  },
  relTreinador: {
    id: 'relTreinador',
    label: 'Rel. Treinador',
    min: 0,
    max: 100,
    description: 'Relacionamento com o técnico.',
  },
  relCompanheiros: {
    id: 'relCompanheiros',
    label: 'Rel. Companheiros',
    min: 0,
    max: 100,
    description: 'Química com o elenco.',
  },
  dinheiro: {
    id: 'dinheiro',
    label: 'Dinheiro',
    min: 0,
    max: null,
    description: 'Saldo acumulado (salário + patrocínios).',
  },
}

export const CAREER_STATUS_KEYS = Object.keys(CAREER_STATUS)

export const DEFAULT_CAREER_STATUS = {
  energia: 100,
  motivacao: 70,
  popularidade: 20,
  felicidade: 60,
  relTreinador: 55,
  relCompanheiros: 55,
  dinheiro: 15_000,
}

/** @deprecated aliases — compat com UI antiga */
export const CAREER_VARIABLES = {
  energia: CAREER_STATUS.energia,
  dinheiro: CAREER_STATUS.dinheiro,
  fama: {
    ...CAREER_STATUS.popularidade,
    id: 'fama',
    label: 'Fama',
    short: 'FAM',
    unit: '',
  },
  quimica: {
    ...CAREER_STATUS.relCompanheiros,
    id: 'quimica',
    label: 'Química com Time',
    short: 'QUI',
    unit: '%',
  },
  motivacao: CAREER_STATUS.motivacao,
  popularidade: CAREER_STATUS.popularidade,
  relTreinador: CAREER_STATUS.relTreinador,
  relCompanheiros: CAREER_STATUS.relCompanheiros,
}

export const CAREER_KEYS = Object.keys(CAREER_VARIABLES)

export const DEFAULT_CAREER = {
  ...DEFAULT_CAREER_STATUS,
  fama: DEFAULT_CAREER_STATUS.popularidade,
  quimica: DEFAULT_CAREER_STATUS.relCompanheiros,
}

/** Temporada: 52 semanas */
export const WEEKS_PER_SEASON = 52

/** Energia mínima para treinar com eficiência plena */
export const MIN_ENERGY_TO_TRAIN = 25

/** Chance base de lesão em treinos intensos (0–1) */
export const BASE_INJURY_CHANCE = 0.08
