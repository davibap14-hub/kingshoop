import {
  CHEMISTRY_EFFECT_CLAMP,
  CHEMISTRY_NEUTRAL,
  CHEMISTRY_SIM_WEIGHTS,
} from '../../data/chemistry'
import { clamp } from '../utils/math'
import {
  chemistryToScore,
  createChemistryState,
  getPairChemistry,
} from './state.js'
import { ensureRosterPairs } from './personality.js'

/**
 * Agrega química de um quinteto para uso na Simulation Engine.
 * Tudo derivado de pesos — sem RNG.
 */
export function buildLineupChemistryEffects(
  chemistryState,
  players = [],
  relationshipBonus = 0,
) {
  const ids = players.map((p) => p.id).filter(Boolean)
  let state = ensureRosterPairs(
    createChemistryState(chemistryState ?? {}),
    players,
  )

  const pairValues = []
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      pairValues.push(getPairChemistry(state, ids[i], ids[j], CHEMISTRY_NEUTRAL))
    }
  }

  const avgPair =
    pairValues.length > 0
      ? pairValues.reduce((s, v) => s + v, 0) / pairValues.length
      : CHEMISTRY_NEUTRAL

  const avgScore = chemistryToScore(avgPair)
  const bonus = clamp(Number(relationshipBonus) || 0, -12, 14)
  const teamChemistry = clamp(Math.round(avgScore + bonus), 0, 100)

  // Boosts −CHEMISTRY_EFFECT_CLAMP…+CLAMP a partir da média de pares
  const signed = clamp(
    avgPair / (100 / CHEMISTRY_EFFECT_CLAMP),
    -CHEMISTRY_EFFECT_CLAMP,
    CHEMISTRY_EFFECT_CLAMP,
  )

  const pairScores = {}
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const a = ids[i]
      const b = ids[j]
      const key = a < b ? `${a}|${b}` : `${b}|${a}`
      pairScores[key] = chemistryToScore(
        getPairChemistry(state, a, b, CHEMISTRY_NEUTRAL),
      )
    }
  }

  return {
    state,
    teamChemistry,
    avgPair: Math.round(avgPair),
    passBoost: signed,
    movementBoost: signed * 0.9,
    defenseBoost: signed * 0.85,
    offenseEfficiency: signed * 1.05,
    aiPassBias: signed * 0.8,
    aiCutBias: signed * 0.7,
    weights: CHEMISTRY_SIM_WEIGHTS,
    pairScores,
    /** Lookup 0–100 entre dois jogadores do elenco */
    pairScoreBetween(idA, idB) {
      if (!idA || !idB || idA === idB) return 50
      const key = idA < idB ? `${idA}|${idB}` : `${idB}|${idA}`
      return pairScores[key] ?? 50
    },
  }
}

/**
 * Fator 0–100 para combineScore a partir de boost assinado.
 */
export function boostToScoreFactor(boost) {
  return clamp(50 + (Number(boost) || 0) * 2.2, 5, 95)
}
