import { trait } from './traits'

/**
 * Preferência do jogador por tipo de atividade semanal.
 * Usado para ordenar / sugerir escolhas alinhadas à personalidade.
 */
export function scoreActivityPreference(player, activity) {
  if (!player || !activity) return 0

  const type = activity.type
  const disciplina = trait(player, 'disciplina')
  const ambicao = trait(player, 'ambicao')
  const competitividade = trait(player, 'competitividade')
  const confianca = trait(player, 'confianca')
  const ego = trait(player, 'ego')
  const lealdade = trait(player, 'lealdade')
  const lideranca = trait(player, 'lideranca')
  const temper = trait(player, 'temperamento')

  switch (type) {
    case 'train':
      return (
        (disciplina - 50) * 0.08 +
        (ambicao - 50) * 0.05 +
        (competitividade - 50) * 0.04 +
        (confianca - 50) * 0.03
      )
    case 'media':
    case 'sponsor':
      return (ego - 50) * 0.1 + (ambicao - 50) * 0.04 - (disciplina - 50) * 0.02
    case 'bonding':
      return (lealdade - 50) * 0.09 + (lideranca - 50) * 0.06 - (ego - 55) * 0.04
    case 'coach':
      return (disciplina - 50) * 0.07 + (lealdade - 50) * 0.04 - (temper - 55) * 0.05
    case 'rest':
    case 'recovery':
      return (disciplina - 50) * 0.03 - (competitividade - 55) * 0.04
    default:
      return 0
  }
}

/**
 * Ordena atividades disponíveis pela personalidade do jogador.
 */
export function sortActivitiesByPersonality(activities = [], player) {
  return [...activities].sort(
    (a, b) =>
      scoreActivityPreference(player, b) - scoreActivityPreference(player, a),
  )
}

/**
 * Sugestão textual da atividade mais alinhada.
 */
export function suggestWeeklyActivity(activities = [], player) {
  const sorted = sortActivitiesByPersonality(activities, player)
  return sorted[0] ?? null
}
