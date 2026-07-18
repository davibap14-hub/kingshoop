import { clamp } from '../utils/math'
import { trait } from './traits'

/**
 * Química de elenco influenciada por personalidade.
 * Liderança e lealdade elevam; ego e temperamento altos tensionam o vestiário.
 */
export function calcRosterChemistry(players = []) {
  if (!players.length) return 55

  const n = players.length
  let sumLeadership = 0
  let sumLoyalty = 0
  let sumEgo = 0
  let sumTemper = 0
  let sumOverall = 0

  for (const p of players) {
    sumLeadership += trait(p, 'lideranca')
    sumLoyalty += trait(p, 'lealdade')
    sumEgo += trait(p, 'ego')
    sumTemper += trait(p, 'temperamento')
    sumOverall += (p.overall ?? 70) - 70
  }

  const avgL = sumLeadership / n
  const avgLoyal = sumLoyalty / n
  const avgEgo = sumEgo / n
  const avgTemper = sumTemper / n
  const skillChem = sumOverall / n

  // Variância de ego: estrelas egoístas no mesmo elenco reduzem química
  const egos = players.map((p) => trait(p, 'ego'))
  const egoMean = egos.reduce((s, v) => s + v, 0) / n
  const egoVar =
    egos.reduce((s, v) => s + (v - egoMean) ** 2, 0) / Math.max(1, n)

  const chem =
    52 +
    skillChem * 0.55 +
    (avgL - 50) * 0.22 +
    (avgLoyal - 50) * 0.18 -
    (avgEgo - 55) * 0.16 -
    (avgTemper - 50) * 0.14 -
    Math.sqrt(egoVar) * 0.12

  return clamp(Math.round(chem), 30, 95)
}

/**
 * Delta semanal de relação com companheiros (química de carreira).
 */
export function calcTeammateChemistryDelta(player, activityType) {
  const leadership = trait(player, 'lideranca')
  const loyalty = trait(player, 'lealdade')
  const ego = trait(player, 'ego')
  const temper = trait(player, 'temperamento')

  let delta = 0
  delta += (leadership - 50) * 0.04
  delta += (loyalty - 50) * 0.03
  delta -= (ego - 55) * 0.035
  delta -= (temper - 50) * 0.03

  if (activityType === 'bonding') {
    delta += (loyalty - 40) * 0.05 + (leadership - 45) * 0.04
  }
  if (activityType === 'media' && ego >= 70) {
    delta -= 1.5
  }
  if (activityType === 'train' && temper >= 75) {
    delta -= 0.8
  }

  return Math.round(delta)
}
