/**
 * Arquétipos de jogador — perfil inicial, bias e limites de evolução.
 * `caps` = teto duro por grupo (média do grupo nunca passa; attrs individuais ≤ hard).
 */

export const ARCHETYPES = {
  scorer: {
    id: 'scorer',
    label: 'Pontuador',
    tagline: 'Caçador de cestas',
    description: 'Prioriza arremesso e criação ofensiva.',
    baseStats: { fisico: 62, arremesso: 78, defesa: 55, inteligencia: 64 },
    growthBias: { fisico: 0.9, arremesso: 1.35, defesa: 0.75, inteligencia: 1.0, qi: 1.0 },
    caps: { fisico: 88, arremesso: 97, defesa: 82, qi: 90 },
  },
  lock: {
    id: 'lock',
    label: 'Defensor',
    tagline: 'Tranca a quadra',
    description: 'Especialista em marcação e intensidade.',
    baseStats: { fisico: 72, arremesso: 52, defesa: 80, inteligencia: 66 },
    growthBias: { fisico: 1.15, arremesso: 0.7, defesa: 1.4, inteligencia: 1.0, qi: 1.0 },
    caps: { fisico: 93, arremesso: 80, defesa: 97, qi: 88 },
  },
  playmaker: {
    id: 'playmaker',
    label: 'Armador',
    tagline: 'Cérebro do ataque',
    description: 'Visão de jogo e organização ofensiva.',
    baseStats: { fisico: 58, arremesso: 68, defesa: 60, inteligencia: 82 },
    growthBias: { fisico: 0.85, arremesso: 1.05, defesa: 0.9, inteligencia: 1.4, qi: 1.4 },
    caps: { fisico: 84, arremesso: 92, defesa: 86, qi: 98 },
  },
  athlete: {
    id: 'athlete',
    label: 'Atleta',
    tagline: 'Explosão pura',
    description: 'Físico dominante, finalização acima do aro.',
    baseStats: { fisico: 82, arremesso: 58, defesa: 64, inteligencia: 54 },
    growthBias: { fisico: 1.4, arremesso: 0.95, defesa: 1.0, inteligencia: 0.75, qi: 0.75 },
    caps: { fisico: 98, arremesso: 86, defesa: 90, qi: 80 },
  },
  twoWay: {
    id: 'twoWay',
    label: 'Two-Way',
    tagline: 'Impacto dos dois lados',
    description: 'Perfil equilibrado ofensivo e defensivo.',
    baseStats: { fisico: 68, arremesso: 68, defesa: 70, inteligencia: 68 },
    growthBias: { fisico: 1.05, arremesso: 1.05, defesa: 1.1, inteligencia: 1.05, qi: 1.05 },
    caps: { fisico: 91, arremesso: 91, defesa: 93, qi: 91 },
  },
}

export const ARCHETYPE_LIST = Object.values(ARCHETYPES)
export const DEFAULT_ARCHETYPE_ID = 'twoWay'

export function getArchetypeCaps(archetypeId) {
  const arch = ARCHETYPES[archetypeId] ?? ARCHETYPES[DEFAULT_ARCHETYPE_ID]
  return { ...arch.caps }
}
