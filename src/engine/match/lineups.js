import { playerDb } from '../../data/players'
import { getTeamById, TEAMS } from '../../data/teams'
import { chooseBestStyle } from '../ai'

const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C']

/**
 * Monta um quinteto a partir do banco local (melhor OVR por posição).
 * A AI Engine escolhe o estilo automaticamente.
 */
export function buildLineupFromDb(teamId, { excludeIds = [], styleId } = {}) {
  const excluded = new Set(excludeIds)
  const lineup = []

  for (const pos of POSITIONS) {
    const pick = playerDb
      .getByPosition(pos)
      .filter((p) => !excluded.has(p.id))
      .sort((a, b) => b.overall - a.overall)[0]

    if (pick) {
      lineup.push(pick)
      excluded.add(pick.id)
    }
  }

  while (lineup.length < 5) {
    const next = playerDb
      .getAll()
      .filter((p) => !excluded.has(p.id))
      .sort((a, b) => b.overall - a.overall)[0]
    if (!next) break
    lineup.push(next)
    excluded.add(next.id)
  }

  const team = getTeamById(teamId) ?? TEAMS[0]
  const chem =
    55 +
    Math.round(
      lineup.reduce((s, p) => s + (p.overall - 70), 0) /
        Math.max(1, lineup.length),
    )

  const ai = styleId
    ? { styleId, auto: false }
    : chooseBestStyle(lineup)

  return {
    teamId: team.id,
    teamName: team.name,
    teamShort: team.short,
    team,
    players: lineup,
    chemistry: Math.max(35, Math.min(90, chem)),
    fatigue: 0,
    styleId: ai.styleId,
  }
}

/**
 * Dois times distintos para uma partida de teste.
 */
export function buildDefaultMatchup(homeTeamId = 'gsw', awayTeamId = 'bos') {
  const home = buildLineupFromDb(homeTeamId)
  const away = buildLineupFromDb(awayTeamId, {
    excludeIds: home.players.map((p) => p.id),
  })
  return { home, away }
}
