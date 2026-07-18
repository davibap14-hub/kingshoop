import { EXPANSION_FRANCHISE_BY_ID } from '../expansion/franchises.js'
import { FOUNDING_TEAM_IDENTITY, withTeamIdentity } from './identity.js'

const FOUNDING_TEAMS = [
  {
    id: 'gsw',
    name: 'Golden State Warriors',
    short: 'GSW',
    city: 'San Francisco',
    conference: 'West',
  },
  {
    id: 'bos',
    name: 'Boston Celtics',
    short: 'BOS',
    city: 'Boston',
    conference: 'East',
  },
  {
    id: 'lal',
    name: 'Los Angeles Lakers',
    short: 'LAL',
    city: 'Los Angeles',
    conference: 'West',
  },
  {
    id: 'mia',
    name: 'Miami Heat',
    short: 'MIA',
    city: 'Miami',
    conference: 'East',
  },
  {
    id: 'den',
    name: 'Denver Nuggets',
    short: 'DEN',
    city: 'Denver',
    conference: 'West',
  },
  {
    id: 'nyk',
    name: 'New York Knicks',
    short: 'NYK',
    city: 'New York',
    conference: 'East',
  },
].map((t) => withTeamIdentity(t, FOUNDING_TEAM_IDENTITY[t.id]))

/**
 * Liga ativa — mutável in-place para que Season/GM/Draft vejam expansões.
 * Sempre começa com as franquias fundadoras.
 */
export const TEAMS = [...FOUNDING_TEAMS]

export const DEFAULT_TEAM_ID = 'gsw'

export function getFoundingTeams() {
  return FOUNDING_TEAMS.map((t) => ({ ...t }))
}

export function normalizeTeamRecord(team) {
  if (!team?.id) return null
  const expansion = EXPANSION_FRANCHISE_BY_ID[team.id]
  const founding = FOUNDING_TEAM_IDENTITY[team.id]
  const base = expansion
    ? {
        id: expansion.id,
        name: expansion.name,
        short: expansion.short,
        city: expansion.city,
        conference: expansion.conference,
        colors: expansion.colors,
        logo: expansion.logo,
        arena: expansion.arena,
        uniforms: expansion.uniforms,
      }
    : withTeamIdentity(
        FOUNDING_TEAMS.find((t) => t.id === team.id) ?? {
          id: team.id,
          name: team.name,
          short: team.short,
          city: team.city,
          conference: team.conference,
        },
        founding,
      )

  return {
    ...base,
    ...team,
    colors: team.colors ?? base.colors,
    logo: team.logo ?? base.logo,
    arena: team.arena ?? base.arena,
    uniforms: team.uniforms ?? base.uniforms,
  }
}

/**
 * Sincroniza TEAMS com a lista ativa (fundadoras + expansão).
 */
export function syncLeagueTeams(activeTeamIds = null) {
  const ids =
    activeTeamIds?.length > 0
      ? [...activeTeamIds]
      : FOUNDING_TEAMS.map((t) => t.id)

  const next = []
  const seen = new Set()
  for (const id of ids) {
    if (seen.has(id)) continue
    seen.add(id)
    const founding = FOUNDING_TEAMS.find((t) => t.id === id)
    const expansion = EXPANSION_FRANCHISE_BY_ID[id]
    if (founding) next.push({ ...founding })
    else if (expansion) {
      next.push(
        normalizeTeamRecord({
          id: expansion.id,
          name: expansion.name,
          short: expansion.short,
          city: expansion.city,
          conference: expansion.conference,
          colors: expansion.colors,
          logo: expansion.logo,
          arena: expansion.arena,
          uniforms: expansion.uniforms,
        }),
      )
    }
  }

  if (!next.length) next.push(...FOUNDING_TEAMS.map((t) => ({ ...t })))

  TEAMS.splice(0, TEAMS.length, ...next)
  return [...TEAMS]
}

export function getTeamById(teamId) {
  return (
    TEAMS.find((t) => t.id === teamId) ??
    normalizeTeamRecord(EXPANSION_FRANCHISE_BY_ID[teamId]) ??
    TEAMS[0]
  )
}

export function listActiveTeamIds() {
  return TEAMS.map((t) => t.id)
}
