import { INJURY_TYPES } from '../../data/career/injuries'
import { BASE_INJURY_CHANCE, MIN_ENERGY_TO_TRAIN } from '../../data/constants/career'
import { pickWeighted } from '../utils/math'

function randomInRange([min, max], rng) {
  return min + Math.floor(rng() * (max - min + 1))
}

/**
 * Rola lesão após atividade de risco (treino).
 * Fatores: energia baixa, motivação baixa, já lesionado.
 */
export function rollInjury(state, activity, rng = Math.random) {
  if (state.injury) return null
  if (activity.type !== 'train') return null

  let chance = BASE_INJURY_CHANCE
  if (state.status.energia < MIN_ENERGY_TO_TRAIN) chance += 0.12
  if (state.status.energia < 15) chance += 0.15
  if (state.status.motivacao < 30) chance += 0.05
  if (activity.energyCost >= 26) chance += 0.04

  if (rng() > chance) return null

  const type = pickWeighted(INJURY_TYPES, 'weight', rng)
  const weeks = randomInRange(type.weeks, rng)

  return {
    id: type.id,
    label: type.label,
    severity: type.severity,
    weeksRemaining: weeks,
    blocksTraining: type.blocksTraining,
    occurredOnWeek: state.currentWeek,
  }
}

/** Tick semanal de lesão (e recovery acelerado). */
export function tickInjury(injury, { accelerated = false } = {}) {
  if (!injury) return { injury: null, healed: false, messages: [] }

  const reduction = accelerated ? 2 : 1
  const weeksRemaining = injury.weeksRemaining - reduction

  if (weeksRemaining <= 0) {
    return {
      injury: null,
      healed: true,
      messages: [`Recuperado de: ${injury.label}.`],
    }
  }

  return {
    injury: { ...injury, weeksRemaining },
    healed: false,
    messages: [
      `Lesão ativa: ${injury.label} (${weeksRemaining} sem. restantes).`,
    ],
  }
}
