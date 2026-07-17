/**
 * Arquétipos de jogador — perfil inicial e bias de evolução.
 * Dados puros; a Engine aplica growthBias na progressão.
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
export const DEFAULT_ARCHETYPE_ID = 'twoWay'
