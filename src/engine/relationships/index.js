/**
 * Relationship Engine — gerencia todos os relacionamentos do jogo.
 *
 * Treinador · GM · Companheiros · Torcida · Imprensa · Patrocinadores · Agente
 *
 * API pública:
 *   increaseRelationship / decreaseRelationship
 *   calculateRelationshipEffects / getRelationshipStatus
 *
 * Isolada da Interface — só Engine + Data.
 */

export {
  RELATIONSHIP_IDS,
  RELATIONSHIP_META,
  RELATIONSHIP_MIN,
  RELATIONSHIP_MAX,
  DEFAULT_RELATIONSHIPS,
  RELATIONSHIP_TIERS,
  ACTIVITY_RELATIONSHIP_DELTAS,
  STATUS_TO_RELATIONSHIP,
  EFFECT_THRESHOLDS,
} from '../../data/relationships'

export {
  createRelationshipsState,
  clampRelationshipValue,
  hydrateRelationshipsFromStatus,
  syncStatusFromRelationships,
} from './state.js'

export {
  increaseRelationship,
  decreaseRelationship,
  applyRelationshipDelta,
  applyRelationshipDeltas,
  getRelationshipStatus,
} from './core.js'

export { calculateRelationshipEffects } from './effects.js'

export {
  buildActivityRelationshipDeltas,
  applyActivityToRelationships,
} from './activity.js'

export {
  mapEffectsToRelationships,
  applyEventToRelationships,
} from './events.js'

export { processWeeklyRelationships } from './weekly.js'
export { getRelationshipView } from './view.js'
