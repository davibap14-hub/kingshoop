import {
  POSSESSIONS_PER_QUARTER,
  QUARTERS,
} from '../../data/match/constants'
import { decidePossessionPlan, resolveTeamStyle } from '../ai'
import { applyPossessionToBox, computeMvp, createTeamBox } from './boxscore'
import { simulatePossession } from './possession'
import { computeTeamRatings, resolveMomentKey } from './ratings'

function normalizeSide(side, { isHome }) {
  const players = (side.players ?? []).slice(0, 5)
  if (players.length < 5) {
    throw new Error('Cada time precisa de 5 jogadores para a Match Engine.')
  }

  const styleDecision = resolveTeamStyle(side)

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
    styleId: styleDecision.styleId,
    style: styleDecision.style,
    styleFit: styleDecision.fit,
    styleAuto: styleDecision.auto,
    styleReason: styleDecision.reason,
    styleRanked: styleDecision.ranked,
  }
}

function possessionsForStyle(base, style) {
  const pace = style?.match?.pace ?? 1
  return Math.max(18, Math.round(base * pace))
}

/**
 * Match Engine — simula partida posse a posse.
 * Estilos da AI Engine alteram decisões automaticamente.
 */
export function simulateMatch(input = {}, opts = {}) {
  const rng = opts.rng ?? input.rng ?? Math.random
  const quarters = opts.quarters ?? QUARTERS
  const basePossessions =
    opts.possessionsPerQuarter ?? POSSESSIONS_PER_QUARTER

  const home = normalizeSide(input.home ?? {}, { isHome: true })
  const away = normalizeSide(input.away ?? {}, { isHome: false })

  const homeBox = createTeamBox(home.team, home.players)
  const awayBox = createTeamBox(away.team, away.players)

  const quarterScores = []
  let homeScore = 0
  let awayScore = 0
  const possessionLog = []
  let offenseIsHome = rng() < 0.5

  for (let q = 1; q <= quarters; q++) {
    let qHome = 0
    let qAway = 0
    const fatigueBase = (q - 1) * 6

    // Média de pace dos dois times define volume do quarto
    const avgPace =
      ((home.style.match.pace ?? 1) + (away.style.match.pace ?? 1)) / 2
    const possessionsThisQuarter = Math.max(
      18,
      Math.round(basePossessions * avgPace),
    )

    for (let p = 0; p < possessionsThisQuarter; p++) {
      const momentKey = resolveMomentKey(q, homeScore, awayScore)
      const offense = offenseIsHome ? home : away
      const defense = offenseIsHome ? away : home
      const offenseBox = offenseIsHome ? homeBox : awayBox
      const defenseBox = offenseIsHome ? awayBox : homeBox

      const scoreDiff = offenseIsHome
        ? homeScore - awayScore
        : awayScore - homeScore

      const offenseFatigue =
        (fatigueBase + offense.fatigue) * (offense.style.match.fatigueMult ?? 1)
      const defenseFatigue =
        (fatigueBase + defense.fatigue) * (defense.style.match.fatigueMult ?? 1)

      const offensePlan = decidePossessionPlan({
        styleId: offense.styleId,
        scoreDiff,
        quarter: q,
        fatigue: offenseFatigue,
        momentKey,
      })

      const defensePlan = decidePossessionPlan({
        styleId: defense.styleId,
        scoreDiff: -scoreDiff,
        quarter: q,
        fatigue: defenseFatigue,
        momentKey,
      })

      const offenseRatings = computeTeamRatings('offense', {
        players: offense.players,
        chemistry: offense.chemistry,
        fatigue: offenseFatigue,
        isHome: offense.isHome,
        quarter: q,
        scoreDiff,
        momentKey,
        styleId: offense.styleId,
        plan: offensePlan,
      })

      const defenseRatings = computeTeamRatings('defense', {
        players: defense.players,
        chemistry: defense.chemistry,
        fatigue: defenseFatigue,
        isHome: defense.isHome,
        quarter: q,
        scoreDiff: -scoreDiff,
        momentKey,
        styleId: defense.styleId,
        plan: defensePlan,
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
        styleId: offense.styleId,
        outcome: result.outcome,
        points: result.points,
      })

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

  let overtime = false
  let otPeriod = 0
  while (homeScore === awayScore && otPeriod < 3) {
    overtime = true
    otPeriod += 1
    let qHome = 0
    let qAway = 0
    const otPossessions = Math.round(
      possessionsForStyle(basePossessions / 2, home.style),
    )

    for (let p = 0; p < otPossessions; p++) {
      const offense = offenseIsHome ? home : away
      const defense = offenseIsHome ? away : home
      const offenseBox = offenseIsHome ? homeBox : awayBox
      const defenseBox = offenseIsHome ? awayBox : homeBox
      const scoreDiff = offenseIsHome
        ? homeScore - awayScore
        : awayScore - homeScore

      const offensePlan = decidePossessionPlan({
        styleId: offense.styleId,
        scoreDiff,
        quarter: 4,
        fatigue: 28,
        momentKey: 'q4_close',
      })
      const defensePlan = decidePossessionPlan({
        styleId: defense.styleId,
        scoreDiff: -scoreDiff,
        quarter: 4,
        fatigue: 28,
        momentKey: 'q4_close',
      })

      const offenseRatings = computeTeamRatings('offense', {
        players: offense.players,
        chemistry: offense.chemistry,
        fatigue: 28,
        isHome: offense.isHome,
        quarter: 4,
        scoreDiff,
        momentKey: 'q4_close',
        styleId: offense.styleId,
        plan: offensePlan,
      })
      const defenseRatings = computeTeamRatings('defense', {
        players: defense.players,
        chemistry: defense.chemistry,
        fatigue: 28,
        isHome: defense.isHome,
        quarter: 4,
        scoreDiff: -scoreDiff,
        momentKey: 'q4_close',
        styleId: defense.styleId,
        plan: defensePlan,
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

  const styles = {
    home: {
      id: home.styleId,
      label: home.style.label,
      fit: home.styleFit,
      auto: home.styleAuto,
      reason: home.styleReason,
    },
    away: {
      id: away.styleId,
      label: away.style.label,
      fit: away.styleFit,
      auto: away.styleAuto,
      reason: away.styleReason,
    },
  }

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
    styles,
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
      ? `${winner.short} vence ${homeScore}–${awayScore}${overtime ? ' (OT)' : ''}. MVP: ${mvp?.nome ?? '—'}. Estilos: ${styles.home.label} vs ${styles.away.label}.`
      : `Empate ${homeScore}–${awayScore}.`,
    possessionCount: possessionLog.length,
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
