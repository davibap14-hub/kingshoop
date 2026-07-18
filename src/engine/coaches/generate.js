import {
  COACH_ARCHETYPES,
  COACH_ATTR_KEYS,
  COACH_FIRST_NAMES,
  COACH_LAST_NAMES,
} from '../../data/coaches'
import { TEAMS } from '../../data/teams'
import { clamp } from '../utils/math'
import {
  clampCoachAttr,
  createCoachEngineState,
  normalizeCoach,
} from './state.js'

/** Hash determinístico a partir de string (sem RNG). */
export function hashString(str) {
  let h = 2166136261
  const s = String(str)
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function pickIndex(hash, length) {
  if (length <= 0) return 0
  return hash % length
}

/**
 * Gera head coach determinístico para uma franquia.
 * Atributos derivados do arquétipo + hash do time — sem aleatório puro.
 */
export function generateCoachForTeam(teamId, opts = {}) {
  const season = opts.seasonNumber ?? 1
  const seed = hashString(`${teamId}|coach|${season}`)
  const archetype =
    COACH_ARCHETYPES[pickIndex(seed, COACH_ARCHETYPES.length)] ??
    COACH_ARCHETYPES[0]

  const first =
    COACH_FIRST_NAMES[pickIndex(seed >>> 3, COACH_FIRST_NAMES.length)]
  const last =
    COACH_LAST_NAMES[pickIndex(seed >>> 7, COACH_LAST_NAMES.length)]

  const attrs = {}
  for (let i = 0; i < COACH_ATTR_KEYS.length; i++) {
    const key = COACH_ATTR_KEYS[i]
    const base = archetype.base[key] ?? 55
    // Variação estável ±8 a partir do hash (não Math.random)
    const jitter = ((seed >>> (i * 3)) % 17) - 8
    attrs[key] = clampCoachAttr(base + jitter)
  }

  return normalizeCoach({
    id: `coach_${teamId}_${archetype.id}`,
    name: `${first} ${last}`,
    teamId,
    archetypeId: archetype.id,
    preferredStyleId: archetype.preferredStyleId,
    setBias: { ...archetype.setBias },
    ...attrs,
  })
}

/**
 * Garante coaches para todos os times da liga.
 */
export function ensureLeagueCoaches(coachState, opts = {}) {
  let state = createCoachEngineState(coachState)
  const teams = opts.teams ?? TEAMS
  const seasonNumber = opts.seasonNumber ?? 1

  for (const team of teams) {
    if (state.byTeam[team.id]) continue
    state = {
      ...state,
      byTeam: {
        ...state.byTeam,
        [team.id]: generateCoachForTeam(team.id, { seasonNumber }),
      },
    }
  }

  return state
}

/**
 * Qualidade da equipe médica / staff a partir do coach (rigor + development).
 */
export function deriveMedicalStaffFromCoach(coach) {
  if (!coach) return 55
  return clamp(
    Math.round(
      40 +
        (coach.rigor ?? 50) * 0.35 +
        (coach.development ?? 50) * 0.25,
    ),
    30,
    92,
  )
}
