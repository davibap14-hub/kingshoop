/**
 * Probabilidade de vitória — heurística de pré-jogo (não altera a simulação).
 */

import { MATCH_CENTER_HOME_COURT_BONUS } from '../../data/matchCenter'
import { clamp } from '../utils/math'

function teamStrength({
  avgOverall,
  winPct,
  injuryDrag,
  fatigueDrag,
  home = false,
}) {
  return (
    (avgOverall ?? 70) +
    (winPct ?? 0.5) * 12 +
    (home ? MATCH_CENTER_HOME_COURT_BONUS : 0) -
    (injuryDrag ?? 0) -
    (fatigueDrag ?? 0)
  )
}

/**
 * @returns {{ homeWinPct, awayWinPct, homeStrength, awayStrength, factors }}
 */
export function estimateWinProbability({
  homeAvgOverall,
  awayAvgOverall,
  homeWinPct: homeRecordPct,
  awayWinPct: awayRecordPct,
  homeInjuryDrag = 0,
  awayInjuryDrag = 0,
  homeFatigueDrag = 0,
  awayFatigueDrag = 0,
} = {}) {
  const homeStrength = teamStrength({
    avgOverall: homeAvgOverall,
    winPct: homeRecordPct,
    injuryDrag: homeInjuryDrag,
    fatigueDrag: homeFatigueDrag,
    home: true,
  })
  const awayStrength = teamStrength({
    avgOverall: awayAvgOverall,
    winPct: awayRecordPct,
    injuryDrag: awayInjuryDrag,
    fatigueDrag: awayFatigueDrag,
    home: false,
  })

  const diff = homeStrength - awayStrength
  // logística suave → 15%–85%
  const raw = 1 / (1 + Math.exp(-diff / 6))
  const homeWinPct = clamp(Math.round(raw * 100), 15, 85)
  const awayWinPct = 100 - homeWinPct

  return {
    homeWinPct,
    awayWinPct,
    homeStrength: Math.round(homeStrength * 10) / 10,
    awayStrength: Math.round(awayStrength * 10) / 10,
    factors: {
      homeCourt: MATCH_CENTER_HOME_COURT_BONUS,
      homeInjuryDrag,
      awayInjuryDrag,
      homeFatigueDrag,
      awayFatigueDrag,
    },
  }
}
