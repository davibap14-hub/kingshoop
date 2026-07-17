import { WEIGHT_POWER } from '../../data/simulation/constants'
import { clamp } from '../utils/math'

/**
 * Combina múltiplos fatores em um score 0–1.
 * NÃO é rolagem simples — cada atributo entra com peso relativo.
 *
 * @param {{ value: number, weight?: number, invert?: boolean, scale?: number }[]} factors
 */
export function combineScore(factors = []) {
  let num = 0
  let den = 0

  for (const f of factors) {
    const w = f.weight ?? 1
    if (w <= 0) continue
    const scale = f.scale ?? 100
    let v = (Number(f.value) || 0) / scale
    if (f.invert) v = 1 - v
    v = clamp(v, 0, 1.4)
    num += v * w
    den += w
  }

  return den > 0 ? num / den : 0.5
}

/**
 * Converte scores em pesos e seleciona uma opção.
 * Usa potência sobre o score (softmax-like discreto) — evita 50/50 cego.
 *
 * @param {{ id: string, score: number, mult?: number, meta?: object }[]} entries
 */
export function weightedSelect(entries, rng = Math.random, power = WEIGHT_POWER) {
  if (!entries?.length) return null

  const prepared = entries.map((e) => {
    const raw = Math.max(0.001, Number(e.score) || 0)
    const weight = raw ** power * (e.mult ?? 1)
    return { ...e, weight: Math.max(0.0001, weight) }
  })

  const total = prepared.reduce((s, e) => s + e.weight, 0)
  let roll = rng() * total
  for (const entry of prepared) {
    roll -= entry.weight
    if (roll <= 0) return entry
  }
  return prepared[prepared.length - 1]
}

/**
 * Duelo entre dois scores combinados → probabilidade do lado A.
 * Retorna escolha via weightedSelect entre A e B.
 */
export function contestedSelect(sideA, sideB, rng = Math.random) {
  const pick = weightedSelect(
    [
      { id: 'a', score: Math.max(0.05, sideA), meta: { winner: 'a' } },
      { id: 'b', score: Math.max(0.05, sideB), meta: { winner: 'b' } },
    ],
    rng,
  )
  return {
    winner: pick?.id === 'a' ? 'a' : 'b',
    scoreA: sideA,
    scoreB: sideB,
    margin: sideA - sideB,
  }
}

export function attr(player, path, fallback = 60) {
  if (!player) return fallback
  const [group, key] = path.split('.')
  if (!key) return player[group] ?? fallback
  return player[group]?.[key] ?? player[group] ?? fallback
}
