import {
  COACH_ATTR_KEYS,
  COACH_ATTR_MAX,
  COACH_ATTR_MIN,
} from '../../data/coaches'
import { resolveCoachDefenseBias } from '../defense/preferences.js'
import { clamp } from '../utils/math'

export function clampCoachAttr(value) {
  return clamp(Math.round(Number(value) || 50), COACH_ATTR_MIN, COACH_ATTR_MAX)
}

/**
 * Estado da Coach Engine — um head coach por franquia.
 * byTeam: { [teamId]: Coach }
 */
export function createCoachEngineState(overrides = {}) {
  return {
    byTeam: { ...(overrides.byTeam ?? {}) },
    lastDecisions: Array.isArray(overrides.lastDecisions)
      ? overrides.lastDecisions.slice(-40)
      : [],
    lastUpdate: overrides.lastUpdate ?? null,
  }
}

export function getTeamCoach(coachState, teamId) {
  if (!teamId) return null
  return coachState?.byTeam?.[teamId] ?? null
}

export function setTeamCoach(coachState, teamId, coach) {
  return {
    ...createCoachEngineState(coachState),
    byTeam: {
      ...(coachState?.byTeam ?? {}),
      [teamId]: coach,
    },
  }
}

export function normalizeCoach(raw = {}) {
  const attrs = {}
  for (const key of COACH_ATTR_KEYS) {
    attrs[key] = clampCoachAttr(raw[key] ?? raw.base?.[key] ?? 55)
  }
  const base = {
    id: raw.id ?? 'coach_unknown',
    name: raw.name ?? 'Head Coach',
    teamId: raw.teamId ?? null,
    archetypeId: raw.archetypeId ?? null,
    preferredStyleId: raw.preferredStyleId ?? 'fast_pace',
    setBias: { ...(raw.setBias ?? {}) },
    ...attrs,
  }
  return {
    ...base,
    defenseBias: resolveCoachDefenseBias({
      ...base,
      defenseBias: raw.defenseBias,
    }),
  }
}
