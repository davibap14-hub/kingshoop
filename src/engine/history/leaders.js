import { getTeamById } from '../../data/teams'

/**
 * Calcula líderes da temporada a partir de standings + results.
 */
export function computeSeasonLeaders(seasonState) {
  const standings = Object.values(seasonState?.standings ?? {})
  const results = seasonState?.results ?? []

  const byWins = [...standings].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins
    return (
      b.pointsFor -
      b.pointsAgainst -
      (a.pointsFor - a.pointsAgainst)
    )
  })

  const byOffense = [...standings].sort(
    (a, b) => b.pointsFor - a.pointsFor,
  )
  const byDefense = [...standings].sort(
    (a, b) => a.pointsAgainst - b.pointsAgainst,
  )
  const byDiff = [...standings].sort((a, b) => {
    const dA = a.pointsFor - a.pointsAgainst
    const dB = b.pointsFor - b.pointsAgainst
    return dB - dA
  })

  const scorerMap = new Map()
  const mvpMap = new Map()
  const tdMap = new Map()

  for (const game of results) {
    if (game.mvp) {
      const key = game.mvpStats?.id ?? game.mvp
      const cur = mvpMap.get(key) ?? {
        playerId: game.mvpStats?.id ?? null,
        name: game.mvp,
        count: 0,
      }
      cur.count += 1
      mvpMap.set(key, cur)
    }
    for (const perf of game.performances ?? []) {
      if (perf.type === 'scoring_burst' || perf.type === 'game_mvp') {
        const key = perf.playerId ?? perf.playerName
        const cur = scorerMap.get(key) ?? {
          playerId: perf.playerId ?? null,
          name: perf.playerName ?? perf.playerId,
          teamShort: perf.teamShort,
          points: 0,
          games: 0,
          high: 0,
        }
        cur.points += perf.points ?? 0
        cur.games += 1
        cur.high = Math.max(cur.high, perf.points ?? 0)
        scorerMap.set(key, cur)
      }
      if (perf.type === 'triple_double') {
        const key = perf.playerId ?? perf.playerName
        const cur = tdMap.get(key) ?? {
          playerId: perf.playerId ?? null,
          name: perf.playerName ?? perf.playerId,
          teamId: perf.teamId ?? null,
          teamShort: perf.teamShort,
          value: 0,
        }
        cur.value += 1
        tdMap.set(key, cur)
      }
    }
  }

  const scoringLeaders = [...scorerMap.values()]
    .sort((a, b) => b.high - a.high || b.points - a.points)
    .slice(0, 5)

  const gameMvpLeaders = [...mvpMap.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const tripleDoubles = [...tdMap.values()]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  const top = byWins[0]
  return {
    season: seasonState?.seasonNumber ?? null,
    wins: top
      ? {
          teamId: top.teamId,
          teamShort: top.short ?? getTeamById(top.teamId)?.short,
          wins: top.wins,
          losses: top.losses,
        }
      : null,
    offense: byOffense[0]
      ? {
          teamId: byOffense[0].teamId,
          teamShort: byOffense[0].short,
          pointsFor: byOffense[0].pointsFor,
        }
      : null,
    defense: byDefense[0]
      ? {
          teamId: byDefense[0].teamId,
          teamShort: byDefense[0].short,
          pointsAgainst: byDefense[0].pointsAgainst,
        }
      : null,
    differential: byDiff[0]
      ? {
          teamId: byDiff[0].teamId,
          teamShort: byDiff[0].short,
          diff: byDiff[0].pointsFor - byDiff[0].pointsAgainst,
        }
      : null,
    scoring: scoringLeaders,
    gameMvps: gameMvpLeaders,
    tripleDoubles,
    gamesPlayed: results.length,
  }
}

/**
 * Estatísticas agregadas da temporada.
 */
export function computeSeasonStats(seasonState) {
  const results = seasonState?.results ?? []
  const standings = Object.values(seasonState?.standings ?? {})
  let totalPoints = 0
  let maxScore = 0
  let maxMargin = 0

  for (const g of results) {
    const home = g.homeScore ?? 0
    const away = g.awayScore ?? 0
    totalPoints += home + away
    maxScore = Math.max(maxScore, home, away)
    maxMargin = Math.max(maxMargin, Math.abs(home - away))
  }

  const bestStreak = standings.reduce(
    (best, row) => {
      if ((row.streak ?? 0) > (best.streak ?? 0)) {
        return {
          teamId: row.teamId,
          teamShort: row.short,
          streak: row.streak,
          streakLabel: row.streakLabel,
        }
      }
      return best
    },
    { streak: 0 },
  )

  return {
    season: seasonState?.seasonNumber ?? null,
    gamesPlayed: results.length,
    totalPoints,
    averageScore:
      results.length > 0
        ? Math.round((totalPoints / (results.length * 2)) * 10) / 10
        : 0,
    highestTeamScore: maxScore,
    largestMargin: maxMargin,
    bestWinStreak: bestStreak.streak > 0 ? bestStreak : null,
    teamCount: standings.length,
    standings: standings
      .map((row) => ({
        teamId: row.teamId,
        short: row.short,
        conference: row.conference,
        wins: row.wins,
        losses: row.losses,
        streak: row.streak,
        pointsFor: row.pointsFor,
        pointsAgainst: row.pointsAgainst,
      }))
      .sort((a, b) => b.wins - a.wins || b.pointsFor - b.pointsAgainst - (a.pointsFor - a.pointsAgainst)),
  }
}
