import {
  COACH_DEFENSE_BIAS,
  DEFAULT_DEFENSE_BIAS,
  DEFENSE_SCHEMES,
} from '../../data/defense/constants.js'
import { clamp } from '../utils/math'

export function clampDefenseBias(raw = {}) {
  const source = raw && typeof raw === 'object' ? raw : {}
  return Object.fromEntries(
    DEFENSE_SCHEMES.map((key) => [
      key,
      clamp(Math.round(Number(source[key] ?? DEFAULT_DEFENSE_BIAS[key] ?? 50)), 1, 99),
    ]),
  )
}

/** Preferências do coach (arquétipo + overrides). */
export function resolveCoachDefenseBias(coach = null) {
  if (!coach) return { ...DEFAULT_DEFENSE_BIAS }
  const fromArchetype =
    COACH_DEFENSE_BIAS[coach.archetypeId] ?? DEFAULT_DEFENSE_BIAS
  const explicit = coach.defenseBias
  if (explicit && typeof explicit === 'object') {
    return clampDefenseBias({ ...fromArchetype, ...explicit })
  }
  return clampDefenseBias(fromArchetype)
}

export function ensureCoachDefenseBias(coach) {
  if (!coach) return null
  return {
    ...coach,
    defenseBias: resolveCoachDefenseBias(coach),
  }
}
