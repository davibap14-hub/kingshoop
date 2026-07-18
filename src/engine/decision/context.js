/**
 * Contexto vivo da Decision Engine para uma posse.
 */

import { PRESSURE_MOMENTS } from '../../data/decision'
import { clamp } from '../utils/math'

/**
 * Monta o contexto de decisão a partir do estado da partida / posse.
 * Inclui: atributos (via players), tendências, personalidade, DNA, química,
 * coach, fadiga, momentum, matchup, placar, tempo, pressão, importância.
 */
export function buildPossessionDecisionContext({
  offensePlayers = [],
  defensePlayers = [],
  offenseTeam = null,
  defenseTeam = null,
  quarter = 1,
  homeScore = 0,
  awayScore = 0,
  offenseIsHome = true,
  context = {},
  possessionIndex = 0,
  possessionsThisQuarter = 24,
} = {}) {
  const scoreDiff = offenseIsHome
    ? homeScore - awayScore
    : awayScore - homeScore

  const absDiff = Math.abs(scoreDiff)
  const q = typeof quarter === 'number' ? quarter : 4
  const clockFrac = clamp(
    1 - possessionIndex / Math.max(1, possessionsThisQuarter),
    0,
    1,
  )
  const timeRemaining = clockFrac // 1 = início do quarto, 0 = fim

  let momentKey = 'normal'
  if (context.momentKey) momentKey = context.momentKey
  else if (context.isPlayoff) momentKey = 'playoff'
  else if (q >= 4 && absDiff <= 8) momentKey = 'q4_close'
  else if (q >= 4) momentKey = 'q4'
  else if (absDiff >= 20) momentKey = 'blowout'

  const moment = PRESSURE_MOMENTS[momentKey] ?? PRESSURE_MOMENTS.normal

  // Pressão sobe no fim do jogo / placar apertado
  const pressure = clamp(
    moment.pressure +
      (q >= 4 ? 10 : 0) +
      (absDiff <= 5 && q >= 3 ? 12 : 0) +
      (timeRemaining < 0.25 && q >= 4 ? 15 : 0) -
      (absDiff >= 18 ? 20 : 0),
    0,
    100,
  )

  const importance = clamp(
    moment.importance +
      (context.gameImportance ?? 0) * 0.3 +
      (q >= 4 && absDiff <= 10 ? 15 : 0),
    0,
    100,
  )

  // Momentum: sequência / placar recente (proxy)
  const momentum = clamp(
    50 +
      scoreDiff * 2.2 +
      (context.momentumBias ?? 0) -
      (context.fatigue ?? 0) * 0.15,
    0,
    100,
  )

  const fatigue = clamp(
    Number(context.fatigue ?? 0) + (q - 1) * 6 + (1 - timeRemaining) * 8,
    0,
    100,
  )

  const avgOvr = (players) => {
    if (!players?.length) return 70
    return (
      players.reduce((s, p) => s + (p.overall ?? 70), 0) / players.length
    )
  }
  const matchup = clamp(
    Number(
      context.matchup ??
        50 + (avgOvr(offensePlayers) - avgOvr(defensePlayers)) * 2.2,
    ),
    0,
    100,
  )

  return {
    offensePlayers,
    defensePlayers,
    offenseTeam,
    defenseTeam,
    quarter: q,
    homeScore,
    awayScore,
    offenseIsHome,
    scoreDiff,
    timeRemaining,
    clockLabel: context.clockLabel ?? `Q${q}`,
    fatigue,
    momentum,
    pressure,
    importance,
    momentKey,
    chemistry: context.chemistry ?? context.chemistryEffects?.teamChemistry ?? 55,
    chemistryEffects: context.chemistryEffects ?? null,
    defenseChemistryEffects: context.defenseChemistryEffects ?? null,
    coachSetBias: context.coachSetBias ?? {},
    coach: context.coach ?? null,
    playbook: context.playbook ?? null,
    playbookCategoryBias: context.playbookCategoryBias ?? null,
    defenseBias: context.defenseBias ?? null,
    defenseCoach: context.defenseCoach ?? null,
    matchup,
    styleThreeBias: context.styleThreeBias ?? 0,
    stylePace: context.stylePace ?? 1,
    styleMotion: context.styleMotion ?? 0.5,
    allowFastBreak: Boolean(context.allowFastBreak),
    offensePlan: context.offensePlan ?? null,
    isPlayoff: Boolean(context.isPlayoff),
    gameImportance: context.gameImportance ?? importance,
  }
}

export function personality(player, key, fallback = 50) {
  const v = player?.personalidade?.[key]
  if (v == null || Number.isNaN(Number(v))) return fallback
  return clamp(Number(v), 0, 100)
}
