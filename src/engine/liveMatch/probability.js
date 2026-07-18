/**
 * Probabilidade ao vivo — só a partir do placar/quarto já gravados no PBP.
 * Não reexecuta a Simulation Engine.
 */

import { clamp } from '../utils/math'

export function liveWinProbability(homeScore, awayScore, quarter) {
  const q =
    typeof quarter === 'number'
      ? quarter
      : quarter === 'OT' || quarter === 'ot'
        ? 5
        : 4
  const remainingFactor = Math.max(0.2, (5 - Math.min(q, 5)) / 4 + 0.25)
  const diff = (homeScore ?? 0) - (awayScore ?? 0)
  const raw = 1 / (1 + Math.exp(-diff / (7 * remainingFactor + 1.5)))
  const homeWinPct = clamp(Math.round(raw * 100), 8, 92)
  return {
    homeWinPct,
    awayWinPct: 100 - homeWinPct,
  }
}
