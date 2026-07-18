import { analyzeGameBox } from '../analytics'
import { careerInjurySimFatigue } from '../injuries'
import { buildLineupFromDb } from '../match/lineups'
import { extractPerformances } from '../news/extract'
import { simulateGame } from '../simulation/game'
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
  const chemistryBonus = Number(opts.chemistryBonus) || 0
  const careerInjuryFatigue = playerInjured
    ? careerInjurySimFatigue(
        opts.injuryEngine?.active ?? opts.injury,
        opts.injuryEngine?.profile,
      )
    : 0

  let standings = { ...seasonState.standings }
  const results = [...(seasonState.results ?? [])]
  const weekResults = []
  const messages = []

  for (const game of games) {
    const homeFatigue =
      injuryFatigueForTeam(seasonState.injuries, game.homeId) +
      (playerInjured && game.homeId === playerTeamId
        ? careerInjuryFatigue || 10
        : 0)
    const awayFatigue =
      injuryFatigueForTeam(seasonState.injuries, game.awayId) +
      (playerInjured && game.awayId === playerTeamId
        ? careerInjuryFatigue || 10
        : 0)

    const homeBonus =
      game.homeId === playerTeamId ? chemistryBonus : 0
    const awayBonus =
      game.awayId === playerTeamId ? chemistryBonus : 0

    const home = buildLineupFromDb(game.homeId, {
      gm,
      chemistryBonus: homeBonus,
    })
    const away = buildLineupFromDb(game.awayId, {
      excludeIds: home.players.map((p) => p.id),
      gm,
      chemistryBonus: awayBonus,
    })
    home.fatigue = homeFatigue
    away.fatigue = awayFatigue

    const match = simulateGame({ home, away }, { rng })
    const performances = extractPerformances(match, {
      homeId: game.homeId,
      awayId: game.awayId,
      homeShort: home.teamShort,
      awayShort: away.teamShort,
      gameId: game.id,
    })
    const analytics = analyzeGameBox(match.boxScore, {
      possessionCount: match.possessionCount,
    })
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
      mvpStats: match.mvp
        ? {
            id: match.mvp.id,
            points: match.mvp.points,
            rebounds: match.mvp.rebounds,
            assists: match.mvp.assists,
          }
        : null,
      possessionCount: match.possessionCount ?? null,
      boxSummary: flattenBoxSummary(match.boxScore, analytics),
      analytics: {
        players: (analytics.players ?? []).map((p) => ({
          playerId: p.playerId,
          playerName: p.playerName,
          teamId: p.teamId,
          advanced: p.advanced,
        })),
        teams: Object.fromEntries(
          Object.entries(analytics.teams ?? {}).map(([id, t]) => [
            id,
            {
              teamId: t.teamId,
              possessions: t.possessions,
              ortg: t.ortg,
              drtg: t.drtg,
              points: t.points,
            },
          ]),
        ),
      },
      performances,
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

/**
 * Linhas de box score para History / Hall of Fame / Analytics.
 * Inclui tiros e ORB/DRB para métricas avançadas sem re-simular.
 */
function flattenBoxSummary(boxScore, analytics = null) {
  if (!boxScore) return []
  const advById = new Map(
    (analytics?.players ?? []).map((p) => [p.playerId, p.advanced]),
  )
  const lines = []
  for (const side of [boxScore.home, boxScore.away]) {
    if (!side?.players) continue
    for (const p of side.players) {
      lines.push({
        playerId: p.id ?? null,
        playerName: p.nome ?? p.name ?? null,
        teamId: side.teamId ?? null,
        points: p.points ?? 0,
        assists: p.assists ?? 0,
        rebounds: p.rebounds ?? 0,
        orb: p.orb ?? 0,
        drb: p.drb ?? 0,
        steals: p.steals ?? 0,
        blocks: p.blocks ?? 0,
        turnovers: p.turnovers ?? 0,
        fouls: p.fouls ?? 0,
        fgMade: p.fgMade ?? 0,
        fgAtt: p.fgAtt ?? 0,
        threeMade: p.threeMade ?? 0,
        threeAtt: p.threeAtt ?? 0,
        ftMade: p.ftMade ?? 0,
        ftAtt: p.ftAtt ?? 0,
        advanced: advById.get(p.id) ?? null,
      })
    }
  }
  return lines
}
