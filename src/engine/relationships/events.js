import { STATUS_TO_RELATIONSHIP } from '../../data/relationships'
import { applyRelationshipDeltas } from './core.js'
import { createRelationshipsState } from './state.js'

/**
 * Converte deltas de status/efeitos de evento em deltas de relacionamento.
 * Aceita chaves novas (coach, press…) e legadas (relTreinador…).
 */
export function mapEffectsToRelationships(effects = {}) {
  const deltas = {}

  for (const [key, value] of Object.entries(effects)) {
    if (!value) continue

    if (
      key === 'coach' ||
      key === 'gm' ||
      key === 'teammates' ||
      key === 'fans' ||
      key === 'press' ||
      key === 'sponsors' ||
      key === 'agent'
    ) {
      deltas[key] = (deltas[key] ?? 0) + value
      continue
    }

    const mapped = STATUS_TO_RELATIONSHIP[key]
    if (!mapped) continue
    const share = mapped.length > 1 ? value / mapped.length : value
    for (const rel of mapped) {
      deltas[rel] = (deltas[rel] ?? 0) + share
    }
  }

  // Arredonda
  for (const key of Object.keys(deltas)) {
    deltas[key] = Math.round(deltas[key])
  }

  return deltas
}

/**
 * Aplica efeitos de evento/escolha aos relacionamentos.
 */
export function applyEventToRelationships(relationships, effects = {}, meta = {}) {
  const deltas = mapEffectsToRelationships(effects)
  return applyRelationshipDeltas(
    createRelationshipsState(relationships),
    deltas,
    { reason: meta.reason ?? 'event' },
  )
}
