import {
  EXPANSION_DONOR_FLOOR,
  EXPANSION_MAX_PICKS,
  EXPANSION_PROTECT_COUNT,
  EXPANSION_ROSTER_TARGET,
} from '../../data/expansion'
import { DEFAULT_CONTRACT_YEARS } from '../../data/gm/constants'
import { resolvePlayer } from '../gm/situation.js'

/**
 * Cada franquia existente protege os top-N por overall.
 */
export function buildProtectedSets(
  gm,
  existingTeamIds,
  protectCount = EXPANSION_PROTECT_COUNT,
) {
  const protectedByTeam = {}
  for (const teamId of existingTeamIds) {
    const roster = [...(gm.rosters?.[teamId] ?? [])]
      .map((id) => ({ id, player: resolvePlayer(gm, id) }))
      .filter((x) => x.player)
      .sort((a, b) => (b.player.overall ?? 0) - (a.player.overall ?? 0))

    const protect = Math.min(protectCount, Math.max(0, roster.length - 1))
    protectedByTeam[teamId] = new Set(roster.slice(0, protect).map((x) => x.id))
  }
  return protectedByTeam
}

function listUnprotectedPool(gm, existingTeamIds, protectedByTeam) {
  const pool = []
  for (const teamId of existingTeamIds) {
    const protectedIds = protectedByTeam[teamId] ?? new Set()
    for (const playerId of gm.rosters?.[teamId] ?? []) {
      if (protectedIds.has(playerId)) continue
      const player = resolvePlayer(gm, playerId)
      if (!player) continue
      pool.push({
        playerId,
        fromTeamId: teamId,
        overall: player.overall ?? 70,
        potencial: player.potencial ?? 70,
        idade: player.idade ?? 27,
        posicao: player.posicao,
        nome: player.nome,
      })
    }
  }
  pool.sort((a, b) => {
    if (b.overall !== a.overall) return b.overall - a.overall
    if (b.potencial !== a.potencial) return b.potencial - a.potencial
    return String(a.playerId).localeCompare(String(b.playerId))
  })
  return pool
}

function needsPosition(gm, teamId, posicao) {
  const counts = { PG: 0, SG: 0, SF: 0, PF: 0, C: 0 }
  for (const id of gm.rosters?.[teamId] ?? []) {
    const p = resolvePlayer(gm, id)
    if (p?.posicao && counts[p.posicao] != null) counts[p.posicao] += 1
  }
  return (counts[posicao] ?? 0) < 1
}

/**
 * Completa elencos de expansão com free agents (após o draft).
 */
function fillFromFreeAgents(gm, expansionTeamIds, rosterTarget) {
  let next = {
    ...gm,
    rosters: Object.fromEntries(
      Object.entries(gm.rosters ?? {}).map(([k, v]) => [k, [...v]]),
    ),
    freeAgents: [...(gm.freeAgents ?? [])],
    contracts: { ...(gm.contracts ?? {}) },
  }
  const faFills = []

  for (const teamId of expansionTeamIds) {
    while ((next.rosters[teamId]?.length ?? 0) < rosterTarget) {
      if (!next.freeAgents.length) break
      // Melhor FA disponível
      const ranked = next.freeAgents
        .map((id) => ({ id, p: resolvePlayer(next, id) }))
        .filter((x) => x.p)
        .sort((a, b) => (b.p.overall ?? 0) - (a.p.overall ?? 0))
      const pick = ranked[0]
      if (!pick) break

      next.freeAgents = next.freeAgents.filter((id) => id !== pick.id)
      next.rosters[teamId] = [...(next.rosters[teamId] ?? []), pick.id]
      next.contracts[pick.id] = {
        playerId: pick.id,
        teamId,
        yearlySalary: pick.p.salario ?? 2_000_000,
        yearsRemaining: DEFAULT_CONTRACT_YEARS,
      }
      faFills.push({
        teamId,
        playerId: pick.id,
        playerName: pick.p.nome,
        overall: pick.p.overall,
        source: 'free_agent',
      })
    }
  }

  return { gm: next, faFills }
}

/**
 * Expansion Draft — snake entre novas franquias sobre o pool desprotegido.
 * Doadores podem cair até EXPANSION_DONOR_FLOOR; resto vem de FA.
 */
export function runExpansionDraft(gm, expansionTeamIds, opts = {}) {
  const existingTeamIds = opts.existingTeamIds ?? []
  const protectCount = opts.protectCount ?? EXPANSION_PROTECT_COUNT
  const rosterTarget = opts.rosterTarget ?? EXPANSION_ROSTER_TARGET
  const maxPicks = opts.maxPicks ?? EXPANSION_MAX_PICKS
  const donorFloor = opts.donorFloor ?? EXPANSION_DONOR_FLOOR

  let next = {
    ...gm,
    rosters: Object.fromEntries(
      Object.entries(gm.rosters ?? {}).map(([k, v]) => [k, [...v]]),
    ),
    contracts: { ...(gm.contracts ?? {}) },
    freeAgents: [...(gm.freeAgents ?? [])],
  }

  for (const id of expansionTeamIds) {
    next.rosters[id] = next.rosters[id] ?? []
  }

  const protectedByTeam = buildProtectedSets(next, existingTeamIds, protectCount)
  const picks = []
  const picksTaken = Object.fromEntries(expansionTeamIds.map((id) => [id, 0]))

  let snake = [...expansionTeamIds]
  let guard = 0
  const maxIterations = expansionTeamIds.length * maxPicks * 4

  while (guard++ < maxIterations) {
    const allFull = expansionTeamIds.every(
      (id) =>
        (next.rosters[id]?.length ?? 0) >= rosterTarget ||
        (picksTaken[id] ?? 0) >= maxPicks,
    )
    if (allFull) break

    const pool = listUnprotectedPool(next, existingTeamIds, protectedByTeam)
    if (!pool.length) break

    let progressed = false
    for (const teamId of snake) {
      if ((next.rosters[teamId]?.length ?? 0) >= rosterTarget) continue
      if ((picksTaken[teamId] ?? 0) >= maxPicks) continue

      const legal = pool.filter(
        (p) => (next.rosters[p.fromTeamId]?.length ?? 0) > donorFloor,
      )
      if (!legal.length) continue

      legal.sort((a, b) => {
        const needA = needsPosition(next, teamId, a.posicao) ? 1 : 0
        const needB = needsPosition(next, teamId, b.posicao) ? 1 : 0
        if (needB !== needA) return needB - needA
        if (b.overall !== a.overall) return b.overall - a.overall
        return String(a.playerId).localeCompare(String(b.playerId))
      })

      const choice = legal[0]
      next.rosters[choice.fromTeamId] = next.rosters[choice.fromTeamId].filter(
        (id) => id !== choice.playerId,
      )
      next.rosters[teamId] = [...(next.rosters[teamId] ?? []), choice.playerId]
      if (next.contracts[choice.playerId]) {
        next.contracts[choice.playerId] = {
          ...next.contracts[choice.playerId],
          teamId,
        }
      }

      picksTaken[teamId] = (picksTaken[teamId] ?? 0) + 1
      picks.push({
        pickNumber: picks.length + 1,
        teamId,
        playerId: choice.playerId,
        playerName: choice.nome,
        fromTeamId: choice.fromTeamId,
        overall: choice.overall,
        posicao: choice.posicao,
      })
      progressed = true
    }

    if (!progressed) break
    snake = [...snake].reverse()
  }

  const filled = fillFromFreeAgents(next, expansionTeamIds, rosterTarget)
  next = filled.gm

  return {
    gm: next,
    picks,
    faFills: filled.faFills,
    protectedByTeam: Object.fromEntries(
      Object.entries(protectedByTeam).map(([k, set]) => [k, [...set]]),
    ),
  }
}
