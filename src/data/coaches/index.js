/**
 * Técnicos e staff — preparado para chemistry / playstyle bonuses.
 */

export const COACHES = [
  {
    id: 'generic_hc',
    name: 'Head Coach',
    role: 'head_coach',
    style: 'balanced',
    bonuses: { quimica: 0, inteligencia: 0 },
  },
]

export const DEFAULT_COACH_ID = 'generic_hc'

export function getCoachById(coachId) {
  return COACHES.find((c) => c.id === coachId) ?? COACHES[0]
}
