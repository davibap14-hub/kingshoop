import {
  LEGACY_SCORE_WEIGHTS,
  LEGACY_STAT_SCALES,
} from '../../data/legacy/constants.js'
import { clamp } from '../utils/math'
import { resolveLegacyTier } from './state.js'

function normalizeStat(value, scale) {
  if (!scale || scale <= 0) return 0
  return clamp(Math.round(((Number(value) || 0) / scale) * 100), 0, 100)
}

/**
 * Calcula Legacy Score 0–100 a partir dos insumos.
 */
export function calculateLegacyScore(inputs = {}) {
  const s = LEGACY_STAT_SCALES
  const w = LEGACY_SCORE_WEIGHTS

  const factors = {
    titles: normalizeStat(inputs.titles, s.titles),
    mvp: normalizeStat(inputs.mvp, s.mvp),
    finalsMvp: normalizeStat(inputs.finalsMvp, s.finalsMvp),
    allStar: normalizeStat(inputs.allStar, s.allStar),
    allNba: normalizeStat(inputs.allNba, s.allNba),
    defense: normalizeStat(inputs.defense, s.defense),
    records: normalizeStat(inputs.records, s.records),
    longevity: clamp(
      Math.round(
        normalizeStat(inputs.longevitySeasons, s.longevitySeasons) * 0.55 +
          normalizeStat(inputs.longevityGames, s.longevityGames) * 0.45,
      ),
      0,
      100,
    ),
    popularity: normalizeStat(inputs.popularity, s.popularity),
    personality: normalizeStat(inputs.personality, s.personality),
    historicalMoments: normalizeStat(
      inputs.historicalMoments,
      s.historicalMoments,
    ),
    rivalries: normalizeStat(inputs.rivalries, s.rivalries),
  }

  let weighted = 0
  let weightSum = 0
  const breakdown = {}

  for (const [key, weight] of Object.entries(w)) {
    const factor = factors[key] ?? 0
    weighted += factor * weight
    weightSum += weight
    breakdown[key] = {
      raw: pickRaw(inputs, key),
      normalized: factor,
      weight,
      contribution: Math.round(factor * weight * 10) / 10,
    }
  }

  const score =
    weightSum > 0
      ? Math.round((weighted / weightSum) * 10) / 10
      : 0

  const clamped = clamp(score, 0, 100)
  const tier = resolveLegacyTier(clamped)

  return {
    score: clamped,
    tier: tier.id,
    tierLabel: tier.label,
    factors,
    breakdown,
    historicalValue: Math.round(clamped * 1.15 + (inputs.titles ?? 0) * 4),
  }
}

function pickRaw(inputs, key) {
  switch (key) {
    case 'titles':
      return inputs.titles ?? 0
    case 'mvp':
      return inputs.mvp ?? 0
    case 'finalsMvp':
      return inputs.finalsMvp ?? 0
    case 'allStar':
      return inputs.allStar ?? 0
    case 'allNba':
      return inputs.allNba ?? 0
    case 'defense':
      return inputs.defense ?? 0
    case 'records':
      return inputs.records ?? 0
    case 'longevity':
      return inputs.longevitySeasons ?? 0
    case 'popularity':
      return inputs.popularity ?? 0
    case 'personality':
      return inputs.personality ?? 0
    case 'historicalMoments':
      return inputs.historicalMoments ?? 0
    case 'rivalries':
      return inputs.rivalries ?? 0
    default:
      return 0
  }
}

/**
 * Blend Legacy → Hall da Fama.
 */
export function blendLegacyIntoHofScore(hofScore, legacyScore, blend = 0.22) {
  const h = Number(hofScore) || 0
  const l = Number(legacyScore) || 0
  return clamp(Math.round((h * (1 - blend) + l * blend) * 10) / 10, 0, 100)
}
