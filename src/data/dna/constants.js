/**
 * Player DNA Engine — identidade única e estável do jogador.
 */

export const DNA_KEYS = [
  'ritmo',
  'agressividade',
  'confianca',
  'clutch',
  'criatividade',
  'consistencia',
  'tendenciaErros',
  'assumirResponsabilidade',
  'preferenciaInfiltracao',
  'preferenciaArremesso',
  'preferenciaPasse',
  'preferenciaContraAtaque',
]

export const DNA_LABELS = {
  ritmo: 'Ritmo de jogo',
  agressividade: 'Agressividade',
  confianca: 'Confiança',
  clutch: 'Clutch',
  criatividade: 'Criatividade',
  consistencia: 'Consistência',
  tendenciaErros: 'Tendência a erros',
  assumirResponsabilidade: 'Assumir responsabilidade',
  preferenciaInfiltracao: 'Preferência por infiltração',
  preferenciaArremesso: 'Preferência por arremesso',
  preferenciaPasse: 'Preferência por passe',
  preferenciaContraAtaque: 'Preferência por contra-ataque',
}

/** Desvio máximo absoluto em relação ao DNA âncora (nunca muda completamente) */
export const DNA_MAX_DRIFT = 12

/** Variação máxima por traço por semana */
export const DNA_WEEKLY_MAX_DELTA = 0.65

/** Peso do DNA nas decisões (Decision Engine) */
export const DNA_DECISION_WEIGHT = 0.85
