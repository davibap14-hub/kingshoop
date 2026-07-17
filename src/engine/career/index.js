import {
  ARCHETYPES,
  DEFAULT_ARCHETYPE_ID,
} from '../../data/constants/archetypes'
import {
  CAREER_KEYS,
  CAREER_VARIABLES,
  DEFAULT_CAREER,
  WEEKS_PER_SEASON,
} from '../../data/constants/career'
import { DEFAULT_TEAM_ID } from '../../data/teams'
import { calcOverall } from '../progression/stats'
import { clamp } from '../utils/math'

export function getArchetype(archetypeId) {
  return ARCHETYPES[archetypeId] ?? ARCHETYPES[DEFAULT_ARCHETYPE_ID]
}

export function buildInitialStats(archetypeId = DEFAULT_ARCHETYPE_ID) {
  const archetype = getArchetype(archetypeId)
  return { ...archetype.baseStats }
}

export function createInitialCareerState(overrides = {}) {
  return {
    playerName: 'Rookie',
    archetypeId: DEFAULT_ARCHETYPE_ID,
    playerStats: buildInitialStats(DEFAULT_ARCHETYPE_ID),
    careerVariables: { ...DEFAULT_CAREER },
    currentWeek: 1,
    currentSeason: 1,
    currentTeamId: DEFAULT_TEAM_ID,
    lastEvent: 'Bem-vindo à carreira. Prepare-se para a Semana 1.',
    ...overrides,
  }
}

/**
 * Aplica deltas em variáveis de carreira (imutável).
 */
export function applyCareerDeltas(careerVariables, deltas = {}) {
  const next = { ...careerVariables }

  for (const key of CAREER_KEYS) {
    if (deltas[key] == null) continue
    const meta = CAREER_VARIABLES[key]
    const current = next[key] ?? 0
    next[key] = clamp(Math.round(current + deltas[key]), meta.min, meta.max)
  }

  return next
}

/**
 * Avança uma semana de carreira.
 * Entrada: snapshot de estado. Saída: patch imutável (sem side-effects).
 *
 * @param {object} state
 * @param {{ rng?: () => number }} [opts]
 */
export function advanceWeek(state, opts = {}) {
  const rng = opts.rng ?? Math.random
  const overall = calcOverall(state.playerStats)

  const energyCost = 8 + Math.floor(rng() * 7)
  const paycheck = 2500 + Math.round(overall * 40)
  const fameGain = rng() < 0.35 ? 1 : 0
  const chemDelta = rng() < 0.5 ? 1 : -1

  let nextWeek = state.currentWeek + 1
  let nextSeason = state.currentSeason
  if (nextWeek > WEEKS_PER_SEASON) {
    nextWeek = 1
    nextSeason += 1
  }

  const careerVariables = applyCareerDeltas(state.careerVariables, {
    energia: -energyCost + 12,
    dinheiro: paycheck,
    fama: fameGain,
    quimica: chemDelta,
  })

  return {
    currentWeek: nextWeek,
    currentSeason: nextSeason,
    careerVariables,
    lastEvent: `Semana ${state.currentWeek} concluída. Salário +$${paycheck.toLocaleString('en-US')}. Energia −${energyCost}.`,
    meta: {
      energyCost,
      paycheck,
      fameGain,
      chemDelta,
      overall,
    },
  }
}

/**
 * Monta estado após troca de arquétipo (reseta stats base).
 */
export function applyArchetypeChange(archetypeId) {
  const archetype = getArchetype(archetypeId)
  return {
    archetypeId: archetype.id,
    playerStats: buildInitialStats(archetype.id),
    lastEvent: `Arquétipo definido: ${archetype.label}.`,
  }
}

/**
 * Monta patch após transferência de time.
 */
export function applyTeamTransfer(teamId, teamName) {
  return {
    currentTeamId: teamId,
    careerVariablesPatch: { quimica: 50 },
    lastEvent: `Transferido para ${teamName}.`,
  }
}
