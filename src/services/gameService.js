/**
 * Services — fachada Interface → Engine.
 */

import {
  applyArchetypeChange,
  applyCareerDeltas,
  applyStatDelta,
  applyTeamTransfer,
  buildDefaultMatchup,
  buildInitialStats,
  calcOverall,
  chooseBestStyle,
  createInitialCareerState,
  listAvailableActivities,
  listEvolvableGroups,
  rankStylesForRoster,
  resolveEventChoice,
  rollWeeklyEvent,
  runCareerWeek,
  simulateMatch,
  spendEvolutionPoint,
  startCareer,
  triggerEvent,
} from '../engine'
import { getTeamById, TEAMS } from '../data/teams'
import { ARCHETYPES } from '../data/constants/archetypes'
import { WEEKLY_ACTIVITIES } from '../data/career/activities'
import { CAREER_EVENTS, CAREER_EVENT_COUNT } from '../data/events'

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

  eventCount: () => CAREER_EVENT_COUNT,
  listEvents: () => CAREER_EVENTS,

  updateStat(playerStats, statKey, delta) {
    return applyStatDelta(playerStats, statKey, delta)
  },

  updateCareer(careerVariables, key, delta) {
    return applyCareerDeltas(careerVariables, { [key]: delta })
  },

  runWeek(state, activityId) {
    return runCareerWeek(state, activityId)
  },

  advanceWeek(state) {
    return runCareerWeek(state, 'rest')
  },

  resolveEvent(state, eventId, choiceId) {
    return resolveEventChoice(state, eventId, choiceId)
  },

  triggerEvent(state, context) {
    return triggerEvent(state, context)
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

  simulateMatch(input, opts) {
    return simulateMatch(input, opts)
  },

  buildDefaultMatchup(homeTeamId, awayTeamId) {
    return buildDefaultMatchup(homeTeamId, awayTeamId)
  },

  runDefaultMatch(homeTeamId = 'gsw', awayTeamId = 'bos') {
    const matchup = buildDefaultMatchup(homeTeamId, awayTeamId)
    return simulateMatch(matchup)
  },

  chooseBestStyle(players) {
    return chooseBestStyle(players)
  },

  rankStylesForRoster(players) {
    return rankStylesForRoster(players)
  },

  /** Progression Engine */
  listEvolvableGroups(player, archetypeId) {
    return listEvolvableGroups(player, archetypeId)
  },

  spendEvolutionPoint(state, groupKey) {
    return spendEvolutionPoint(state, groupKey)
  },
}
