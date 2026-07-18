import { DNA_KEYS, DNA_MAX_DRIFT } from '../../data/dna/constants.js'
import { clamp } from '../utils/math.js'
import { generatePlayerDna } from './generate.js'

function clampStat(value) {
  return Math.round(clamp(Number(value) || 50, 1, 99))
}

export function clampDna(dna, fallback = 50) {
  const source = dna && typeof dna === 'object' ? dna : {}
  return Object.fromEntries(
    DNA_KEYS.map((key) => [key, clampStat(source[key] ?? fallback)]),
  )
}

/** Mantém DNA atual dentro da âncora ± DNA_MAX_DRIFT. */
export function clampDnaToAnchor(dna, anchor) {
  const current = clampDna(dna)
  const core = clampDna(anchor)
  return Object.fromEntries(
    DNA_KEYS.map((key) => {
      const min = Math.max(1, core[key] - DNA_MAX_DRIFT)
      const max = Math.min(99, core[key] + DNA_MAX_DRIFT)
      return [key, Math.min(max, Math.max(min, current[key]))]
    }),
  )
}

export function ensurePlayerDna(player) {
  if (!player) return null
  const generated = generatePlayerDna(player)
  const hasDna = player?.dna && typeof player.dna === 'object'
  const hasAnchor = player?.dnaAnchor && typeof player.dnaAnchor === 'object'

  const dnaAnchor = hasAnchor ? clampDna(player.dnaAnchor) : generated
  const dna = hasDna
    ? clampDnaToAnchor(player.dna, dnaAnchor)
    : { ...dnaAnchor }

  return {
    ...player,
    dna,
    dnaAnchor,
  }
}

export function withDna(players = []) {
  return (Array.isArray(players) ? players : []).map((player) =>
    ensurePlayerDna(player),
  )
}
