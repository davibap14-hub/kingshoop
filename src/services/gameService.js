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
  analyzeFranchise,
  capPressure,
  getConferenceTables,
  getGmView,
  calculateRelationshipEffects,
  getBalanceView,
  getHistoryView,
  getRelationshipView,
  getSeasonView,
  GM_PERSONALITIES,
  investCash,
  listEvolvableGroups,
  rankStylesForRoster,
  resolveEventChoice,
  rollWeeklyEvent,
  runCareerWeek,
  setLuxuryLevel,
  simulateGame,
  simulateMatch,
  spendEvolutionPoint,
  startCareer,
  triggerEvent,
} from '../engine'
import { getTeamById, TEAMS } from '../data/teams'
import { ARCHETYPES } from '../data/constants/archetypes'
import { WEEKLY_ACTIVITIES } from '../data/career/activities'
import { CAREER_EVENTS, CAREER_EVENT_COUNT } from '../data/events'
import { LUXURY_LEVELS } from '../data/finance/constants'
import { DEFAULT_SAVE_NAME } from '../data/save/constants'
import { saveService } from './saveService'

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

  simulateGame(input, opts) {
    return simulateGame(input, opts)
  },

  buildDefaultMatchup(homeTeamId, awayTeamId) {
    return buildDefaultMatchup(homeTeamId, awayTeamId)
  },

  runDefaultMatch(homeTeamId = 'gsw', awayTeamId = 'bos') {
    const matchup = buildDefaultMatchup(homeTeamId, awayTeamId)
    return simulateGame(matchup)
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

  /** Finance Engine */
  setLuxuryLevel(state, luxuryLevel) {
    return setLuxuryLevel(state, luxuryLevel)
  },

  investCash(state, productId, amount) {
    return investCash(state, productId, amount)
  },

  listLuxuryLevels() {
    return LUXURY_LEVELS
  },

  /** Season Engine — Interface só lê */
  getSeasonView(state) {
    return getSeasonView(state.season, {
      teamId: state.currentTeamId,
      week: state.currentWeek,
    })
  },

  getConferenceTables(standings) {
    return getConferenceTables(standings)
  },

  /** General Manager Engine — Interface só lê */
  getGmView(state) {
    return getGmView(state.gm, { teamId: state.currentTeamId })
  },

  /** History Engine — Interface só lê */
  getHistoryView(state) {
    return getHistoryView(state.leagueHistory)
  },

  /** Balance Engine — Interface só lê */
  getBalanceView(state) {
    return getBalanceView(state)
  },

  /** Relationship Engine — Interface só lê */
  getRelationshipView(state) {
    return getRelationshipView(state)
  },

  getRelationshipEffects(relationships) {
    return calculateRelationshipEffects(relationships)
  },

  analyzeFranchise(state, teamId) {
    return analyzeFranchise(state.gm, teamId ?? state.currentTeamId, state.season)
  },

  getTeamCap(state, teamId) {
    return capPressure(state.gm?.contracts, teamId ?? state.currentTeamId)
  },

  listGmPersonalities() {
    return GM_PERSONALITIES
  },

  /** Save System (LocalStorage) */
  listSaves() {
    return saveService.listSaves()
  },

  getActiveSaveId() {
    return saveService.getActiveSaveId()
  },

  clearActiveSave() {
    return saveService.setActiveSaveId(null)
  },

  createSave(state, name) {
    return saveService.createSave(state, name)
  },

  saveCurrent(state, name) {
    return saveService.saveToSlot(state, saveService.getActiveSaveId(), {
      name,
    })
  },

  autoSave(state) {
    return saveService.autoSave(state)
  },

  loadSave(id) {
    const result = saveService.loadSave(id)
    if (!result.ok) return result
    const boot = startCareer(result.overrides)
    return {
      ok: true,
      error: null,
      payload: result.payload,
      ...boot,
      activeSaveId: id,
    }
  },

  loadActiveSave() {
    const result = saveService.loadActiveSave()
    if (!result.ok) return result
    const boot = startCareer(result.overrides)
    return {
      ok: true,
      error: null,
      payload: result.payload,
      ...boot,
      activeSaveId: result.payload.id,
    }
  },

  /** Boot: restaura save ativo ou inicia carreira nova. */
  bootCareer() {
    const restored = this.loadActiveSave()
    if (restored.ok) return restored
    const boot = startCareer()
    return {
      ok: true,
      error: null,
      payload: null,
      ...boot,
      activeSaveId: null,
      isNew: true,
    }
  },

  deleteSave(id) {
    return saveService.deleteSave(id)
  },

  renameSave(id, name) {
    return saveService.renameSave(id, name)
  },

  defaultSaveName() {
    return DEFAULT_SAVE_NAME
  },
}
