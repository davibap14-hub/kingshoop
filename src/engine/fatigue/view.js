import {
  FATIGUE_COMPONENT_KEYS,
  FATIGUE_COMPONENT_LABELS,
} from '../../data/fatigue/constants.js'
import { buildFatigueEffects } from './effects.js'
import { createFatigueState } from './state.js'

export function getFatigueView(state = {}) {
  const built = buildFatigueEffects(state.fatigue ?? createFatigueState())
  const effects = built.effects

  const components = FATIGUE_COMPONENT_KEYS.map((key) => ({
    key,
    label: FATIGUE_COMPONENT_LABELS[key],
    value: built[key],
  }))

  return {
    available: true,
    composite: built.composite,
    components,
    effects: {
      speed: effects.speed,
      accuracy: effects.accuracy,
      defense: effects.defense,
      decision: effects.decision,
      training: effects.training,
      recovery: effects.recovery,
      injuryChanceBonus: effects.injuryChanceBonus,
      highFatigue: effects.highFatigue,
      overloaded: effects.overloaded,
    },
    highMinuteStreak: built.highMinuteStreak,
    lastUpdate: built.lastUpdate,
  }
}
