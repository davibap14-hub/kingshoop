import {
  FRANCHISE_REPUTATION_BASE,
  FRANCHISE_REPUTATION_MAX,
  FRANCHISE_REPUTATION_MIN,
} from '../../data/dynasty/constants.js'
import { clamp } from '../utils/math'
import { getActiveDynasty, getFranchiseReputation } from './state.js'

/**
 * Aplica boost de reputação da dinastia na franquia.
 */
export function applyDynastyReputation(dynastyState, record) {
  const next = {
    ...dynastyState,
    franchiseReputation: { ...(dynastyState.franchiseReputation ?? {}) },
  }
  const prev =
    next.franchiseReputation[record.teamId] ?? FRANCHISE_REPUTATION_BASE
  next.franchiseReputation[record.teamId] = clamp(
    prev + (record.reputationBoost ?? 0),
    FRANCHISE_REPUTATION_MIN,
    FRANCHISE_REPUTATION_MAX,
  )
  return next
}

/**
 * Multiplicadores de peso da Franchise AI para dinastia ativa.
 */
export function getDynastySigningBias(dynastyState, teamId) {
  const active = getActiveDynasty(dynastyState, teamId)
  if (!active) {
    return {
      active: false,
      signingBias: 1,
      reputation: getFranchiseReputation(dynastyState, teamId),
      weightMult: null,
    }
  }
  return {
    active: true,
    tier: active.tier,
    signingBias: active.signingBias ?? 1,
    reputation: getFranchiseReputation(dynastyState, teamId),
    weightMult: {
      winNow: 1.15 * (active.signingBias ?? 1),
      starHunting: 1.25 * (active.signingBias ?? 1),
      renewStars: 1.2,
      tradeAggression: 1.1,
      youth: 0.9,
      potential: 0.95,
      capSpace: 0.92,
    },
  }
}

/**
 * Aplica bias de dinastia aos weights do objetivo da franquia.
 */
export function applyDynastyToWeights(weights, dynastyState, teamId) {
  const bias = getDynastySigningBias(dynastyState, teamId)
  if (!bias.active || !bias.weightMult) return weights ?? {}
  const next = { ...(weights ?? {}) }
  for (const [key, mult] of Object.entries(bias.weightMult)) {
    if (next[key] != null) next[key] = next[key] * mult
  }
  return next
}

/**
 * Bonus no scoreFa para times em dinastia (atrai estrelas).
 */
export function dynastyFaScoreBonus(dynastyState, teamId, playerOverall = 70) {
  const bias = getDynastySigningBias(dynastyState, teamId)
  if (!bias.active) return 0
  const star = Math.max(0, playerOverall - 78)
  return (bias.signingBias - 1) * 40 + star * 0.8 + (bias.reputation - 50) * 0.15
}
