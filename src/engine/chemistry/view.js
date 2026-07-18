import { resolvePlayer } from '../gm/situation'
import { createChemistryState, getPairChemistry, pairKey } from './state.js'
import { buildLineupChemistryEffects } from './effects.js'

/**
 * Visão read-only para a Interface.
 */
export function getChemistryView(state = {}) {
  const chemistry = createChemistryState(
    state.chemistry ?? state.gm?.chemistry,
  )
  const teamId = state.currentTeamId
  const rosterIds = state.gm?.rosters?.[teamId] ?? []
  const players = rosterIds
    .map((id) => resolvePlayer(state.gm ?? {}, id))
    .filter(Boolean)

  const effects = buildLineupChemistryEffects(
    chemistry,
    players,
    state.relationshipEffects?.chemistryBonus ?? 0,
  )

  const nameOf = (id) =>
    players.find((p) => p.id === id)?.nome ?? id

  const topPairs = Object.entries(chemistry.pairs ?? {})
    .map(([key, value]) => {
      const [a, b] = key.split('|')
      return {
        key,
        a,
        b,
        aName: nameOf(a),
        bName: nameOf(b),
        value,
      }
    })
    .filter((p) => {
      // Prioriza pares do elenco atual na UI
      if (!rosterIds.length) return true
      return rosterIds.includes(p.a) && rosterIds.includes(p.b)
    })
    .sort((x, y) => y.value - x.value)

  return {
    teamChemistry: effects.teamChemistry,
    avgPair: effects.avgPair,
    passBoost: effects.passBoost,
    movementBoost: effects.movementBoost,
    defenseBoost: effects.defenseBoost,
    offenseEfficiency: effects.offenseEfficiency,
    pairCount: Object.keys(chemistry.pairs ?? {}).length,
    rosterPairCount: topPairs.length,
    bestPairs: topPairs.slice(0, 5),
    worstPairs: [...topPairs].sort((a, b) => a.value - b.value).slice(0, 5),
    effects: {
      pass: effects.passBoost,
      movement: effects.movementBoost,
      defense: effects.defenseBoost,
      offense: effects.offenseEfficiency,
    },
  }
}

export function getPairView(chemistry, idA, idB) {
  return {
    key: pairKey(idA, idB),
    value: getPairChemistry(chemistry, idA, idB),
  }
}
