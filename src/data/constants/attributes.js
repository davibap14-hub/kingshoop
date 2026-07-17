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
