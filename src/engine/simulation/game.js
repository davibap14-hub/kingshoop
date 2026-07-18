import {
  normalizePersonality,
  normalizeTendencies,
} from '../../data/players/utils'
import {
  SIM_POSSESSIONS_PER_QUARTER,
  SIM_QUARTERS,
} from '../../data/simulation/constants'
import { decidePossessionPlan, resolveTeamStyle } from '../ai'
import { buildLineupChemistryEffects } from '../chemistry'
import { ensurePlayerDna } from '../dna'
import {
  applyPossessionToBox,
  computeMvp,
  createTeamBox,
  recomputeTotals,
} from './boxscore'
import { simulatePossessionDetailed } from './possession'
import { resetPbpSeq, stampScoreOnEvents } from './playbyplay'

function withPlayerProfile(player) {
  const withDna = ensurePlayerDna({
    ...player,
    tendencias: normalizeTendencies(player, player?.tendencias ?? {}),
    personalidade: normalizePersonality(player, player?.personalidade ?? {}),
  })
  return withDna
}

function normalizeSide(side, { isHome }) {
  const players = (side.players ?? []).slice(0, 5).map(withPlayerProfile)
  if (players.length < 5) {
    throw new Error(
      'Cada time precisa de 5 jogadores para a Simulation Engine.',
    )
  }

  const styleDecision = resolveTeamStyle(side)

  // Química de pares — reconstruída aqui para ter pairScoreBetween na posse
  const chemistryEffects =
    side.chemistryEffects ??
    buildLineupChemistryEffects(
      side.chemistryState ?? null,
      players,
      side.chemistryBonus ?? 0,
    )

  return {
    team: {
      id: side.teamId ?? side.team?.id ?? (isHome ? 'home' : 'away'),
      name: side.teamName ?? side.team?.name ?? (isHome ? 'Casa' : 'Fora'),
      short: side.teamShort ?? side.team?.short ?? (isHome ? 'HOME' : 'AWAY'),
    },
    players,
    chemistry: side.chemistry ?? chemistryEffects.teamChemistry ?? 55,
    chemistryEffects,
    chemistryState: chemistryEffects.state,
    coachSetBias: side.coachSetBias ?? side.coach?.setBias ?? {},
    coach: side.coach ?? null,
    defenseBias: side.defenseBias ?? side.coach?.defenseBias ?? null,
    playbook: side.playbook ?? null,
    fatigue: side.fatigue ?? 0,
    isHome,
    styleId: styleDecision.styleId,
    style: styleDecision.style,
    styleFit: styleDecision.fit,
    styleAuto: styleDecision.auto,
    styleReason: styleDecision.reason,
  }
}

/**
 * Simulation Engine — partida completa posse a posse.
 * Retorna placar, box score, estilos e Play-by-Play completo.
 *
 * Alias público: também exportado como simulateMatch (compat).
 */
export function simulateGame(input = {}, opts = {}) {
  const rng = opts.rng ?? input.rng ?? Math.random
  const quarters = opts.quarters ?? SIM_QUARTERS
  const basePossessions =
    opts.possessionsPerQuarter ?? SIM_POSSESSIONS_PER_QUARTER

  resetPbpSeq()

  const home = normalizeSide(input.home ?? {}, { isHome: true })
  const away = normalizeSide(input.away ?? {}, { isHome: false })

  const homeBox = createTeamBox(home.team, home.players)
  const awayBox = createTeamBox(away.team, away.players)

  const quarterScores = []
  const playByPlay = []
  let homeScore = 0
  let awayScore = 0
  let offenseIsHome = rng() < 0.5
  let allowFastBreak = false
  let possessionCount = 0

  const runPossession = (quarter, momentKey) => {
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
      quarter: typeof quarter === 'number' ? quarter : 4,
      fatigue: offense.fatigue + (typeof quarter === 'number' ? (quarter - 1) * 6 : 28),
      momentKey,
    })

    const fatigue =
      offense.fatigue +
      (typeof quarter === 'number' ? (quarter - 1) * 6 : 28)
    const result = simulatePossessionDetailed({
      offensePlayers: offense.players,
      defensePlayers: defense.players,
      offenseTeam: offense.team,
      defenseTeam: defense.team,
      quarter,
      homeScore,
      awayScore,
      offenseIsHome,
      context: {
        allowFastBreak,
        chemistry: offense.chemistry ?? 55,
        chemistryEffects: offense.chemistryEffects,
        defenseChemistryEffects: defense.chemistryEffects,
        coachSetBias: offense.coachSetBias ?? {},
        coach: offense.coach ?? null,
        playbook: offense.playbook ?? null,
        // Defensive Engine — preferências do técnico DEFENSOR
        defenseBias: defense.defenseBias ?? defense.coach?.defenseBias ?? null,
        defenseCoach: defense.coach ?? null,
        styleThreeBias: offensePlan?.threeBias ?? 0,
        stylePace: offense.style?.match?.pace ?? 1,
        styleMotion: offense.styleId === 'fast_pace' ? 0.8 : 0.5,
        clockLabel: typeof quarter === 'number' ? `Q${quarter}` : String(quarter),
        // Fatigue Engine — carga de lado + in-game
        fatigue,
        offenseSideFatigue: offense.fatigue,
        defenseSideFatigue: defense.fatigue,
        offensePlan,
        momentKey,
        scoreDiff,
        momentumBias: scoreDiff * 1.5,
        isPlayoff: Boolean(opts.isPlayoff ?? input.isPlayoff),
        gameImportance: opts.gameImportance ?? input.gameImportance ?? 50,
        possessionIndex: possessionCount,
        possessionsThisQuarter: basePossessions,
      },
      rng,
    })

    applyPossessionToBox(offenseBox, defenseBox, result)

    if (result.points > 0) {
      if (offenseIsHome) homeScore += result.points
      else awayScore += result.points
    }

    const stamped = stampScoreOnEvents(result.events, homeScore, awayScore)
    playByPlay.push(...stamped)
    possessionCount += 1

    allowFastBreak = Boolean(result.transitionNext)

    if (!result.keepsPossession) {
      offenseIsHome = !offenseIsHome
    }

    return result
  }

  for (let q = 1; q <= quarters; q++) {
    let qHome = 0
    let qAway = 0

    const avgPace =
      ((home.style.match?.pace ?? 1) + (away.style.match?.pace ?? 1)) / 2
    const possessionsThisQuarter = Math.max(
      18,
      Math.round(basePossessions * avgPace),
    )

    for (let p = 0; p < possessionsThisQuarter; p++) {
      const momentKey =
        q === 4 && Math.abs(homeScore - awayScore) <= 8 ? 'q4_close' : `q${q}`
      const beforeH = homeScore
      const beforeA = awayScore
      runPossession(q, momentKey)
      qHome += homeScore - beforeH
      qAway += awayScore - beforeA
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
    const otPossessions = Math.max(8, Math.round(basePossessions / 2))

    for (let p = 0; p < otPossessions; p++) {
      const beforeH = homeScore
      const beforeA = awayScore
      runPossession(`OT${otPeriod}`, 'q4_close')
      qHome += homeScore - beforeH
      qAway += awayScore - beforeA
    }

    quarterScores.push({
      quarter: `OT${otPeriod}`,
      home: qHome,
      away: qAway,
      homeTotal: homeScore,
      awayTotal: awayScore,
    })
  }

  recomputeTotals(homeBox)
  recomputeTotals(awayBox)

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
    boxScore: { home: homeBox, away: awayBox },
    styles,
    pontos: { home: homeBox.totals.points, away: awayBox.totals.points },
    rebotes: { home: homeBox.totals.rebounds, away: awayBox.totals.rebounds },
    assistencias: {
      home: homeBox.totals.assists,
      away: awayBox.totals.assists,
    },
    roubos: { home: homeBox.totals.steals, away: awayBox.totals.steals },
    tocos: { home: homeBox.totals.blocks, away: awayBox.totals.blocks },
    turnovers: {
      home: homeBox.totals.turnovers,
      away: awayBox.totals.turnovers,
    },
    faltas: { home: homeBox.totals.fouls, away: awayBox.totals.fouls },
    mvp,
    summary: winner
      ? `${winner.short} vence ${homeScore}–${awayScore}${overtime ? ' (OT)' : ''}. MVP: ${mvp?.nome ?? '—'}.`
      : `Empate ${homeScore}–${awayScore}.`,
    possessionCount,
    /** Play-by-Play completo da Simulation Engine */
    playByPlay,
    /** compat com log curto antigo */
    possessionLog: playByPlay.slice(-20).map((e) => ({
      quarter: e.quarter,
      offense: e.offense,
      outcome: e.action,
      points: e.points,
      text: e.text,
    })),
  }
}

/** Alias de compatibilidade — substitui a antiga Match Engine */
export const simulateMatch = simulateGame
