/**
 * Analytics a partir de um box score de jogo (Simulation Engine).
 */

import { ANALYTICS_LEAGUE } from '../../data/analytics'
import {
  computeAdvancedStats,
  estimatePossessions,
  playerEfficiencyRating,
} from './metrics.js'

/**
 * Extrai totais de tiro / rebote de um lado do box.
 */
export function summarizeTeamBox(side) {
  const players = side?.players ?? []
  const sum = (key) => players.reduce((s, p) => s + (Number(p[key]) || 0), 0)

  const orb = sum('orb')
  const drb = sum('drb')
  const reb = sum('rebounds') || orb + drb

  return {
    teamId: side?.teamId ?? null,
    teamShort: side?.teamShort ?? null,
    points: sum('points') || side?.totals?.points || 0,
    reb,
    orb,
    drb,
    ast: sum('assists'),
    stl: sum('steals'),
    blk: sum('blocks'),
    tov: sum('turnovers'),
    pf: sum('fouls'),
    fgm: sum('fgMade'),
    fga: sum('fgAtt'),
    threePm: sum('threeMade'),
    threePa: sum('threeAtt'),
    ftm: sum('ftMade'),
    fta: sum('ftAtt'),
    players,
  }
}

function pieComponent(p) {
  const orb = Number(p.orb) || 0
  const drb = Number(p.drb) || Math.max(0, (Number(p.rebounds) || 0) - orb)
  return (
    (Number(p.points) || 0) +
    (Number(p.fgMade) || 0) +
    (Number(p.ftMade) || 0) -
    (Number(p.fgAtt) || 0) -
    (Number(p.ftAtt) || 0) +
    drb +
    0.5 * orb +
    (Number(p.assists) || 0) +
    (Number(p.steals) || 0) +
    0.5 * (Number(p.blocks) || 0) -
    (Number(p.fouls) || 0) -
    (Number(p.turnovers) || 0)
  )
}

function toLine(player, minutes) {
  const orb = Number(player.orb) || 0
  const drb =
    Number(player.drb) || Math.max(0, (Number(player.rebounds) || 0) - orb)
  return {
    playerId: player.id,
    playerName: player.nome ?? player.name,
    posicao: player.posicao,
    pts: player.points,
    reb: player.rebounds,
    orb,
    drb,
    ast: player.assists,
    stl: player.steals,
    blk: player.blocks,
    tov: player.turnovers,
    pf: player.fouls,
    fgm: player.fgMade,
    fga: player.fgAtt,
    threePm: player.threeMade,
    threePa: player.threeAtt,
    ftm: player.ftMade,
    fta: player.ftAtt,
    minutes,
  }
}

/**
 * Calcula analytics avançados para todos os jogadores de um jogo.
 *
 * @param {object} boxScore — { home, away } da Simulation Engine
 * @param {{ possessionCount?: number }} [opts]
 */
export function analyzeGameBox(boxScore, opts = {}) {
  if (!boxScore?.home || !boxScore?.away) {
    return { players: [], teams: {}, possessionCount: 0 }
  }

  const home = summarizeTeamBox(boxScore.home)
  const away = summarizeTeamBox(boxScore.away)

  const homePoss =
    estimatePossessions({
      fga: home.fga,
      fta: home.fta,
      orb: home.orb,
      tov: home.tov,
    }) || (Number(opts.possessionCount) || 0) / 2
  const awayPoss =
    estimatePossessions({
      fga: away.fga,
      fta: away.fta,
      orb: away.orb,
      tov: away.tov,
    }) || (Number(opts.possessionCount) || 0) / 2

  const pieDenom =
    [...home.players, ...away.players].reduce((s, p) => s + pieComponent(p), 0) ||
    1

  const paceFactor =
    homePoss + awayPoss > 0
      ? (homePoss + awayPoss) / 200
      : 1

  const teamMinutes = ANALYTICS_LEAGUE.teamMinutes
  const starterMinutes = ANALYTICS_LEAGUE.starterMinutes
  const nHome = Math.max(1, home.players.length)
  const nAway = Math.max(1, away.players.length)
  const homeMinutes = teamMinutes / nHome
  const awayMinutes = teamMinutes / nAway

  // Âncora PER: média uPER do jogo → escala para ~15
  const rawLines = [
    ...home.players.map((p) => toLine(p, homeMinutes || starterMinutes)),
    ...away.players.map((p) => toLine(p, awayMinutes || starterMinutes)),
  ]
  const uPers = rawLines
    .map((line) => {
      const raw = playerEfficiencyRating(line, {
        paceFactor,
        leagueUPer: 1,
      })
      return raw == null ? null : raw / ANALYTICS_LEAGUE.averagePer
    })
    .filter((v) => v != null && Number.isFinite(v))
  const leagueUPer =
    uPers.length > 0
      ? uPers.reduce((s, v) => s + v, 0) / uPers.length
      : 0.35

  const buildSide = (team, opp, teamPossessions, oppPossessions, minutes) =>
    team.players.map((p) => {
      const line = toLine(p, minutes || starterMinutes)
      const advanced = computeAdvancedStats(line, {
        teamMinutes,
        teamFga: team.fga,
        teamFta: team.fta,
        teamTov: team.tov,
        teamFgm: team.fgm,
        teamReb: team.reb,
        teamOrb: team.orb,
        oppReb: opp.reb,
        oppPoints: opp.points,
        oppFga: opp.fga,
        oppFta: opp.fta,
        oppOrb: opp.orb,
        oppTov: opp.tov,
        teamPossessions,
        oppPossessions,
        pieDenom,
        paceFactor,
        leagueUPer,
      })
      return {
        ...line,
        teamId: team.teamId,
        teamShort: team.teamShort,
        advanced,
      }
    })

  const players = [
    ...buildSide(home, away, homePoss, awayPoss, homeMinutes),
    ...buildSide(away, home, awayPoss, homePoss, awayMinutes),
  ]

  return {
    players,
    teams: {
      [home.teamId]: {
        ...home,
        possessions: Math.round(homePoss * 10) / 10,
        ortg:
          homePoss > 0
            ? Math.round((home.points / homePoss) * 1000) / 10
            : null,
        drtg:
          awayPoss > 0
            ? Math.round((away.points / awayPoss) * 1000) / 10
            : null,
      },
      [away.teamId]: {
        ...away,
        possessions: Math.round(awayPoss * 10) / 10,
        ortg:
          awayPoss > 0
            ? Math.round((away.points / awayPoss) * 1000) / 10
            : null,
        drtg:
          homePoss > 0
            ? Math.round((home.points / homePoss) * 1000) / 10
            : null,
      },
    },
    possessionCount: Number(opts.possessionCount) || homePoss + awayPoss,
  }
}
