import {
  DEFAULT_RELATIONSHIPS,
  RELATIONSHIP_IDS,
  RELATIONSHIP_MAX,
  RELATIONSHIP_MIN,
} from '../../data/relationships'
import { clamp } from '../utils/math'

/**
 * Estado inicial dos relacionamentos (0–100).
 */
export function createRelationshipsState(overrides = {}) {
  const next = { ...DEFAULT_RELATIONSHIPS }
  for (const id of RELATIONSHIP_IDS) {
    if (overrides[id] != null) {
      next[id] = clampRelationshipValue(overrides[id])
    }
  }
  return next
}

export function clampRelationshipValue(value) {
  return clamp(Math.round(Number(value) || 0), RELATIONSHIP_MIN, RELATIONSHIP_MAX)
}

/**
 * Hidrata a partir de status legado (saves antigos).
 */
export function hydrateRelationshipsFromStatus(status = {}, overrides = {}) {
  return createRelationshipsState({
    coach: overrides.coach ?? status.relTreinador ?? DEFAULT_RELATIONSHIPS.coach,
    teammates:
      overrides.teammates ??
      status.relCompanheiros ??
      DEFAULT_RELATIONSHIPS.teammates,
    fans: overrides.fans ?? status.popularidade ?? DEFAULT_RELATIONSHIPS.fans,
    press: overrides.press ?? status.popularidade ?? DEFAULT_RELATIONSHIPS.press,
    gm: overrides.gm,
    sponsors: overrides.sponsors,
    agent: overrides.agent,
  })
}

/**
 * Espelha relacionamentos nos campos legados de status.
 */
export function syncStatusFromRelationships(status, relationships) {
  const fans = relationships.fans ?? DEFAULT_RELATIONSHIPS.fans
  const press = relationships.press ?? DEFAULT_RELATIONSHIPS.press
  return {
    ...status,
    relTreinador: relationships.coach ?? status.relTreinador,
    relCompanheiros: relationships.teammates ?? status.relCompanheiros,
    popularidade: Math.round((fans + press) / 2),
  }
}
