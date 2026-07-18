import { ATTRIBUTE_KEYS } from '../../data/constants/attributes'
import { clamp, roundStat } from '../utils/math'

/**
 * Overall simples: média aritmética dos atributos.
 */
export function calcOverall(playerStats) {
  if (!playerStats) return 0
  const sum = ATTRIBUTE_KEYS.reduce(
    (acc, key) => acc + (playerStats[key] ?? 0),
    0,
  )
  return roundStat(sum / ATTRIBUTE_KEYS.length)
}

/**
 * Aplica delta a um atributo, retornando novo mapa de stats (imutável).
 */
export function applyStatDelta(playerStats, statKey, delta) {
  if (!ATTRIBUTE_KEYS.includes(statKey)) {
    return { playerStats, changed: false, previous: null, next: null }
  }

  const previous = playerStats[statKey] ?? 0
  const next = clamp(roundStat(previous + delta), 0, 99)

  return {
    playerStats: {
      ...playerStats,
      [statKey]: next,
    },
    changed: next !== previous,
    previous,
    next,
  }
}

/**
 * Ganho de treino (placeholder de progressão semanal).
 */
export function calcTrainingGain(energy, bias = 1, rng = Math.random) {
  if (energy < 15) return 0
  const base = 0.6 + rng() * 1.4
  return Math.round(base * bias * 10) / 10
}
