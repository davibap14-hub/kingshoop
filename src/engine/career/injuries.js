/**
 * Compat — Career Engine delega à Injury Engine.
 * @deprecated Prefira `processWeeklyInjuries` / `rollInjuryEvent`.
 */

import {
  createInjuryEngineState,
  rollInjuryEvent,
  tickInjuryRecovery,
  toLegacyInjury,
} from '../injuries'

/**
 * Rola lesão após atividade de risco (treino).
 */
export function rollInjury(state, activity, rng = Math.random) {
  const engine = createInjuryEngineState(
    state.injuryEngine ?? { active: state.injury },
  )
  if (engine.active || state.injury) return null

  const rolled = rollInjuryEvent({
    profile: engine.profile,
    status: state.status,
    activity,
    week: state.currentWeek,
    seasonNumber: state.currentSeason,
    alreadyInjured: false,
    rng,
  })

  return rolled ? toLegacyInjury(rolled) : null
}

/** Tick semanal de lesão (e recovery acelerado). */
export function tickInjury(injury, { accelerated = false } = {}) {
  if (!injury) return { injury: null, healed: false, messages: [] }

  const engine = createInjuryEngineState({
    active: injury.severity
      ? {
          ...injury,
          severity:
            injury.severity === 'mild' ? 'light' : injury.severity,
          weeksEstimated: injury.weeksEstimated ?? injury.weeksRemaining,
          relapseChance: injury.relapseChance ?? 0.12,
          attributeReductions: injury.attributeReductions ?? {},
          treatment: injury.treatment ?? 'physio',
          treatmentLabel: injury.treatmentLabel ?? 'Fisioterapia',
        }
      : injury,
  })

  const tick = tickInjuryRecovery({
    injuryEngine: engine,
    rested: true,
    accelerated,
    rng: Math.random,
  })

  return {
    injury: toLegacyInjury(tick.injuryEngine.active),
    healed: tick.healed,
    messages: tick.messages,
  }
}
