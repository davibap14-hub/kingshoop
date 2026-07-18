import {
  DEFENSE_SCHEME_LABELS,
  DEFENSE_SCHEMES,
} from '../../data/defense/constants.js'
import { getTeamCoach } from '../coaches/state.js'
import { ensureCoachDefenseBias, resolveCoachDefenseBias } from './preferences.js'

export function getDefenseView(state = {}) {
  const teamId = state.currentTeamId
  const coachRaw = getTeamCoach(state.gm?.coaches, teamId)
  const coach = ensureCoachDefenseBias(coachRaw)
  const bias = resolveCoachDefenseBias(coach)

  if (!coach) {
    return {
      available: false,
      preferences: [],
      topSchemes: [],
      coachName: null,
      defensiveSystem: null,
    }
  }

  const preferences = DEFENSE_SCHEMES.map((id) => ({
    id,
    label: DEFENSE_SCHEME_LABELS[id],
    value: bias[id],
  })).sort((a, b) => b.value - a.value)

  return {
    available: true,
    teamId,
    coachName: coach.name,
    coachArchetypeId: coach.archetypeId,
    defensiveSystem: coach.defensiveSystem,
    preferences,
    topSchemes: preferences.slice(0, 4),
    lastScheme: state.lastWeekResult?.defense?.lastScheme ?? null,
  }
}
