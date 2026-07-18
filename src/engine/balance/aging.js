import {
  ATTR_HARD_MAX,
  ATTR_HARD_MIN,
  DRAFT_POTENTIAL_MAX,
  OVERALL_HARD_CAP,
  OVERALL_SOFT_CAP,
  ROOKIE_MAX_AGE,
  ROOKIE_SEASON_ATTR_GAIN_MAX,
  ROOKIE_SEASON_GROWTH_RATE,
  VETERAN_DECLINE_ACCEL_AGE,
  VETERAN_DECLINE_ACCEL_EXTRA,
  VETERAN_DECLINE_ATTR_MAX,
  VETERAN_DECLINE_BASE,
  VETERAN_DECLINE_GROUP_WEIGHTS,
  VETERAN_DECLINE_START_AGE,
} from '../../data/balance'
import { ATTRIBUTE_GROUPS } from '../../data/players/schema'
import { calcOverall } from '../../data/players/utils'
import { clamp } from '../utils/math'
import { clampAttribute } from './attributes.js'

/**
 * Envelhece +1 ano e aplica crescimento de rookie ou decadência de veterano.
 */
export function applySeasonalAging(player, rng = Math.random) {
  if (!player) {
    return { player, changed: false, messages: [], deltas: {} }
  }

  const age = (player.idade ?? 19) + 1
  let next = { ...player, idade: age }
  const deltas = {}
  const messages = []

  if (age <= ROOKIE_MAX_AGE) {
    const grown = growRookieTowardPotential(next, rng)
    next = grown.player
    Object.assign(deltas, grown.deltas)
    if (grown.messages.length) messages.push(...grown.messages)
  } else if (age >= VETERAN_DECLINE_START_AGE) {
    const declined = applyVeteranDecline(next, rng)
    next = declined.player
    Object.assign(deltas, declined.deltas)
    if (declined.messages.length) messages.push(...declined.messages)
  }

  const overall = Math.min(
    OVERALL_HARD_CAP,
    Math.min(OVERALL_SOFT_CAP + 2, calcOverall(next)),
  )
  next = { ...next, overall }

  const changed =
    age !== player.idade || Object.keys(deltas).length > 0

  return { player: next, changed, messages, deltas, age }
}

function growRookieTowardPotential(player, rng) {
  const potential = Math.min(
    DRAFT_POTENTIAL_MAX,
    player.potencial ?? OVERALL_SOFT_CAP,
  )
  const overall = player.overall ?? calcOverall(player)
  const gap = Math.max(0, potential - overall)
  if (gap <= 0) {
    return { player, deltas: {}, messages: [] }
  }

  const budget = Math.min(
    ROOKIE_SEASON_ATTR_GAIN_MAX,
    Math.max(1, Math.round(gap * ROOKIE_SEASON_GROWTH_RATE + rng() * 0.8)),
  )

  let next = { ...player }
  const deltas = {}
  let spent = 0
  const groups = ['fisico', 'arremesso', 'defesa', 'qi']

  while (spent < budget) {
    const groupKey = groups[Math.floor(rng() * groups.length)]
    const keys = ATTRIBUTE_GROUPS[groupKey]?.keys ?? []
    if (!keys.length) break
    const attr = keys[Math.floor(rng() * keys.length)]
    const group = { ...(next[groupKey] ?? {}) }
    const prev = group[attr] ?? 50
    const room = Math.min(ATTR_HARD_MAX, potential + 1) - prev
    if (room <= 0) {
      // evita loop infinito se tudo estiver alto
      spent += 1
      continue
    }
    const gain = Math.min(1, room)
    group[attr] = clampAttribute(prev + gain)
    next = { ...next, [groupKey]: group }
    const path = `${groupKey}.${attr}`
    deltas[path] = (deltas[path] ?? 0) + gain
    spent += 1
  }

  const messages =
    Object.keys(deltas).length > 0
      ? [`Crescimento de rookie (+${Object.values(deltas).reduce((a, b) => a + b, 0)} attr).`]
      : []

  return { player: next, deltas, messages }
}

function applyVeteranDecline(player, rng) {
  const age = player.idade ?? VETERAN_DECLINE_START_AGE
  const base =
    VETERAN_DECLINE_BASE +
    (age >= VETERAN_DECLINE_ACCEL_AGE ? VETERAN_DECLINE_ACCEL_EXTRA : 0)

  let next = { ...player }
  const deltas = {}

  for (const [groupKey, weight] of Object.entries(VETERAN_DECLINE_GROUP_WEIGHTS)) {
    const keys = ATTRIBUTE_GROUPS[groupKey]?.keys ?? []
    if (!keys.length) continue
    const lossTarget = Math.min(
      VETERAN_DECLINE_ATTR_MAX,
      Math.max(0, Math.round(base * weight + (rng() < 0.35 ? 1 : 0))),
    )
    if (lossTarget <= 0) continue

    const group = { ...(next[groupKey] ?? {}) }
    // prioriza atributos mais altos do grupo
    const ordered = [...keys].sort((a, b) => (group[b] ?? 0) - (group[a] ?? 0))
    let left = lossTarget
    for (const attr of ordered) {
      if (left <= 0) break
      const prev = group[attr] ?? 50
      const drop = Math.min(left, 1 + (prev > 80 && rng() < 0.4 ? 1 : 0))
      const after = clamp(prev - drop, ATTR_HARD_MIN, 99)
      const actual = prev - after
      if (actual <= 0) continue
      group[attr] = after
      deltas[`${groupKey}.${attr}`] = -actual
      left -= actual
    }
    next = { ...next, [groupKey]: group }
  }

  const totalDrop = Object.values(deltas).reduce((a, b) => a + Math.abs(b), 0)
  const messages =
    totalDrop > 0
      ? [`Decadência de veterano (−${totalDrop} attr, ${age} anos).`]
      : []

  return { player: next, deltas, messages }
}
