/**
 * Personalidade do jogador — atributos 0–100.
 * A Personality Engine lê esses valores para modular sistemas.
 */

export const PERSONALITY_KEYS = [
  'competitividade',
  'ego',
  'lideranca',
  'lealdade',
  'temperamento',
  'ambicao',
  'disciplina',
  'confianca',
]

export const PERSONALITY_LABELS = {
  competitividade: 'Competitividade',
  ego: 'Ego',
  lideranca: 'Liderança',
  lealdade: 'Lealdade',
  temperamento: 'Temperamento',
  ambicao: 'Ambição',
  disciplina: 'Disciplina',
  confianca: 'Confiança',
}

/** Influência tipada por sistema (documentação / UI) */
export const PERSONALITY_INFLUENCES = {
  chemistry: ['lideranca', 'lealdade', 'ego', 'temperamento'],
  contracts: ['lealdade', 'ambicao', 'ego', 'confianca'],
  trades: ['lealdade', 'ambicao', 'temperamento', 'ego'],
  development: ['disciplina', 'confianca', 'ambicao', 'competitividade'],
  events: ['temperamento', 'ego', 'lealdade', 'competitividade'],
  choices: ['ambicao', 'disciplina', 'competitividade', 'confianca'],
}
