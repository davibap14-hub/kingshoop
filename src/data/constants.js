/**
 * Constantes iniciais — The Fenômeno NBA
 */

/** Atributos do jogador (0–99) */
export const ATTRIBUTES = {
  fisico: {
    id: 'fisico',
    label: 'Físico',
    short: 'FIS',
    description: 'Força, explosão, resistência e atleticismo.',
  },
  arremesso: {
    id: 'arremesso',
    label: 'Arremesso',
    short: 'ARR',
    description: 'Finalização de média e longa distância.',
  },
  defesa: {
    id: 'defesa',
    label: 'Defesa',
    short: 'DEF',
    description: 'Marcação, roubos, bloqueios e ajuda defensiva.',
  },
  inteligencia: {
    id: 'inteligencia',
    label: 'Inteligência',
    short: 'INT',
    description: 'Leitura de jogo, visão e tomada de decisão.',
  },
}

export const ATTRIBUTE_KEYS = Object.keys(ATTRIBUTES)

/** Variáveis de carreira */
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

/**
 * Arquétipos de jogador — definem perfil inicial e foco de evolução.
 */
export const ARCHETYPES = {
  scorer: {
    id: 'scorer',
    label: 'Pontuador',
    tagline: 'Caçador de cestas',
    description: 'Prioriza arremesso e criação ofensiva.',
    baseStats: { fisico: 62, arremesso: 78, defesa: 55, inteligencia: 64 },
    growthBias: { fisico: 0.9, arremesso: 1.35, defesa: 0.75, inteligencia: 1.0 },
  },
  lock: {
    id: 'lock',
    label: 'Defensor',
    tagline: 'Tranca a quadra',
    description: 'Especialista em marcação e intensidade.',
    baseStats: { fisico: 72, arremesso: 52, defesa: 80, inteligencia: 66 },
    growthBias: { fisico: 1.15, arremesso: 0.7, defesa: 1.4, inteligencia: 1.0 },
  },
  playmaker: {
    id: 'playmaker',
    label: 'Armador',
    tagline: 'Cérebro do ataque',
    description: 'Visão de jogo e organização ofensiva.',
    baseStats: { fisico: 58, arremesso: 68, defesa: 60, inteligencia: 82 },
    growthBias: { fisico: 0.85, arremesso: 1.05, defesa: 0.9, inteligencia: 1.4 },
  },
  athlete: {
    id: 'athlete',
    label: 'Atleta',
    tagline: 'Explosão pura',
    description: 'Físico dominante, finalização acima do aro.',
    baseStats: { fisico: 82, arremesso: 58, defesa: 64, inteligencia: 54 },
    growthBias: { fisico: 1.4, arremesso: 0.95, defesa: 1.0, inteligencia: 0.75 },
  },
  twoWay: {
    id: 'twoWay',
    label: 'Two-Way',
    tagline: 'Impacto dos dois lados',
    description: 'Perfil equilibrado ofensivo e defensivo.',
    baseStats: { fisico: 68, arremesso: 68, defesa: 70, inteligencia: 68 },
    growthBias: { fisico: 1.05, arremesso: 1.05, defesa: 1.1, inteligencia: 1.05 },
  },
}

export const ARCHETYPE_LIST = Object.values(ARCHETYPES)

/** Valores iniciais padrão de carreira */
export const DEFAULT_CAREER = {
  energia: 100,
  dinheiro: 15000,
  fama: 12,
  quimica: 55,
}

/** Temporada: 52 semanas (pré-temporada + regular + playoffs simplificados) */
export const WEEKS_PER_SEASON = 52

export const TEAMS = [
  { id: 'gsw', name: 'Golden State Warriors', short: 'GSW', city: 'San Francisco' },
  { id: 'bos', name: 'Boston Celtics', short: 'BOS', city: 'Boston' },
  { id: 'lal', name: 'Los Angeles Lakers', short: 'LAL', city: 'Los Angeles' },
  { id: 'mia', name: 'Miami Heat', short: 'MIA', city: 'Miami' },
  { id: 'den', name: 'Denver Nuggets', short: 'DEN', city: 'Denver' },
  { id: 'nyk', name: 'New York Knicks', short: 'NYK', city: 'New York' },
]

export const DEFAULT_TEAM_ID = 'gsw'
