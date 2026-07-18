import {
  GAME_FATIGUE_CLOCK,
  GAME_FATIGUE_PER_QUARTER,
} from '../../data/fatigue/constants.js'
import { applyFatigueToPlayer, buildFatigueEffects } from './effects.js'
import { teamScheduleFatigue } from './schedule.js'
import { clampFatigueValue } from './state.js'

/**
 * Fadiga de lado para a partida (liga + carreira).
 */
export function resolveSideGameFatigue({
  season = null,
  teamId = null,
  week = 1,
  injuryFatigue = 0,
  careerFatigue = null,
  isCareerTeam = false,
} = {}) {
  const scheduleLoad = teamScheduleFatigue(season, teamId, week)
  let base = injuryFatigue + scheduleLoad

  if (isCareerTeam && careerFatigue) {
    const built = buildFatigueEffects(careerFatigue)
    base = Math.max(base, built.effects.simFatigue)
  }

  return clampFatigueValue(base)
}

/**
 * Fadiga viva durante a partida (quarto + relógio).
 */
export function calcInGameFatigue(sideFatigue, quarter, timeRemaining = 0.5) {
  const q = typeof quarter === 'number' ? quarter : 4
  return clampFatigueValue(
    Number(sideFatigue ?? 0) +
      Math.max(0, q - 1) * GAME_FATIGUE_PER_QUARTER +
      (1 - (timeRemaining ?? 0.5)) * GAME_FATIGUE_CLOCK,
  )
}

/**
 * Perfil de efeitos in-game a partir da fadiga do lado.
 */
export function buildInGameFatigueEffects(sideFatigue, quarter, timeRemaining) {
  const game = calcInGameFatigue(sideFatigue, quarter, timeRemaining)
  return buildFatigueEffects({
    game,
    weekly: Math.min(70, game * 0.8),
    season: Math.min(50, game * 0.4),
    travel: 0,
    backToBack: 0,
    consecutiveMinutes: Math.min(40, game * 0.3),
    overload: game >= 75 ? 40 : 0,
  }).effects
}

/**
 * Aplica fadiga ao quinteto ofensivo/defensivo da posse.
 */
export function withFatigueLineup(players, effects) {
  if (!effects) return players
  return (players ?? []).map((p) => applyFatigueToPlayer(p, effects))
}
