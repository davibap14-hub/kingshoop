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
  'potencial',
  'popularidade',
  'arquetipo',
  'valorMercado',
  'salario',
]
