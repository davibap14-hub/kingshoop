import {
  PERSONALITY_KEYS,
  PERSONALITY_LABELS,
} from '../../data/personality/constants'
import {
  normalizePersonality,
  normalizePlayer,
} from '../../data/players/utils'

/**
 * Lê um traço de personalidade (0–100).
 */
export function trait(player, key, fallback = 50) {
  if (!player) return fallback
  const v = player.personalidade?.[key]
  if (v == null || Number.isNaN(Number(v))) return fallback
  return Math.max(0, Math.min(100, Number(v)))
}

/** Garante objeto personalidade normalizado no jogador. */
export function ensurePersonality(player) {
  if (!player) return null
  if (player.personalidade && typeof player.personalidade === 'object') {
    return {
      ...player,
      personalidade: normalizePersonality(player, player.personalidade),
    }
  }
  return normalizePlayer(player)
}

export function getPersonality(player) {
  const p = ensurePersonality(player)
  return p?.personalidade ?? normalizePersonality(player ?? {})
}

export function listPersonalityTraits(player) {
  const p = getPersonality(player)
  return PERSONALITY_KEYS.map((key) => ({
    key,
    label: PERSONALITY_LABELS[key] ?? key,
    value: p[key] ?? 0,
  }))
}

/** Score 0–1 centrado em 50 (positivo acima, negativo abaixo). */
export function traitBias(player, key) {
  return (trait(player, key) - 50) / 50
}
