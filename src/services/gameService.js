/**
 * Services — fachada Interface → Engine.
 * A UI / store chama services; services chamam a Engine e devolvem resultados.
 * Não contém JSX.
 */

import {
  advanceWeek as engineAdvanceWeek,
  applyArchetypeChange,
  applyCareerDeltas,
  applyStatDelta,
  applyTeamTransfer,
  buildInitialStats,
  calcOverall,
  createInitialCareerState,
  rollWeeklyEvent,
  simulateMatch,
} from '../engine'
import { getTeamById } from '../data/teams'
import { TEAMS } from '../data/teams'
import { ARCHETYPES } from '../data/constants/archetypes'

export const gameService = {
  createInitialState: createInitialCareerState,
  buildInitialStats,
  calcOverall,

  getTeam: getTeamById,
  listTeams: () => TEAMS,
  getArchetype: (id) => ARCHETYPES[id],

  updateStat(playerStats, statKey, delta) {
    return applyStatDelta(playerStats, statKey, delta)
  },

  updateCareer(careerVariables, key, delta) {
    return applyCareerDeltas(careerVariables, { [key]: delta })
  },

  advanceWeek(state) {
    return engineAdvanceWeek(state)
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
