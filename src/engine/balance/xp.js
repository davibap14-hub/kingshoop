import {
  ROOKIE_MAX_AGE,
  ROOKIE_XP_MULT,
  XP_LEVEL_DIMINISH_FLOOR,
  XP_LEVEL_DIMINISH_START,
  XP_MAX_GAIN,
  XP_MIN_GAIN,
  XP_OVERALL_DIMINISH_FLOOR,
  XP_OVERALL_DIMINISH_START,
  VETERAN_DECLINE_START_AGE,
  VETERAN_XP_MULT,
} from '../../data/balance'
import { calcOverall } from '../../data/players/utils'
import { clamp } from '../utils/math'

/**
 * Amortece XP semanal para evitar explosão de níveis/atributos.
 */
export function balanceXpGain(xpGain, { player, progression } = {}) {
  if (!xpGain || xpGain <= 0) return 0

  let xp = xpGain
  const overall = player?.overall ?? calcOverall(player) ?? 70
  const level = progression?.level ?? 1
  const age = player?.idade

  if (overall >= XP_OVERALL_DIMINISH_START) {
    const span = 99 - XP_OVERALL_DIMINISH_START
    const t = span <= 0 ? 1 : (overall - XP_OVERALL_DIMINISH_START) / span
    const mult = clamp(
      1 - t * (1 - XP_OVERALL_DIMINISH_FLOOR),
      XP_OVERALL_DIMINISH_FLOOR,
      1,
    )
    xp *= mult
  }

  if (level >= XP_LEVEL_DIMINISH_START) {
    const span = 50 - XP_LEVEL_DIMINISH_START
    const t = span <= 0 ? 1 : (level - XP_LEVEL_DIMINISH_START) / span
    const mult = clamp(
      1 - t * (1 - XP_LEVEL_DIMINISH_FLOOR),
      XP_LEVEL_DIMINISH_FLOOR,
      1,
    )
    xp *= mult
  }

  if (age != null) {
    if (age <= ROOKIE_MAX_AGE) xp *= ROOKIE_XP_MULT
    else if (age >= VETERAN_DECLINE_START_AGE) xp *= VETERAN_XP_MULT
  }

  return clamp(Math.round(xp), XP_MIN_GAIN, XP_MAX_GAIN)
}
