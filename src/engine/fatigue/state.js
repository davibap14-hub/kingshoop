import {
  FATIGUE_COMPONENT_KEYS,
  FATIGUE_MAX,
  FATIGUE_MIN,
} from '../../data/fatigue/constants.js'
import { clamp } from '../utils/math'

export function clampFatigueValue(value) {
  return clamp(Math.round(Number(value) || 0), FATIGUE_MIN, FATIGUE_MAX)
}

export function createFatigueState(raw = {}) {
  const source = raw && typeof raw === 'object' ? raw : {}
  const components = {}
  for (const key of FATIGUE_COMPONENT_KEYS) {
    const fromRoot = source[key]
    const fromNested = source.components?.[key]
    components[key] = clampFatigueValue(
      fromRoot != null ? fromRoot : fromNested != null ? fromNested : 0,
    )
  }

  const isEmpty =
    !source ||
    (FATIGUE_COMPONENT_KEYS.every((k) => source[k] == null) &&
      !source.components)

  if (isEmpty) {
    components.weekly = 12
    components.season = 8
  }

  return {
    ...components,
    highMinuteStreak: Number(source.highMinuteStreak) || 0,
    lastWasAway: Boolean(source.lastWasAway),
    lastPlayedWeek: source.lastPlayedWeek ?? null,
    lastSeasonNumber: source.lastSeasonNumber ?? null,
    lastUpdate: source.lastUpdate ?? null,
  }
}

export function hydrateFatigueState(raw) {
  return createFatigueState(raw ?? {})
}
