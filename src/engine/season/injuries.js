import { TEAMS } from '../../data/teams'
import {
  LEAGUE_INJURY_CHANCE,
  LEAGUE_INJURY_LABELS,
  LEAGUE_INJURY_WEEKS,
} from '../../data/season/constants'
import { playerDb } from '../../data/players'

/**
 * Tick de lesões da liga + chance de novas lesões.
 */
export function processLeagueInjuries(injuries = [], rng = Math.random) {
  const messages = []
  let next = []

  for (const inj of injuries) {
    const weeksRemaining = (inj.weeksRemaining ?? 1) - 1
    if (weeksRemaining > 0) {
      next.push({ ...inj, weeksRemaining })
    } else {
      messages.push(`Retorno: ${inj.playerName} (${inj.teamShort}).`)
    }
  }

  const activeTeams = new Set(next.map((i) => i.teamId))

  for (const team of TEAMS) {
    if (activeTeams.has(team.id)) continue
    if (rng() > LEAGUE_INJURY_CHANCE) continue

    const pool = playerDb.getAll()
    const pick = pool[Math.floor(rng() * pool.length)]
    if (!pick) continue

    const label =
      LEAGUE_INJURY_LABELS[Math.floor(rng() * LEAGUE_INJURY_LABELS.length)]
    const weeks =
      LEAGUE_INJURY_WEEKS[Math.floor(rng() * LEAGUE_INJURY_WEEKS.length)]

    next.push({
      id: `inj_${team.id}_${Date.now()}_${Math.floor(rng() * 1e5)}`,
      teamId: team.id,
      teamShort: team.short,
      playerId: pick.id,
      playerName: pick.nome,
      label,
      weeksRemaining: weeks,
    })
    messages.push(
      `Lesão na liga: ${pick.nome} (${team.short}) — ${label} (${weeks} sem.).`,
    )
    activeTeams.add(team.id)
  }

  return { injuries: next, messages }
}

/** Fadiga extra por lesões ativas no time (afeta simulação). */
export function injuryFatigueForTeam(injuries, teamId) {
  const count = (injuries ?? []).filter((i) => i.teamId === teamId).length
  return count * 12
}
