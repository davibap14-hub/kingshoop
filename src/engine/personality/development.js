import { trait } from './traits'

/**
 * Multiplicador de XP semanal pela personalidade.
 * Disciplina / confiança / ambição / competitividade.
 */
export function calcXpPersonalityMultiplier(player) {
  if (!player) return 1

  const disciplina = trait(player, 'disciplina')
  const confianca = trait(player, 'confianca')
  const ambicao = trait(player, 'ambicao')
  const competitividade = trait(player, 'competitividade')

  const score =
    (disciplina - 50) * 0.004 +
    (confianca - 50) * 0.003 +
    (ambicao - 50) * 0.0025 +
    (competitividade - 50) * 0.002

  return Math.max(0.7, Math.min(1.35, 1 + score))
}

/**
 * Multiplicador de eficiência de treino.
 */
export function calcTrainingPersonalityMultiplier(player) {
  if (!player) return 1

  const disciplina = trait(player, 'disciplina')
  const confianca = trait(player, 'confianca')
  const ego = trait(player, 'ego')

  // Ego muito alto atrapalha treino coletivo; disciplina eleva
  const score =
    (disciplina - 50) * 0.005 +
    (confianca - 50) * 0.003 -
    Math.max(0, ego - 70) * 0.004

  return Math.max(0.65, Math.min(1.4, 1 + score))
}

/**
 * Modifica XP bruto pela personalidade.
 */
export function applyPersonalityToXp(baseXp, player) {
  return Math.max(3, Math.round(baseXp * calcXpPersonalityMultiplier(player)))
}
