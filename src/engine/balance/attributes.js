import {
  ATTR_HARD_MAX,
  ATTR_HARD_MIN,
  EVOLUTION_POTENTIAL_SLACK,
  OVERALL_HARD_CAP,
  OVERALL_SOFT_CAP,
  POTENTIAL_OVERALL_SLACK,
  ROOKIE_MAX_AGE,
  ROOKIE_TRAINING_MULT,
  TRAINING_DIMINISH_FLOOR,
  TRAINING_DIMINISH_START,
  TRAINING_GAIN_MAX,
  TRAINING_GAIN_MIN,
  TRAINING_RESPECT_ARCHETYPE_CAP,
  VETERAN_DECLINE_START_AGE,
  VETERAN_TRAINING_MULT,
} from '../../data/balance'
import { getArchetypeCaps } from '../../data/constants/archetypes'
import { calcOverall } from '../../data/players/utils'
import { clamp } from '../utils/math'

export function clampAttribute(value) {
  return clamp(Math.round(value), ATTR_HARD_MIN, ATTR_HARD_MAX)
}

/**
 * Teto efetivo de um atributo/grupo (arquétipo ∩ potencial ∩ hard).
 */
export function getEffectiveAttrCap(player, archetypeId, groupKey) {
  const archCap = getArchetypeCaps(archetypeId)?.[groupKey] ?? 90
  const potential = player?.potencial ?? OVERALL_SOFT_CAP
  const potCap = Math.min(
    ATTR_HARD_MAX,
    potential + EVOLUTION_POTENTIAL_SLACK,
  )
  const soft = TRAINING_RESPECT_ARCHETYPE_CAP
    ? Math.min(ATTR_HARD_MAX, archCap, potCap)
    : Math.min(ATTR_HARD_MAX, potCap)
  return soft
}

/**
 * Freio de overall: quanto mais perto do soft cap / potencial, menor o ganho.
 */
export function calcOverallGrowthMultiplier(player) {
  const overall = player?.overall ?? calcOverall(player) ?? 70
  const potential = player?.potencial ?? OVERALL_SOFT_CAP
  const soft = Math.min(
    OVERALL_SOFT_CAP,
    potential + POTENTIAL_OVERALL_SLACK,
    OVERALL_HARD_CAP,
  )

  if (overall >= OVERALL_HARD_CAP) return 0
  if (overall >= soft) {
    const over = overall - soft
    return Math.max(0.05, 0.35 - over * 0.1)
  }

  const start = soft - 8
  if (overall < start) return 1
  const t = (overall - start) / 8
  return clamp(1 - t * 0.55, 0.2, 1)
}

/**
 * Multiplicador por valor atual do atributo (anti-inflação).
 */
export function calcAttrDiminishMultiplier(currentValue) {
  if (currentValue < TRAINING_DIMINISH_START) return 1
  const span = ATTR_HARD_MAX - TRAINING_DIMINISH_START
  const t = span <= 0 ? 1 : (currentValue - TRAINING_DIMINISH_START) / span
  return clamp(1 - t * (1 - TRAINING_DIMINISH_FLOOR), TRAINING_DIMINISH_FLOOR, 1)
}

/**
 * Multiplicador por idade (rookies sobem mais; veteranos menos).
 */
export function calcAgeGrowthMultiplier(age) {
  if (age == null) return 1
  if (age <= ROOKIE_MAX_AGE) return ROOKIE_TRAINING_MULT
  if (age >= VETERAN_DECLINE_START_AGE) return VETERAN_TRAINING_MULT
  return 1
}

/**
 * Aplica ganho de treino equilibrado.
 * @returns {{ next: number, gain: number, blocked: boolean }}
 */
export function applyBalancedTrainingGain(
  previous,
  rawGain,
  { player, archetypeId, groupKey } = {},
) {
  const cap = getEffectiveAttrCap(player, archetypeId, groupKey)
  if (previous >= cap) {
    return { next: previous, gain: 0, blocked: true }
  }

  let mult = calcAttrDiminishMultiplier(previous)
  mult *= calcOverallGrowthMultiplier(player)
  mult *= calcAgeGrowthMultiplier(player?.idade)

  let gain = Math.round(rawGain * mult)
  gain = clamp(gain, TRAINING_GAIN_MIN, TRAINING_GAIN_MAX)

  // Perto do teto: no máximo +1
  if (previous >= cap - 2) gain = Math.min(gain, 1)

  const next = clampAttribute(Math.min(cap, previous + gain))
  return { next, gain: next - previous, blocked: next <= previous }
}
