import { DEFAULT_CONTRACT_YEARS, ROSTER_SIZE_MAX } from '../../data/gm/constants'
import { canAfford } from './cap'
import { resolvePlayer } from './situation'

function cloneGm(gm) {
  return {
    ...gm,
    rosters: Object.fromEntries(
      Object.entries(gm.rosters ?? {}).map(([k, v]) => [k, [...v]]),
    ),
    freeAgents: [...(gm.freeAgents ?? [])],
    contracts: { ...(gm.contracts ?? {}) },
    draftClass: [...(gm.draftClass ?? [])],
    draftOrder: [...(gm.draftOrder ?? [])],
    extraPlayers: [...(gm.extraPlayers ?? [])],
    log: [...(gm.log ?? [])],
  }
}

export function releasePlayer(gm, teamId, playerId, reason = 'Dispensa') {
  const next = cloneGm(gm)
  const roster = next.rosters[teamId] ?? []
  if (!roster.includes(playerId)) {
    return { ok: false, gm, decision: null }
  }

  next.rosters[teamId] = roster.filter((id) => id !== playerId)
  if (!next.freeAgents.includes(playerId)) next.freeAgents.push(playerId)
  delete next.contracts[playerId]

  const player = resolvePlayer(next, playerId)
  const decision = {
    type: 'release',
    teamId,
    playerId,
    playerName: player?.nome ?? playerId,
    reason,
    at: Date.now(),
  }

  return { ok: true, gm: next, decision }
}

export function signFreeAgent(gm, teamId, playerId, opts = {}) {
  const next = cloneGm(gm)
  const player = resolvePlayer(next, playerId)
  if (!player) return { ok: false, gm, decision: null }
  if (!next.freeAgents.includes(playerId)) {
    return { ok: false, gm, decision: null }
  }

  const roster = next.rosters[teamId] ?? []
  if (roster.length >= ROSTER_SIZE_MAX) {
    return { ok: false, gm, decision: null }
  }

  const salary = opts.yearlySalary ?? player.salario ?? 2_000_000
  if (!canAfford(next.contracts, teamId, salary)) {
    return { ok: false, gm, decision: null }
  }

  next.freeAgents = next.freeAgents.filter((id) => id !== playerId)
  next.rosters[teamId] = [...roster, playerId]
  next.contracts[playerId] = {
    playerId,
    teamId,
    yearlySalary: salary,
    yearsRemaining: opts.years ?? DEFAULT_CONTRACT_YEARS,
  }

  const decision = {
    type: 'sign',
    teamId,
    playerId,
    playerName: player.nome,
    yearlySalary: salary,
    reason: opts.reason ?? 'Contratação',
    at: Date.now(),
  }

  return { ok: true, gm: next, decision }
}

export function renewContract(gm, teamId, playerId, opts = {}) {
  const next = cloneGm(gm)
  const contract = next.contracts[playerId]
  const player = resolvePlayer(next, playerId)
  if (!contract || contract.teamId !== teamId || !player) {
    return { ok: false, gm, decision: null }
  }

  const bump = opts.salaryBump ?? 1.08
  const newSalary = Math.round(contract.yearlySalary * bump)
  const delta = newSalary - contract.yearlySalary
  // checa se o aumento cabe no teto
  const payrollWithout = Object.values(next.contracts)
    .filter((c) => c.teamId === teamId && c.playerId !== playerId)
    .reduce((s, c) => s + c.yearlySalary, 0)
  if (payrollWithout + newSalary > (opts.cap ?? 140_000_000)) {
    return { ok: false, gm, decision: null }
  }

  next.contracts[playerId] = {
    ...contract,
    yearlySalary: newSalary,
    yearsRemaining: opts.years ?? Math.max(2, contract.yearsRemaining + 1),
  }

  const decision = {
    type: 'renew',
    teamId,
    playerId,
    playerName: player.nome,
    yearlySalary: newSalary,
    salaryDelta: delta,
    reason: opts.reason ?? 'Renovação',
    at: Date.now(),
  }

  return { ok: true, gm: next, decision }
}

/**
 * Troca 1 por 1 entre times.
 */
export function tradePlayers(gm, teamA, playerA, teamB, playerB, reason = 'Troca') {
  const next = cloneGm(gm)
  const rosterA = next.rosters[teamA] ?? []
  const rosterB = next.rosters[teamB] ?? []
  if (!rosterA.includes(playerA) || !rosterB.includes(playerB)) {
    return { ok: false, gm, decision: null }
  }

  next.rosters[teamA] = rosterA.map((id) => (id === playerA ? playerB : id))
  next.rosters[teamB] = rosterB.map((id) => (id === playerB ? playerA : id))

  if (next.contracts[playerA]) {
    next.contracts[playerA] = { ...next.contracts[playerA], teamId: teamB }
  }
  if (next.contracts[playerB]) {
    next.contracts[playerB] = { ...next.contracts[playerB], teamId: teamA }
  }

  const pA = resolvePlayer(next, playerA)
  const pB = resolvePlayer(next, playerB)

  const decision = {
    type: 'trade',
    teamId: teamA,
    partnerId: teamB,
    playerId: playerA,
    playerName: pA?.nome ?? playerA,
    acquiredId: playerB,
    acquiredName: pB?.nome ?? playerB,
    reason,
    at: Date.now(),
  }

  return { ok: true, gm: next, decision }
}

export function draftProspect(gm, teamId, prospectId, pickNumber) {
  const next = cloneGm(gm)
  const prospect = (next.draftClass ?? []).find((p) => p.id === prospectId)
  if (!prospect) return { ok: false, gm, decision: null }

  const roster = next.rosters[teamId] ?? []
  if (roster.length >= ROSTER_SIZE_MAX) {
    return { ok: false, gm, decision: null }
  }

  next.draftClass = next.draftClass.filter((p) => p.id !== prospectId)
  next.rosters[teamId] = [...roster, prospectId]
  next.extraPlayers = [...next.extraPlayers, prospect]
  next.contracts[prospectId] = {
    playerId: prospectId,
    teamId,
    yearlySalary: prospect.salario,
    yearsRemaining: DEFAULT_CONTRACT_YEARS + 1,
  }
  next.draftOrder = next.draftOrder.filter((id) => id !== teamId)

  const decision = {
    type: 'draft',
    teamId,
    playerId: prospectId,
    playerName: prospect.nome,
    pickNumber,
    overall: prospect.overall,
    potencial: prospect.potencial,
    reason: `Draft pick #${pickNumber}`,
    at: Date.now(),
  }

  return { ok: true, gm: next, decision }
}
