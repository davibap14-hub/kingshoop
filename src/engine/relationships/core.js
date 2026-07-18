import {
  RELATIONSHIP_IDS,
  RELATIONSHIP_META,
  RELATIONSHIP_TIERS,
} from '../../data/relationships'
import {
  clampRelationshipValue,
  createRelationshipsState,
} from './state.js'

function ensureState(relationships) {
  return createRelationshipsState(relationships ?? {})
}

/**
 * Aumenta um relacionamento (0–100).
 */
export function increaseRelationship(relationships, key, amount = 1, meta = {}) {
  return applyDelta(relationships, key, Math.abs(amount), meta)
}

/**
 * Diminui um relacionamento (0–100).
 */
export function decreaseRelationship(relationships, key, amount = 1, meta = {}) {
  return applyDelta(relationships, key, -Math.abs(amount), meta)
}

/**
 * Aplica delta genérico a uma chave.
 */
export function applyRelationshipDelta(relationships, key, delta, meta = {}) {
  return applyDelta(relationships, key, delta, meta)
}

/**
 * Aplica vários deltas de uma vez.
 */
export function applyRelationshipDeltas(relationships, deltas = {}, meta = {}) {
  let next = ensureState(relationships)
  const applied = {}
  const log = []

  for (const [key, delta] of Object.entries(deltas)) {
    if (!RELATIONSHIP_IDS.includes(key) || !delta) continue
    const result = applyDelta(next, key, delta, meta)
    next = result.relationships
    applied[key] = (applied[key] ?? 0) + result.changed
    if (result.changed) {
      log.push({
        key,
        delta: result.changed,
        value: next[key],
        reason: meta.reason ?? null,
      })
    }
  }

  return { relationships: next, applied, log }
}

function applyDelta(relationships, key, delta, meta = {}) {
  const next = ensureState(relationships)
  if (!RELATIONSHIP_IDS.includes(key)) {
    return {
      relationships: next,
      key,
      previous: null,
      value: null,
      changed: 0,
      reason: meta.reason ?? null,
      ok: false,
      error: `Relacionamento desconhecido: ${key}`,
    }
  }

  const previous = next[key]
  const value = clampRelationshipValue(previous + (Number(delta) || 0))
  next[key] = value
  const changed = value - previous

  return {
    relationships: next,
    key,
    previous,
    value,
    changed,
    reason: meta.reason ?? null,
    ok: true,
    error: null,
  }
}

/**
 * Status textual / tier de um ou todos os relacionamentos.
 */
export function getRelationshipStatus(relationships, key = null) {
  const state = ensureState(relationships)

  if (key != null) {
    if (!RELATIONSHIP_IDS.includes(key)) {
      return { ok: false, error: `Relacionamento desconhecido: ${key}`, entry: null }
    }
    return { ok: true, error: null, entry: buildEntry(key, state[key]) }
  }

  const entries = Object.fromEntries(
    RELATIONSHIP_IDS.map((id) => [id, buildEntry(id, state[id])]),
  )

  return {
    ok: true,
    error: null,
    relationships: state,
    entries,
    average: Math.round(
      RELATIONSHIP_IDS.reduce((s, id) => s + state[id], 0) / RELATIONSHIP_IDS.length,
    ),
  }
}

function buildEntry(id, value) {
  const tier =
    RELATIONSHIP_TIERS.find((t) => value <= t.max) ??
    RELATIONSHIP_TIERS[RELATIONSHIP_TIERS.length - 1]
  const meta = RELATIONSHIP_META[id]
  return {
    id,
    label: meta?.label ?? id,
    description: meta?.description ?? '',
    value,
    tier: tier.id,
    tierLabel: tier.label,
  }
}
