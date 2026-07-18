import { TEAMS } from '../../data/teams'
import { CONFERENCES } from '../../data/season/constants'

export function createEmptyStanding(team) {
  return {
    teamId: team.id,
    short: team.short,
    name: team.name,
    conference: team.conference,
    wins: 0,
    losses: 0,
    streak: 0, // positivo = V, negativo = D
    streakLabel: '—',
    pointsFor: 0,
    pointsAgainst: 0,
    confWins: 0,
    confLosses: 0,
    gamesPlayed: 0,
  }
}

export function createInitialStandings(teams = TEAMS) {
  const standings = {}
  for (const team of teams) {
    standings[team.id] = createEmptyStanding(team)
  }
  return standings
}

function streakLabel(streak) {
  if (!streak) return '—'
  return streak > 0 ? `${streak}V` : `${Math.abs(streak)}D`
}

/**
 * Aplica resultado de um jogo nas standings.
 */
export function applyGameToStandings(standings, game) {
  const next = { ...standings }
  const home = { ...next[game.homeId] }
  const away = { ...next[game.awayId] }
  if (!home || !away) return standings

  const homeWin = game.homeScore > game.awayScore
  const winnerId = homeWin ? game.homeId : game.awayId
  const loserId = homeWin ? game.awayId : game.homeId

  const winner = winnerId === home.teamId ? home : away
  const loser = loserId === home.teamId ? home : away

  winner.wins += 1
  winner.gamesPlayed += 1
  winner.streak = winner.streak > 0 ? winner.streak + 1 : 1
  winner.streakLabel = streakLabel(winner.streak)

  loser.losses += 1
  loser.gamesPlayed += 1
  loser.streak = loser.streak < 0 ? loser.streak - 1 : -1
  loser.streakLabel = streakLabel(loser.streak)

  home.pointsFor += game.homeScore
  home.pointsAgainst += game.awayScore
  away.pointsFor += game.awayScore
  away.pointsAgainst += game.homeScore

  if (home.conference === away.conference) {
    if (homeWin) {
      home.confWins += 1
      away.confLosses += 1
    } else {
      away.confWins += 1
      home.confLosses += 1
    }
  }

  next[home.teamId] = home
  next[away.teamId] = away
  return next
}

export function sortConference(standings, conference) {
  return Object.values(standings)
    .filter((s) => s.conference === conference)
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins
      if (a.losses !== b.losses) return a.losses - b.losses
      const diffA = a.pointsFor - a.pointsAgainst
      const diffB = b.pointsFor - b.pointsAgainst
      if (diffB !== diffA) return diffB - diffA
      return b.confWins - a.confWins
    })
    .map((row, i) => ({ ...row, seed: i + 1 }))
}

export function getConferenceTables(standings) {
  const tables = {}
  for (const conf of CONFERENCES) {
    tables[conf] = sortConference(standings, conf)
  }
  return tables
}

export function getTeamRecord(standings, teamId) {
  const row = standings?.[teamId]
  if (!row) return { wins: 0, losses: 0, streakLabel: '—' }
  return {
    wins: row.wins,
    losses: row.losses,
    streak: row.streak,
    streakLabel: row.streakLabel,
  }
}
