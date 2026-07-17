/** Variáveis de carreira e defaults */
export const CAREER_VARIABLES = {
  energia: {
    id: 'energia',
    label: 'Energia',
    short: 'ENG',
    unit: '%',
    min: 0,
    max: 100,
    description: 'Condição física e mental da semana.',
  },
  dinheiro: {
    id: 'dinheiro',
    label: 'Dinheiro',
    short: '$$$',
    unit: 'USD',
    min: 0,
    max: null,
    description: 'Salário acumulado e bônus de carreira.',
  },
  fama: {
    id: 'fama',
    label: 'Fama',
    short: 'FAM',
    unit: '',
    min: 0,
    max: 100,
    description: 'Reconhecimento da mídia e dos fãs.',
  },
  quimica: {
    id: 'quimica',
    label: 'Química com Time',
    short: 'QUI',
    unit: '%',
    min: 0,
    max: 100,
    description: 'Relação com companheiros e staff.',
  },
}

export const CAREER_KEYS = Object.keys(CAREER_VARIABLES)

export const DEFAULT_CAREER = {
  energia: 100,
  dinheiro: 15000,
  fama: 12,
  quimica: 55,
}

/** Temporada: 52 semanas (pré-temporada + regular + playoffs) */
export const WEEKS_PER_SEASON = 52
