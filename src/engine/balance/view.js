import {
  ATTR_HARD_MAX,
  CONTRACT_INFLATION_PER_SEASON,
  CONTRACT_MAX_SALARY,
  CONTRACT_MIN_SALARY,
  OVERALL_SOFT_CAP,
  ROOKIE_MAX_AGE,
  TRAINING_DIMINISH_START,
  TRAINING_GAIN_MAX,
  VETERAN_DECLINE_START_AGE,
  XP_MAX_GAIN,
  XP_OVERALL_DIMINISH_START,
} from '../../data/balance'
import { calcLeagueInflation } from './contracts.js'
import { getEffectiveAttrCap } from './attributes.js'

/**
 * Visão read-only das regras ativas de balance (para a Interface).
 */
export function getBalanceView(state = {}) {
  const player = state.player
  const seasonNumber = state.currentSeason ?? 1
  const archetypeId = state.archetypeId
  const overall = player?.overall ?? null

  const groupCaps = {}
  for (const group of ['fisico', 'arremesso', 'defesa', 'qi']) {
    groupCaps[group] = player
      ? getEffectiveAttrCap(player, archetypeId, group)
      : null
  }

  return {
    overall,
    overallSoftCap: OVERALL_SOFT_CAP,
    attrHardMax: ATTR_HARD_MAX,
    potential: player?.potencial ?? null,
    age: player?.idade ?? null,
    isRookie: player?.idade != null ? player.idade <= ROOKIE_MAX_AGE : null,
    isVeteran:
      player?.idade != null
        ? player.idade >= VETERAN_DECLINE_START_AGE
        : null,
    groupCaps,
    training: {
      diminishStart: TRAINING_DIMINISH_START,
      maxGain: TRAINING_GAIN_MAX,
    },
    xp: {
      diminishOverallStart: XP_OVERALL_DIMINISH_START,
      maxGain: XP_MAX_GAIN,
    },
    contracts: {
      min: CONTRACT_MIN_SALARY,
      max: CONTRACT_MAX_SALARY,
      inflationPerSeason: CONTRACT_INFLATION_PER_SEASON,
      leagueInflation: calcLeagueInflation(seasonNumber),
    },
    aging: {
      rookieMaxAge: ROOKIE_MAX_AGE,
      veteranStartAge: VETERAN_DECLINE_START_AGE,
    },
  }
}
