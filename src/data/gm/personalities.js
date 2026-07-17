/**
 * Personalidades de franquia — influenciam decisões do GM.
 */

export const GM_PERSONALITIES = {
  reconstrucao: {
    id: 'reconstrucao',
    label: 'Reconstrução',
    description: 'Prioriza jovens, picks e espaço de teto; move veteranos caros.',
    weights: {
      youth: 1.4,
      potential: 1.5,
      winNow: 0.35,
      capSpace: 1.3,
      starHunting: 0.4,
      tradeAggression: 1.2,
      renewStars: 0.45,
    },
  },
  competitiva: {
    id: 'competitiva',
    label: 'Competitiva',
    description: 'Busca elenco equilibrado e playoffs estáveis.',
    weights: {
      youth: 0.9,
      potential: 1.0,
      winNow: 1.1,
      capSpace: 1.0,
      starHunting: 0.9,
      tradeAggression: 0.9,
      renewStars: 1.0,
    },
  },
  contender: {
    id: 'contender',
    label: 'Contender',
    description: 'All-in por título: estrelas e veteranos de impacto.',
    weights: {
      youth: 0.5,
      potential: 0.7,
      winNow: 1.6,
      capSpace: 0.6,
      starHunting: 1.5,
      tradeAggression: 1.3,
      renewStars: 1.4,
    },
  },
  jovem: {
    id: 'jovem',
    label: 'Jovem',
    description: 'Desenvolvimento: idade baixa e alto potencial.',
    weights: {
      youth: 1.5,
      potential: 1.45,
      winNow: 0.7,
      capSpace: 1.0,
      starHunting: 0.6,
      tradeAggression: 0.85,
      renewStars: 0.7,
    },
  },
  financeira: {
    id: 'financeira',
    label: 'Financeira',
    description: 'Disciplina de teto; evita luxo tributário e contratos longos caros.',
    weights: {
      youth: 0.85,
      potential: 0.9,
      winNow: 0.85,
      capSpace: 1.6,
      starHunting: 0.55,
      tradeAggression: 0.7,
      renewStars: 0.65,
    },
  },
}

export const GM_PERSONALITY_IDS = Object.keys(GM_PERSONALITIES)

/** Atribuição inicial fixa por franquia (determinística) */
export const TEAM_PERSONALITY_MAP = {
  gsw: 'contender',
  bos: 'competitiva',
  lal: 'contender',
  mia: 'financeira',
  den: 'competitiva',
  nyk: 'jovem',
}
