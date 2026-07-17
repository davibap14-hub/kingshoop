import {
  DEFAULT_CONTRACT_YEARS,
  DRAFT_CLASS_SIZE,
  MAX_GM_LOG,
  ROSTER_SIZE_TARGET,
} from '../../data/gm/constants'
import {
  GM_PERSONALITIES,
  TEAM_PERSONALITY_MAP,
} from '../../data/gm/personalities'
import { playerDb } from '../../data/players'
import { TEAMS } from '../../data/teams'

/**
 * Distribui jogadores do banco em elencos iniciais (snake por OVR).
 */
export function buildInitialRosters(teams = TEAMS) {
  const sorted = playerDb.sortBy('overall', 'desc')
  const rosters = Object.fromEntries(teams.map((t) => [t.id, []]))
  const freeAgents = []

  let direction = 1
  let idx = 0
  for (const player of sorted) {
    const team = teams[idx]
    if ((rosters[team.id]?.length ?? 0) < ROSTER_SIZE_TARGET) {
      rosters[team.id].push(player.id)
    } else {
      freeAgents.push(player.id)
      continue
    }

    idx += direction
    if (idx >= teams.length) {
      direction = -1
      idx = teams.length - 1
    } else if (idx < 0) {
      direction = 1
      idx = 0
    }
  }

  // Sobra vai para FA
  const assigned = new Set(Object.values(rosters).flat())
  for (const p of sorted) {
    if (!assigned.has(p.id) && !freeAgents.includes(p.id)) {
      freeAgents.push(p.id)
    }
  }

  return { rosters, freeAgents }
}

export function buildInitialContracts(rosters) {
  const contracts = {}
  for (const [teamId, ids] of Object.entries(rosters)) {
    for (const playerId of ids) {
      const p = playerDb.getById(playerId)
      if (!p) continue
      contracts[playerId] = {
        playerId,
        teamId,
        yearlySalary: p.salario ?? 2_000_000,
        yearsRemaining: DEFAULT_CONTRACT_YEARS + (p.overall >= 85 ? 1 : 0),
      }
    }
  }
  return contracts
}

export function assignPersonalities(teams = TEAMS) {
  const map = {}
  for (const team of teams) {
    map[team.id] =
      TEAM_PERSONALITY_MAP[team.id] ??
      Object.keys(GM_PERSONALITIES)[
        Math.abs(team.id.charCodeAt(0)) % Object.keys(GM_PERSONALITIES).length
      ]
  }
  return map
}

/**
 * Gera classe de draft procedural (prospects).
 */
export function generateDraftClass(seasonNumber, rng = Math.random) {
  const positions = ['PG', 'SG', 'SF', 'PF', 'C']
  const classSize = DRAFT_CLASS_SIZE
  const prospects = []

  for (let i = 0; i < classSize; i++) {
    const pos = positions[i % positions.length]
    const overall = 68 + Math.floor(rng() * 14)
    const pot = Math.min(96, overall + 6 + Math.floor(rng() * 12))
    const salario = 1_200_000 + Math.floor(rng() * 2_500_000)
    prospects.push({
      id: `draft_s${seasonNumber}_${i + 1}`,
      nome: `Prospect ${seasonNumber}-${i + 1}`,
      idade: 19 + Math.floor(rng() * 3),
      posicao: pos,
      overall,
      potencial: pot,
      popularidade: 15 + Math.floor(rng() * 20),
      arquetipo: 'versatil',
      valorMercado: salario * 4,
      salario,
      isProspect: true,
    })
  }

  return prospects.sort((a, b) => b.potencial - a.potencial)
}

export function createGmState(overrides = {}) {
  const built = overrides.rosters
    ? {
        rosters: overrides.rosters,
        freeAgents: overrides.freeAgents ?? [],
      }
    : buildInitialRosters()

  const contracts = overrides.contracts ?? buildInitialContracts(built.rosters)

  return {
    personalities: overrides.personalities ?? assignPersonalities(),
    rosters: built.rosters,
    freeAgents: overrides.freeAgents ?? built.freeAgents,
    contracts,
    draftClass: overrides.draftClass ?? [],
    draftOrder: overrides.draftOrder ?? [],
    draftComplete: overrides.draftComplete ?? false,
    extraPlayers: overrides.extraPlayers ?? [],
    log: overrides.log ?? [],
    lastWeekDecisions: overrides.lastWeekDecisions ?? [],
  }
}

export function appendGmLog(log = [], entries = []) {
  const next = [...log, ...entries]
  if (next.length <= MAX_GM_LOG) return next
  return next.slice(next.length - MAX_GM_LOG)
}

export function getPersonality(gm, teamId) {
  const id = gm.personalities?.[teamId] ?? 'competitiva'
  return GM_PERSONALITIES[id] ?? GM_PERSONALITIES.competitiva
}
