import {
  HOF_SCORE_WEIGHTS,
  HOF_STAT_SCALES,
} from '../../data/hallOfFame'
import { clamp } from '../utils/math'

/**
 * Normaliza um valor bruto para 0–100 contra uma escala de referência.
 */
export function normalizeStat(value, scale) {
  if (!scale || scale <= 0) return 0
  return clamp(Math.round(((Number(value) || 0) / scale) * 100), 0, 100)
}

/**
 * Calcula pontuação HOF (0–100) e breakdown por categoria.
 *
 * Fatores: Títulos · MVPs · All-Star · All-NBA · DPOY ·
 * Pontos · Assistências · Rebotes · Longevidade · Popularidade
 */
export function calculateHofScore(credentials = {}) {
  const c = credentials
  const scales = HOF_STAT_SCALES
  const w = HOF_SCORE_WEIGHTS

  // MVPs de temporada + Finals MVP pesam no bucket "mvps"
  const mvpUnits = (c.mvps ?? 0) + (c.finalsMvps ?? 0) * 1.25

  const factors = {
    titles: normalizeStat(c.titles, scales.titles),
    mvps: normalizeStat(mvpUnits, scales.mvps),
    allStar: normalizeStat(c.allStar, scales.allStar),
    allNba: normalizeStat(c.allNba, scales.allNba),
    dpoy: normalizeStat(c.dpoy, scales.dpoy),
    points: normalizeStat(c.points, scales.points),
    assists: normalizeStat(c.assists, scales.assists),
    rebounds: normalizeStat(c.rebounds, scales.rebounds),
    longevity: clamp(
      Math.round(
        normalizeStat(c.longevity ?? c.seasons, scales.longevitySeasons) * 0.65 +
          normalizeStat(c.age ?? 30, scales.longevityAge) * 0.35,
      ),
      0,
      100,
    ),
    popularity: normalizeStat(c.popularity, scales.popularity),
  }

  let weighted = 0
  let weightSum = 0
  const breakdown = {}

  for (const [key, weight] of Object.entries(w)) {
    const factor = factors[key] ?? 0
    weighted += factor * weight
    weightSum += weight
    breakdown[key] = {
      raw: pickRaw(c, key),
      normalized: factor,
      weight,
      contribution: Math.round(factor * weight * 10) / 10,
    }
  }

  const score =
    weightSum > 0
      ? Math.round((weighted / weightSum) * 10) / 10
      : 0

  return {
    score: clamp(score, 0, 100),
    factors,
    breakdown,
  }
}

function pickRaw(c, key) {
  switch (key) {
    case 'titles':
      return c.titles ?? 0
    case 'mvps':
      return (c.mvps ?? 0) + (c.finalsMvps ?? 0)
    case 'allStar':
      return c.allStar ?? 0
    case 'allNba':
      return c.allNba ?? 0
    case 'dpoy':
      return c.dpoy ?? 0
    case 'points':
      return c.points ?? 0
    case 'assists':
      return c.assists ?? 0
    case 'rebounds':
      return c.rebounds ?? 0
    case 'longevity':
      return c.longevity ?? c.seasons ?? 0
    case 'popularity':
      return c.popularity ?? 0
    default:
      return 0
  }
}
