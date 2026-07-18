/**
 * Schema do banco local de jogadores.
 * Dados puros — sem React / Engine.
 */

export const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C']

export const ATTRIBUTE_GROUPS = {
  fisico: {
    id: 'fisico',
    label: 'Físico',
    keys: ['velocidade', 'impulsao', 'forca', 'resistencia'],
    labels: {
      velocidade: 'Velocidade',
      impulsao: 'Impulsão',
      forca: 'Força',
      resistencia: 'Resistência',
    },
  },
  arremesso: {
    id: 'arremesso',
    label: 'Arremesso',
    keys: ['bandeja', 'midRange', 'tresPontos', 'lanceLivre'],
    labels: {
      bandeja: 'Bandeja',
      midRange: 'Mid Range',
      tresPontos: '3PT',
      lanceLivre: 'Lance Livre',
    },
  },
  defesa: {
    id: 'defesa',
    label: 'Defesa',
    keys: ['perimetro', 'garrafao', 'roubo', 'toco'],
    labels: {
      perimetro: 'Perímetro',
      garrafao: 'Garrafão',
      roubo: 'Roubo',
      toco: 'Toco',
    },
  },
  qi: {
    id: 'qi',
    label: 'QI',
    keys: ['passe', 'visao', 'tomadaDecisao'],
    labels: {
      passe: 'Passe',
      visao: 'Visão',
      tomadaDecisao: 'Tomada de Decisão',
    },
  },
}

export const ATTRIBUTE_GROUP_KEYS = Object.keys(ATTRIBUTE_GROUPS)

/**
 * Tendências de comportamento (0–100).
 * A Simulation Engine usa esses valores para decidir o estilo de jogo.
 */
export const TENDENCY_KEYS = [
  'shoot3',
  'drive',
  'pass',
  'isolation',
  'postUp',
  'fastBreak',
  'alleyOop',
  'stepBack',
  'fadeaway',
]

export const TENDENCY_LABELS = {
  shoot3: 'Shoot3',
  drive: 'Drive',
  pass: 'Pass',
  isolation: 'Isolation',
  postUp: 'Post Up',
  fastBreak: 'Fast Break',
  alleyOop: 'Alley Oop',
  stepBack: 'Step Back',
  fadeaway: 'Fadeaway',
}

/** Campos de topo do registro de jogador */
export const PLAYER_FIELDS = [
  'id',
  'nome',
  'idade',
  'posicao',
  'overall',
  'fisico',
  'arremesso',
  'defesa',
  'qi',
  'tendencias',
  'potencial',
  'popularidade',
  'arquetipo',
  'valorMercado',
  'salario',
]
