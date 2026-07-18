/**
 * Career Engine — API pública.
 *
 * Controla: treinos, descanso, lesões, contratos,
 * popularidade, relações, energia e motivação.
 * Finanças (salário/patrocínios/investimentos) → Finance Engine.
 *
 * Contrato com a Interface:
 *   runCareerWeek(state, activityId) → { ok, effects, nextState, availableActivities }
 *
 * A Interface escolhe UMA atividade por semana e apenas consome `effects`.
 */

export {
  createCareerState,
  buildStatsFromArchetype,
  createDefaultContract,
  applyStatusDeltas,
  syncLegacyCareerVariables,
  syncPlayerStatsFromDetailed,
} from './state'

export { runCareerWeek, listAvailableActivities, startCareer } from './week'
export { applyTraining } from './activities'
export { rollInjury, tickInjury } from './injuries'
// ——— Compat com API anterior ———
import { ARCHETYPES, DEFAULT_ARCHETYPE_ID } from '../../data/constants/archetypes'
import { DEFAULT_CAREER } from '../../data/constants/career'
import { DEFAULT_TEAM_ID } from '../../data/teams'
import { calcOverall } from '../progression/stats'
import { clamp } from '../utils/math'
import { CAREER_KEYS, CAREER_VARIABLES, WEEKS_PER_SEASON } from '../../data/constants/career'
import { createCareerState, syncLegacyCareerVariables } from './state'
import { runCareerWeek } from './week'

export function getArchetype(archetypeId) {
  return ARCHETYPES[archetypeId] ?? ARCHETYPES[DEFAULT_ARCHETYPE_ID]
}

export function buildInitialStats(archetypeId = DEFAULT_ARCHETYPE_ID) {
  const archetype = getArchetype(archetypeId)
  return { ...archetype.baseStats }
}

export function createInitialCareerState(overrides = {}) {
  const state = createCareerState(overrides)
  return {
    ...state,
    careerVariables: syncLegacyCareerVariables(state.status),
  }
}

export function applyCareerDeltas(careerVariables, deltas = {}) {
  const next = { ...careerVariables }
  for (const key of CAREER_KEYS) {
    if (deltas[key] == null) continue
    const meta = CAREER_VARIABLES[key]
    if (!meta) continue
    const current = next[key] ?? 0
    next[key] = clamp(Math.round(current + deltas[key]), meta.min, meta.max)
  }
  return next
}

/**
 * @deprecated Prefira runCareerWeek(state, activityId).
 * Mantido para compat: avança com descanso automático.
 */
export function advanceWeek(state, opts = {}) {
  const result = runCareerWeek(state, 'rest', opts)
  if (!result.ok) {
    return {
      currentWeek: state.currentWeek,
      currentSeason: state.currentSeason,
      careerVariables: state.careerVariables ?? syncLegacyCareerVariables(state.status),
      lastEvent: result.error,
      meta: { error: result.error },
    }
  }

  return {
    currentWeek: result.nextState.currentWeek,
    currentSeason: result.nextState.currentSeason,
    careerVariables: result.nextState.careerVariables,
    status: result.nextState.status,
    player: result.nextState.player,
    playerStats: result.nextState.playerStats,
    injury: result.nextState.injury,
    sponsorships: result.nextState.sponsorships,
    contract: result.nextState.contract,
    lastEvent: result.effects.messages.join(' '),
    lastWeekResult: result.effects,
    meta: result.effects,
  }
}

export function applyArchetypeChange(archetypeId) {
  const state = createCareerState({ archetypeId })
  const archetype = getArchetype(archetypeId)
  return {
    archetypeId: archetype.id,
    player: state.player,
    playerStats: state.playerStats,
    progression: state.progression,
    lastEvent: `Arquétipo definido: ${archetype.label}.`,
  }
}

export function applyTeamTransfer(teamId, teamName) {
  return {
    currentTeamId: teamId,
    careerVariablesPatch: { quimica: 50, relCompanheiros: 50 },
    statusPatch: { relCompanheiros: 50, relTreinador: 50 },
    relationshipsPatch: {
      coach: 50,
      teammates: 50,
      gm: 50,
      fans: 40,
    },
    lastEvent: `Transferido para ${teamName}.`,
  }
}

export { DEFAULT_CAREER, DEFAULT_TEAM_ID, WEEKS_PER_SEASON, calcOverall }
