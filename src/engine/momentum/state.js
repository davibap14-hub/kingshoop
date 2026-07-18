import {
  MOMENTUM_MAX,
  MOMENTUM_MIN,
  MOMENTUM_NEUTRAL,
} from '../../data/momentum/constants.js'
import { clamp } from '../utils/math'
import { calcRivalryScore } from './rivalry.js'

export function clampMomentum(value) {
  return clamp(Number(value) || MOMENTUM_NEUTRAL, MOMENTUM_MIN, MOMENTUM_MAX)
}

function createSideMomentum(teamId, isHome) {
  return {
    teamId,
    isHome,
    value: MOMENTUM_NEUTRAL,
    makeStreak: 0,
    missStreak: 0,
    threeStreak: 0,
    runPoints: 0,
  }
}

/**
 * Estado de momentum para uma partida.
 */
export function createGameMomentum({
  homeTeamId = 'home',
  awayTeamId = 'away',
  rivalry = null,
  isPlayoff = false,
} = {}) {
  const rivalryScore =
    rivalry != null
      ? Number(rivalry)
      : calcRivalryScore(homeTeamId, awayTeamId)

  return {
    home: createSideMomentum(homeTeamId, true),
    away: createSideMomentum(awayTeamId, false),
    rivalry: clamp(rivalryScore, 0, 100),
    isPlayoff: Boolean(isPlayoff),
    possessionIndex: 0,
    lastTimeoutPossession: -999,
    lastTimeoutTeamId: null,
    lastEvents: [],
    timeoutCount: { home: 0, away: 0 },
  }
}

export function getSideMomentum(state, isHome) {
  return isHome ? state.home : state.away
}

export function getOpponentMomentum(state, isHome) {
  return isHome ? state.away : state.home
}
