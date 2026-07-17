import { buildLineupFromDb } from '../match/lineups'
import { simulateMatch } from '../match/simulate'
import { applyGameToStandings } from './standings'
import { injuryFatigueForTeam } from './injuries'

/**
 * Simula uma lista de jogos e atualiza standings/results.
 */
export function simulateGames(games, seasonState, opts = {}) {
  const rng = opts.rng ?? Math.random
  const playerTeamId = opts.playerTeamId
  const playerInjured = Boolean(opts.playerInjured)
  const gm = opts.gm ?? null

  let standings = { ...seasonState.standings }
  const results = [...(seasonState.results ?? [])]
  const weekResults = []
  const messages = []

  for (const game of games) {
    const homeFatigue =
      injuryFatigueForTeam(seasonState.injuries, game.homeId) +
      (playerInjured && game.homeId === playerTeamId ? 10 : 0)
    const awayFatigue =
      injuryFatigueForTeam(seasonState.injuries, game.awayId) +
      (playerInjured && game.awayId === playerTeamId ? 10 : 0)

    const home = buildLineupFromDb(game.homeId, { gm })
    const away = buildLineupFromDb(game.awayId, {
      excludeIds: home.players.map((p) => p.id),
      gm,
    })
    home.fatigue = homeFatigue
    away.fatigue = awayFatigue

    const match = simulateMatch({ home, away }, { rng })
    const entry = {
      gameId: game.id,
      week: game.week,
      phase: game.phase,
      label: game.label,
      homeId: game.homeId,
      awayId: game.awayId,
      homeShort: home.teamShort,
      awayShort: away.teamShort,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      winnerId:
        match.homeScore > match.awayScore ? game.homeId : game.awayId,
      mvp: match.mvp?.nome ?? match.mvp?.name ?? null,
      summary: match.summary,
    }

    results.push(entry)
    weekResults.push(entry)
    standings = applyGameToStandings(standings, entry)

    messages.push(
      `${entry.homeShort} ${entry.homeScore}–${entry.awayScore} ${entry.awayShort}`,
    )
  }

  return { standings, results, weekResults, messages }
}
