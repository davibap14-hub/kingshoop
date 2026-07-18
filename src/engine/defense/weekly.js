import { TEAMS } from '../../data/teams'
import {
  createCoachEngineState,
  getTeamCoach,
  setTeamCoach,
} from '../coaches/state.js'
import { ensureCoachDefenseBias } from './preferences.js'

/**
 * Garante defenseBias em todos os coaches da liga.
 */
export function processWeeklyDefense({ coaches, gm } = {}) {
  const messages = []
  let state = createCoachEngineState(coaches ?? gm?.coaches)
  let updated = 0

  const teamIds = Object.keys(gm?.rosters ?? {}).length
    ? Object.keys(gm.rosters)
    : TEAMS.map((t) => t.id)

  for (const teamId of teamIds) {
    const coach = getTeamCoach(state, teamId)
    if (!coach) continue
    if (coach.defenseBias && typeof coach.defenseBias === 'object') continue
    const next = ensureCoachDefenseBias(coach)
    state = setTeamCoach(state, teamId, next)
    updated += 1
  }

  if (updated) {
    messages.push(
      `Defensive Engine: preferências defensivas definidas em ${updated} técnico(s).`,
    )
  }

  const nextGm = gm
    ? {
        ...gm,
        coaches: state,
      }
    : gm

  return {
    coaches: state,
    gm: nextGm,
    messages,
    summary: {
      updated,
      teams: teamIds.length,
    },
  }
}
