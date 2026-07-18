/** Utilitários puros da Engine — sem UI, sem store. */

export function clamp(value, min, max) {
  if (max == null) return Math.max(min, value)
  return Math.max(min, Math.min(max, value))
}

export function roundStat(value) {
  return Math.round(value)
}

/**
 * RNG injetável para testes determinísticos.
 * @returns {() => number} função 0..1
 */
export function createRng(seedFn = Math.random) {
  return typeof seedFn === 'function' ? seedFn : Math.random
}

export function pickWeighted(items, weightKey = 'weight', rng = Math.random) {
  const total = items.reduce((sum, item) => sum + (item[weightKey] ?? 1), 0)
  let roll = rng() * total
  for (const item of items) {
    roll -= item[weightKey] ?? 1
    if (roll <= 0) return item
  }
  return items[items.length - 1]
}
