/**
 * Objetivos de franquia — Franchise AI.
 * Cada objetivo define pesos determinísticos para decisões.
 */

export const FRANCHISE_OBJECTIVES = {
  tank: {
    id: 'tank',
    label: 'Tank',
    description: 'Maximizar posição no draft; mover veteranos e priorizar jovens.',
    weights: {
      youth: 1.55,
      potential: 1.6,
      winNow: 0.25,
      capSpace: 1.25,
      starHunting: 0.3,
      tradeAggression: 1.35,
      renewStars: 0.35,
      releaseVeterans: 1.4,
      signFloor: 0.5,
    },
  },
  playoffs: {
    id: 'playoffs',
    label: 'Playoffs',
    description: 'Montar elenco competitivo para garantir pós-temporada.',
    weights: {
      youth: 0.85,
      potential: 0.95,
      winNow: 1.25,
      capSpace: 0.95,
      starHunting: 1.0,
      tradeAggression: 1.0,
      renewStars: 1.1,
      releaseVeterans: 0.6,
      signFloor: 1.1,
    },
  },
  title: {
    id: 'title',
    label: 'Título',
    description: 'All-in por campeonato: estrelas e peças de impacto.',
    weights: {
      youth: 0.45,
      potential: 0.65,
      winNow: 1.7,
      capSpace: 0.55,
      starHunting: 1.6,
      tradeAggression: 1.4,
      renewStars: 1.45,
      releaseVeterans: 0.35,
      signFloor: 1.35,
    },
  },
  development: {
    id: 'development',
    label: 'Desenvolvimento',
    description: 'Crescer o núcleo jovem e acumular potencial.',
    weights: {
      youth: 1.5,
      potential: 1.5,
      winNow: 0.65,
      capSpace: 1.05,
      starHunting: 0.55,
      tradeAggression: 0.9,
      renewStars: 0.75,
      releaseVeterans: 1.15,
      signFloor: 0.85,
    },
  },
  economy: {
    id: 'economy',
    label: 'Economia',
    description: 'Disciplina de teto e valor por dólar acima de estrelas caras.',
    weights: {
      youth: 0.9,
      potential: 0.95,
      winNow: 0.8,
      capSpace: 1.7,
      starHunting: 0.45,
      tradeAggression: 0.65,
      renewStars: 0.6,
      releaseVeterans: 1.0,
      signFloor: 0.7,
    },
  },
}

export const FRANCHISE_OBJECTIVE_IDS = Object.keys(FRANCHISE_OBJECTIVES)

/**
 * Objetivo-base por personalidade GM (ponto de partida da temporada).
 */
export const PERSONALITY_DEFAULT_OBJECTIVE = {
  reconstrucao: 'tank',
  competitiva: 'playoffs',
  contender: 'title',
  jovem: 'development',
  financeira: 'economy',
}
