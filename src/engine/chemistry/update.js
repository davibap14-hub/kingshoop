import {
  CHEMISTRY_DECAY_STEP,
  CHEMISTRY_DECAY_THRESHOLD,
  CHEMISTRY_DELTAS,
  CHEMISTRY_NEUTRAL,
} from '../../data/chemistry'
import {
  adjustPairChemistry,
  createChemistryState,
  getPairChemistry,
  pairKey,
} from './state.js'
import { ensureRosterPairs } from './personality.js'

/**
 * Aplica delta a todos os pares de uma lista de ids.
 */
export function adjustAllPairs(state, playerIds, delta) {
  let next = createChemistryState(state)
  const ids = [...new Set(playerIds.filter(Boolean))]
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      next = adjustPairChemistry(next, ids[i], ids[j], delta)
    }
  }
  return next
}

/**
 * Tempo jogando juntos — +weeksTogether e leve ganho de química.
 */
export function applyTimeTogether(state, rosterIds) {
  let next = createChemistryState(state)
  const ids = [...new Set(rosterIds.filter(Boolean))]
  const weeks = { ...(next.weeksTogether ?? {}) }

  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const key = pairKey(ids[i], ids[j])
      if (!key) continue
      weeks[key] = (weeks[key] ?? 0) + 1
      next = adjustPairChemistry(
        next,
        ids[i],
        ids[j],
        CHEMISTRY_DELTAS.weekTogether,
      )
    }
  }

  return { ...next, weeksTogether: weeks }
}

/**
 * Vitória / derrota do elenco — pesos fixos, sem RNG.
 */
export function applyGameResultToChemistry(state, rosterIds, won) {
  const delta = won
    ? CHEMISTRY_DELTAS.winTogether
    : CHEMISTRY_DELTAS.lossTogether
  return adjustAllPairs(state, rosterIds, delta)
}

/**
 * Treino / confraternização.
 */
export function applyTrainingChemistry(state, rosterIds, activityType) {
  if (activityType === 'bonding') {
    return adjustAllPairs(state, rosterIds, CHEMISTRY_DELTAS.trainingBond)
  }
  if (activityType === 'train') {
    return adjustAllPairs(state, rosterIds, CHEMISTRY_DELTAS.trainingSession)
  }
  if (activityType === 'media') {
    return adjustAllPairs(state, rosterIds, CHEMISTRY_DELTAS.mediaConflict)
  }
  return createChemistryState(state)
}

/**
 * Discussão / evento — afeta pares envolvendo o jogador de carreira.
 */
export function applyDiscussionChemistry(
  state,
  careerPlayerId,
  teammateIds,
  severity = 1,
) {
  let next = createChemistryState(state)
  const delta = Math.round(CHEMISTRY_DELTAS.discussion * severity)
  for (const tid of teammateIds) {
    if (!tid || tid === careerPlayerId) continue
    next = adjustPairChemistry(next, careerPlayerId, tid, delta)
  }
  return next
}

export function applyEventChemistry(
  state,
  careerPlayerId,
  teammateIds,
  positive,
) {
  const delta = positive
    ? CHEMISTRY_DELTAS.eventPositive
    : CHEMISTRY_DELTAS.eventNegative
  let next = createChemistryState(state)
  for (const tid of teammateIds) {
    if (!tid || tid === careerPlayerId) continue
    next = adjustPairChemistry(next, careerPlayerId, tid, delta)
  }
  return next
}

/**
 * Decay leve em direção ao neutro (anti-explosão).
 */
export function applyChemistryDecay(state) {
  const next = createChemistryState(state)
  const pairs = { ...next.pairs }
  for (const [key, value] of Object.entries(pairs)) {
    if (Math.abs(value) < CHEMISTRY_DECAY_THRESHOLD) continue
    pairs[key] =
      value > CHEMISTRY_NEUTRAL
        ? value - CHEMISTRY_DECAY_STEP
        : value + CHEMISTRY_DECAY_STEP
  }
  return { ...next, pairs }
}

/**
 * Garante pares de um elenco e aplica tempo juntos.
 */
export function tickRosterChemistry(state, players) {
  let next = ensureRosterPairs(createChemistryState(state), players)
  next = applyTimeTogether(
    next,
    players.map((p) => p.id),
  )
  next = applyChemistryDecay(next)
  next = { ...next, lastUpdate: Date.now() }
  return next
}

export function getWeeksTogether(state, idA, idB) {
  const key = pairKey(idA, idB)
  if (!key) return 0
  return state?.weeksTogether?.[key] ?? 0
}

export { getPairChemistry }
