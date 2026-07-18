/**
 * Técnicos — dados puros para a Coach Engine.
 */

export {
  COACH_ATTR_KEYS,
  COACH_ATTR_LABELS,
  COACH_ATTR_MIN,
  COACH_ATTR_MAX,
  PRACTICE_FOCI,
  COACH_DECISION_WEIGHTS,
  OFFENSIVE_SET_BIAS_KEYS,
  DEFENSIVE_SCHEME_KEYS,
} from './constants'

export {
  COACH_ARCHETYPES,
  COACH_FIRST_NAMES,
  COACH_LAST_NAMES,
} from './archetypes'

import { COACH_ARCHETYPES } from './archetypes'

/** Compat legado */
export const COACHES = COACH_ARCHETYPES.map((a) => ({
  id: a.id,
  name: a.label,
  role: 'head_coach',
  style: a.preferredStyleId,
  bonuses: {
    quimica: Math.round((a.base.motivation - 50) / 5),
    inteligencia: Math.round((a.base.development - 50) / 5),
  },
}))

export const DEFAULT_COACH_ID = COACH_ARCHETYPES[0]?.id ?? 'pace_and_space'

export function getCoachArchetypeById(id) {
  return COACH_ARCHETYPES.find((a) => a.id === id) ?? COACH_ARCHETYPES[0]
}

/** @deprecated use getCoachArchetypeById */
export function getCoachById(coachId) {
  return getCoachArchetypeById(coachId)
}
