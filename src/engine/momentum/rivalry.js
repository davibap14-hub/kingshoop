import {
  RIVALRY_DEFAULT,
  RIVALRY_PAIR_SCORE,
  RIVALRY_PAIRS,
  RIVALRY_SAME_CONFERENCE,
} from '../../data/momentum/constants.js'
import { getTeamById } from '../../data/teams'

/**
 * Intensidade de rivalidade 0–100 entre dois times.
 */
export function calcRivalryScore(homeTeamId, awayTeamId, opts = {}) {
  if (opts.rivalry != null) return Number(opts.rivalry)

  const a = String(homeTeamId ?? '')
  const b = String(awayTeamId ?? '')
  const pair = RIVALRY_PAIRS.some(
    ([x, y]) => (x === a && y === b) || (x === b && y === a),
  )
  if (pair) return RIVALRY_PAIR_SCORE

  const home = getTeamById(homeTeamId)
  const away = getTeamById(awayTeamId)
  if (home?.conference && home.conference === away?.conference) {
    return RIVALRY_SAME_CONFERENCE
  }
  return RIVALRY_DEFAULT
}
