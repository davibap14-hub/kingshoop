import {
  FRANCHISE_REPUTATION_BASE,
  FRANCHISE_REPUTATION_MAX,
  FRANCHISE_REPUTATION_MIN,
} from '../../data/dynasty/constants.js'
import { clamp } from '../utils/math'

/**
 * Estado vivo da Dynasty Engine (carreira).
 */
export function createDynastyState(overrides = {}) {
  return {
    /** teamId → dinastia ativa */
    active: { ...(overrides.active ?? {}) },
    /** ids já reconhecidos (evita spam de notícia) */
    recognizedIds: [...(overrides.recognizedIds ?? [])],
    /** reputação de franquia 0–100 */
    franchiseReputation: { ...(overrides.franchiseReputation ?? {}) },
    lastEvents: [...(overrides.lastEvents ?? [])],
    lastEvaluatedSeason: overrides.lastEvaluatedSeason ?? null,
  }
}

export function hydrateDynastyState(raw = null) {
  return createDynastyState(raw ?? {})
}

export function getFranchiseReputation(dynasty, teamId) {
  const v = dynasty?.franchiseReputation?.[teamId]
  if (v == null) return FRANCHISE_REPUTATION_BASE
  return clamp(v, FRANCHISE_REPUTATION_MIN, FRANCHISE_REPUTATION_MAX)
}

export function getActiveDynasty(dynasty, teamId) {
  return dynasty?.active?.[teamId] ?? null
}

export function listActiveDynasties(dynasty) {
  return Object.values(dynasty?.active ?? {})
}
