import {
  COACH_CATEGORY_BIAS,
  DEFAULT_CATEGORY_BIAS,
  PLAYBOOK_CATEGORIES,
  PLAYBOOK_MIN_SIZE,
  PLAYBOOK_TARGET_SIZE,
} from '../../data/playbook/constants.js'
import { PLAY_CATALOG } from '../../data/playbook/catalog.js'
import { TEAMS } from '../../data/teams'
import { getTeamCoach } from '../coaches/state.js'
import {
  createPlaybookEngineState,
  normalizeTeamPlaybook,
} from './state.js'

function hashSeed(value) {
  const text = String(value ?? 'pb')
  let hash = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function unit(seed, salt) {
  const x = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

function categoryBiasForCoach(coach) {
  const id = coach?.archetypeId ?? 'balanced'
  return COACH_CATEGORY_BIAS[id] ?? DEFAULT_CATEGORY_BIAS
}

/**
 * Monta playbook da franquia (dezenas de jogadas) alinhado ao coach.
 */
export function generateTeamPlaybook(teamId, coach = null, opts = {}) {
  const target = opts.targetSize ?? PLAYBOOK_TARGET_SIZE
  const bias = categoryBiasForCoach(coach)
  const seed = hashSeed(`${teamId}:${coach?.id ?? coach?.archetypeId ?? 'x'}`)

  const scored = PLAY_CATALOG.map((play, index) => {
    const catBias = bias[play.category] ?? 50
    const jitter = unit(seed, index + 3) * 18
    const score = play.priority * 0.55 + catBias * 0.45 + jitter
    return { play, score }
  }).sort((a, b) => b.score - a.score)

  // Garante cobertura mínima por categoria (quando existir no catálogo)
  const selected = new Set()
  for (const category of PLAYBOOK_CATEGORIES) {
    const candidates = scored.filter((s) => s.play.category === category)
    if (!candidates.length) continue
    selected.add(candidates[0].play.id)
    if (candidates[1] && (bias[category] ?? 50) >= 55) {
      selected.add(candidates[1].play.id)
    }
  }

  for (const entry of scored) {
    if (selected.size >= target) break
    selected.add(entry.play.id)
  }

  // Preenche até mínimo se algo falhar
  if (selected.size < PLAYBOOK_MIN_SIZE) {
    for (const entry of scored) {
      selected.add(entry.play.id)
      if (selected.size >= PLAYBOOK_MIN_SIZE) break
    }
  }

  const playIds = [...selected]
  return normalizeTeamPlaybook(
    {
      teamId,
      playIds,
      coachArchetypeId: coach?.archetypeId ?? null,
      generatedAt: opts.week ?? null,
      version: 1,
    },
    teamId,
  )
}

export function ensureLeaguePlaybooks(state, { coaches, teams = TEAMS } = {}) {
  let next = createPlaybookEngineState(state)
  let changed = false

  for (const team of teams) {
    const existing = next.byTeam[team.id]
    const coach = getTeamCoach(coaches, team.id)
    const needsRegen =
      !existing?.playIds?.length ||
      (coach?.archetypeId &&
        existing.coachArchetypeId &&
        existing.coachArchetypeId !== coach.archetypeId)

    if (needsRegen) {
      next = {
        ...next,
        byTeam: {
          ...next.byTeam,
          [team.id]: generateTeamPlaybook(team.id, coach),
        },
      }
      changed = true
    } else if (existing && !existing.plays) {
      next = {
        ...next,
        byTeam: {
          ...next.byTeam,
          [team.id]: normalizeTeamPlaybook(existing, team.id),
        },
      }
    }
  }

  return { state: next, changed }
}
