/**
 * Services — fachada Interface → Engine.
 */

import {
  applyArchetypeChange,
  applyCareerDeltas,
  applyStatDelta,
  applyTeamTransfer,
  buildInitialStats,
  calcOverall,
  createInitialCareerState,
  listAvailableActivities,
  rollWeeklyEvent,
  runCareerWeek,
  simulateMatch,
  startCareer,
} from '../engine'
import { getTeamById, TEAMS } from '../data/teams'
import { ARCHETYPES } from '../data/constants/archetypes'
import { WEEKLY_ACTIVITIES } from '../data/career/activities'

export const gameService = {
  createInitialState: createInitialCareerState,
  startCareer,
  buildInitialStats,
  calcOverall,

  getTeam: getTeamById,
  listTeams: () => TEAMS,
  getArchetype: (id) => ARCHETYPES[id],
  listActivities: () => WEEKLY_ACTIVITIES,
  listAvailableActivities,

  updateStat(playerStats, statKey, delta) {
    return applyStatDelta(playerStats, statKey, delta)
  },

  updateCareer(careerVariables, key, delta) {
    return applyCareerDeltas(careerVariables, { [key]: delta })
  },

  /**
   * Executa a semana com UMA atividade. Retorna efeitos para a Interface.
   */
  runWeek(state, activityId) {
    return runCareerWeek(state, activityId)
  },

  /** @deprecated use runWeek */
  advanceWeek(state) {
    return runCareerWeek(state, 'rest')
  },

  changeArchetype(archetypeId) {
    return applyArchetypeChange(archetypeId)
  },

  transferTeam(teamId) {
    const team = getTeamById(teamId)
    return applyTeamTransfer(team.id, team.name)
  },

  rollEvent() {
    return rollWeeklyEvent()
  },

  simulateMatch(input) {
    return simulateMatch(input)
  },
}
