import { LEGACY_TIERS } from '../../data/legacy/constants.js'

/**
 * Estado vivo da Legacy Engine.
 */
export function createLegacyState(overrides = {}) {
  return {
    /** playerId → { score, tier, breakdown, inputs, updatedAt, season } */
    scores: { ...(overrides.scores ?? {}) },
    /** Ranking histórico interno (ordenado) */
    ranking: [...(overrides.ranking ?? [])],
    lastEvaluatedSeason: overrides.lastEvaluatedSeason ?? null,
    lastEvents: [...(overrides.lastEvents ?? [])],
  }
}

export function hydrateLegacyState(raw = null) {
  return createLegacyState(raw ?? {})
}

export function getPlayerLegacy(legacy, playerId) {
  if (!legacy?.scores || !playerId) return null
  return legacy.scores[playerId] ?? null
}

export function resolveLegacyTier(score) {
  const order = ['immortal', 'legend', 'great', 'notable', 'developing']
  for (const id of order) {
    if (score >= LEGACY_TIERS[id].minScore) return LEGACY_TIERS[id]
  }
  return LEGACY_TIERS.developing
}
