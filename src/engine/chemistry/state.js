import {
  CHEMISTRY_MAX,
  CHEMISTRY_MIN,
  CHEMISTRY_NEUTRAL,
} from '../../data/chemistry'
import { clamp } from '../utils/math'

/**
 * Chave canônica de um par (ordem estável, sem direção).
 */
export function pairKey(idA, idB) {
  if (idA == null || idB == null || idA === idB) return null
  return idA < idB ? `${idA}|${idB}` : `${idB}|${idA}`
}

export function clampChemistry(value) {
  return clamp(
    Math.round(Number(value) || 0),
    CHEMISTRY_MIN,
    CHEMISTRY_MAX,
  )
}

/**
 * Estado da Chemistry Engine — matriz de pares.
 * pairs: { "idA|idB": number (−100…+100) }
 * weeksTogether: { "idA|idB": number }
 */
export function createChemistryState(overrides = {}) {
  return {
    pairs: { ...(overrides.pairs ?? {}) },
    weeksTogether: { ...(overrides.weeksTogether ?? {}) },
    lastUpdate: overrides.lastUpdate ?? null,
  }
}

export function getPairChemistry(state, idA, idB, fallback = CHEMISTRY_NEUTRAL) {
  const key = pairKey(idA, idB)
  if (!key) return fallback
  const v = state?.pairs?.[key]
  return v == null ? fallback : clampChemistry(v)
}

export function setPairChemistry(state, idA, idB, value) {
  const key = pairKey(idA, idB)
  if (!key) return state
  return {
    ...state,
    pairs: {
      ...(state.pairs ?? {}),
      [key]: clampChemistry(value),
    },
  }
}

export function adjustPairChemistry(state, idA, idB, delta) {
  const prev = getPairChemistry(state, idA, idB, CHEMISTRY_NEUTRAL)
  return setPairChemistry(state, idA, idB, prev + (Number(delta) || 0))
}

/**
 * Converte −100…+100 → 0…100 para pesos da Simulation Engine.
 */
export function chemistryToScore(value) {
  return clamp(
    ((clampChemistry(value) + 100) / 2),
    0,
    100,
  )
}
