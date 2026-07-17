import {
  POSSESSIONS_PER_QUARTER,
  QUARTERS,
} from '../../data/match/constants'
import { applyPossessionToBox, computeMvp, createTeamBox } from './boxscore'
import { simulatePossession } from './possession'
import { computeTeamRatings, resolveMomentKey } from './ratings'

function normalizeSide(side, { isHome }) {
  const players = (side.players ?? []).slice(0, 5)
  if (players.length < 5) {
    throw new Error('Cada time precisa de 5 jogadores para a Match Engine.')
  }

  return {
    team: {
      id: side.teamId ?? side.team?.id ?? (isHome ? 'home' : 'away'),
      name: side.teamName ?? side.team?.name ?? (isHome ? 'Casa' : 'Fora'),
      short: side.teamShort ?? side.team?.short ?? (isHome ? 'HOME' : 'AWAY'),
    },
    players,
    chemistry: side.chemistry ?? 55,
    fatigue: side.fatigue ?? 0,
    isHome,
  }
}

/**
 * Match Engine — simula partida posse a posse.
 *
 * Fatores por posse: ataque, defesa, fadiga, química, overall,
 * momento da partida, mando de quadra.
 *
 * Retorno para a Interface (somente leitura):
 * pontos, rebotes, assistências, roubos, tocos, turnovers, faltas,
 * MVP e placar final.
 */
export function simulateMatch(input = {}, opts = {}) {
  const rng = opts.rng ?? input.rng ?? Math.random
  const quarters = opts.quarters ?? QUARTERS
  const possessionsPerQuarter =
    opts.possessionsPerQuarter ?? POSSESSIONS_PER_QUARTER

  const home = normalizeSide(input.home ?? {}, { isHome: true })
  const away = normalizeSide(input.away ?? {}, { isHome: false })

  const homeBox = createTeamBox(home.team, home.players)
  const awayBox = createTeamBox(away.team, away.players)

  const quarterScores = []
  let homeScore = 0
  let awayScore = 0
  let possessionLog = []
  let offenseIsHome = rng() < 0.5

  for (let q = 1; q <= quarters; q++) {
    let qHome = 0
    let qAway = 0

    // fadiga cresce ao longo do jogo
    const fatigueBase = (q - 1) * 6

    for (let p = 0; p < possessionsPerQuarter; p++) {
      const momentKey = resolveMomentKey(q, homeScore, awayScore)
      const offense = offenseIsHome ? home : away
      const defense = offenseIsHome ? away : home
      const offenseBox = offenseIsHome ? homeBox : awayBox
      const defenseBox = offenseIsHome ? awayBox : homeBox

      const scoreDiff = offenseIsHome
        ? homeScore - awayScore
        : awayScore - homeScore

      const offenseRatings = computeTeamRatings('offense', {
        players: offense.players,
        chemistry: offense.chemistry,
        fatigue: fatigueBase + offense.fatigue,
        isHome: offense.isHome,
        quarter: q,
        scoreDiff,
        momentKey,
      })

      const defenseRatings = computeTeamRatings('defense', {
        players: defense.players,
        chemistry: defense.chemistry,
        fatigue: fatigueBase + defense.fatigue,
        isHome: defense.isHome,
        quarter: q,
        scoreDiff: -scoreDiff,
        momentKey,
      })

      const result = simulatePossession({
        offensePlayers: offense.players,
        defensePlayers: defense.players,
        offenseRatings,
        defenseRatings,
        rng,
      })

      applyPossessionToBox(offenseBox, defenseBox, result)

      if (result.points > 0) {
        if (offenseIsHome) {
          homeScore += result.points
          qHome += result.points
        } else {
          awayScore += result.points
          qAway += result.points
        }
      }

      possessionLog.push({
        quarter: q,
        offense: offense.team.short,
        outcome: result.outcome,
        points: result.points,
      })

      // troca de posse (exceto ORB → mantém)
      if (result.outcome !== 'orb') {
        offenseIsHome = !offenseIsHome
      }
    }

    quarterScores.push({
      quarter: q,
      home: qHome,
      away: qAway,
      homeTotal: homeScore,
      awayTotal: awayScore,
    })
  }

  // prorrogação simples se empatar
  let overtime = false
  let otPeriod = 0
  while (homeScore === awayScore && otPeriod < 3) {
    overtime = true
    otPeriod += 1
    let qHome = 0
    let qAway = 0
    for (let p = 0; p < Math.round(possessionsPerQuarter / 2); p++) {
      const offense = offenseIsHome ? home : away
      const defense = offenseIsHome ? away : home
      const offenseBox = offenseIsHome ? homeBox : awayBox
      const defenseBox = offenseIsHome ? awayBox : homeBox
      const scoreDiff = offenseIsHome
        ? homeScore - awayScore
        : awayScore - homeScore

      const offenseRatings = computeTeamRatings('offense', {
        players: offense.players,
        chemistry: offense.chemistry,
        fatigue: 28,
        isHome: offense.isHome,
        quarter: 4,
        scoreDiff,
        momentKey: 'q4_close',
      })
      const defenseRatings = computeTeamRatings('defense', {
        players: defense.players,
        chemistry: defense.chemistry,
        fatigue: 28,
        isHome: defense.isHome,
        quarter: 4,
        scoreDiff: -scoreDiff,
        momentKey: 'q4_close',
      })

      const result = simulatePossession({
        offensePlayers: offense.players,
        defensePlayers: defense.players,
        offenseRatings,
        defenseRatings,
        rng,
      })
      applyPossessionToBox(offenseBox, defenseBox, result)
      if (result.points > 0) {
        if (offenseIsHome) {
          homeScore += result.points
          qHome += result.points
        } else {
          awayScore += result.points
          qAway += result.points
        }
      }
      if (result.outcome !== 'orb') offenseIsHome = !offenseIsHome
    }
    quarterScores.push({
      quarter: `OT${otPeriod}`,
      home: qHome,
      away: qAway,
      homeTotal: homeScore,
      awayTotal: awayScore,
    })
  }

  // sync totals
  for (const box of [homeBox, awayBox]) {
    box.totals = {
      points: box.players.reduce((s, p) => s + p.points, 0),
      rebounds: box.players.reduce((s, p) => s + p.rebounds, 0),
      assists: box.players.reduce((s, p) => s + p.assists, 0),
      steals: box.players.reduce((s, p) => s + p.steals, 0),
      blocks: box.players.reduce((s, p) => s + p.blocks, 0),
      turnovers: box.players.reduce((s, p) => s + p.turnovers, 0),
      fouls: box.players.reduce((s, p) => s + p.fouls, 0),
    }
  }

  const mvp = computeMvp(homeBox, awayBox)

  const winner =
    homeScore === awayScore
      ? null
      : homeScore > awayScore
        ? home.team
        : away.team

  return {
    homeScore,
    awayScore,
    placarFinal: {
      home: homeScore,
      away: awayScore,
      homeTeam: home.team,
      awayTeam: away.team,
    },
    quarters: quarterScores,
    overtime,
    boxScore: {
      home: homeBox,
      away: awayBox,
    },
    // atalhos pedidos pela Interface
    pontos: {
      home: homeBox.totals.points,
      away: awayBox.totals.points,
    },
    rebotes: {
      home: homeBox.totals.rebounds,
      away: awayBox.totals.rebounds,
    },
    assistencias: {
      home: homeBox.totals.assists,
      away: awayBox.totals.assists,
    },
    roubos: {
      home: homeBox.totals.steals,
      away: awayBox.totals.steals,
    },
    tocos: {
      home: homeBox.totals.blocks,
      away: awayBox.totals.blocks,
    },
    turnovers: {
      home: homeBox.totals.turnovers,
      away: awayBox.totals.turnovers,
    },
    faltas: {
      home: homeBox.totals.fouls,
      away: awayBox.totals.fouls,
    },
    mvp,
    summary: winner
      ? `${winner.short} vence ${homeScore}–${awayScore}${overtime ? ' (OT)' : ''}. MVP: ${mvp?.nome ?? '—'}.`
      : `Empate ${homeScore}–${awayScore}.`,
    possessionCount: possessionLog.length,
    // log resumido (Interface pode ignorar)
    possessionLog: possessionLog.slice(-20),
  }
}

/** @deprecated placar rápido — use simulateMatch completo */
export function simulateMatchScoreOnly({ homeOvr, awayOvr, rng = Math.random }) {
  const result = simulateMatch(
    {
      home: {
        teamId: 'home',
        teamName: 'Casa',
        teamShort: 'HOME',
        chemistry: 55,
        players: stubLineup(homeOvr, 'h'),
      },
      away: {
        teamId: 'away',
        teamName: 'Fora',
        teamShort: 'AWAY',
        chemistry: 55,
        players: stubLineup(awayOvr, 'a'),
      },
    },
    { rng },
  )
  return {
    homeScore: result.homeScore,
    awayScore: result.awayScore,
    summary: result.summary,
  }
}

function stubLineup(ovr = 75, prefix = 'x') {
  const positions = ['PG', 'SG', 'SF', 'PF', 'C']
  return positions.map((pos, i) => ({
    id: `${prefix}_${pos}`,
    nome: `Player ${prefix.toUpperCase()}${i + 1}`,
    posicao: pos,
    overall: ovr,
    fisico: { velocidade: ovr, impulsao: ovr, forca: ovr, resistencia: ovr },
    arremesso: {
      bandeja: ovr,
      midRange: ovr,
      tresPontos: ovr,
      lanceLivre: ovr,
    },
    defesa: { perimetro: ovr, garrafao: ovr, roubo: ovr, toco: ovr },
    qi: { passe: ovr, visao: ovr, tomadaDecisao: ovr },
  }))
}

export { createEmptyBoxScore } from './legacy'
