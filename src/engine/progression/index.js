/**
 * Progression Engine — API pública.
 *
 * Toda semana o jogador ganha XP. Ao subir de nível, recebe pontos de evolução.
 * Pontos melhoram Físico / Arremesso / Defesa / QI sem ultrapassar caps do arquétipo.
 * Evolução é gradual (+1 no atributo mais baixo do grupo).
 */

export {
  calcOverall,
  applyStatDelta,
  calcTrainingGain,
} from './stats'

export {
  xpRequiredForLevel,
  createProgressionState,
  calcWeeklyXp,
  applyXpGain,
  clampProgression,
} from './xp'

export {
  getGroupCap,
  getGroupAverage,
  canEvolveGroup,
  listEvolvableGroups,
  applyEvolutionPoint,
  spendEvolutionPoint,
} from './evolve'

import { calcWeeklyXp, applyXpGain } from './xp'

/**
 * Pipeline semanal da Progression Engine.
 */
export function processWeeklyProgression(state, activity, rng = Math.random) {
  const xpGain = calcWeeklyXp(state, activity, rng)
  const result = applyXpGain(state.progression, xpGain)

  return {
    ...result,
    nextProgression: result.progression,
  }
}
