import {
  ATTACK_WEIGHTS,
  DEFENSE_WEIGHTS,
  HOME_COURT,
  MOMENT_MODS,
} from '../../data/match/constants'
import { TEAM_STYLES, DEFAULT_TEAM_STYLE } from '../../data/ai/styles'
import { calcGroupRating, calcOverall } from '../../data/players/utils'
import { clamp } from '../utils/math'

function avg(values) {
  if (!values.length) return 0
  return values.reduce((s, n) => s + n, 0) / values.length
}

/**
 * Rating de um jogador em um lado da bola.
 */
export function playerSideRating(player, side = 'attack') {
  const weights = side === 'attack' ? ATTACK_WEIGHTS : DEFENSE_WEIGHTS
  const groups = {
    fisico: calcGroupRating(player.fisico),
    arremesso: calcGroupRating(player.arremesso),
    defesa: calcGroupRating(player.defesa),
    qi: calcGroupRating(player.qi),
  }

  let rating = 0
  for (const [key, w] of Object.entries(weights)) {
    rating += (groups[key] ?? 50) * w
  }

  const ovr = player.overall ?? calcOverall(player)
  rating = rating * 0.7 + ovr * 0.3
  return rating
}

/**
 * Ratings de time para a posse atual.
 *
 * Considera: ataque, defesa, fadiga, química, overall, momento, mando + estilo IA.
 */
export function computeTeamRatings(side, context) {
  const {
    players,
    chemistry = 55,
    fatigue = 0,
    isHome = false,
    quarter = 1,
    scoreDiff = 0,
    momentKey,
    styleId = DEFAULT_TEAM_STYLE,
    plan = null,
  } = context

  const style = TEAM_STYLES[styleId] ?? TEAM_STYLES[DEFAULT_TEAM_STYLE]
  const mods = style.match

  const attack = avg(players.map((p) => playerSideRating(p, 'attack')))
  const defense = avg(players.map((p) => playerSideRating(p, 'defense')))
  const overall = avg(players.map((p) => p.overall ?? calcOverall(p)))

  const chemMod = (chemistry - 50) * 0.08
  const fatiguePenalty = fatigue * 0.12 * (mods.fatigueMult ?? 1)

  let moment = MOMENT_MODS[`q${quarter}`] ?? MOMENT_MODS.q1
  if (momentKey && MOMENT_MODS[momentKey]) {
    moment = MOMENT_MODS[momentKey]
  } else if (quarter === 4 && Math.abs(scoreDiff) <= 8) {
    moment = MOMENT_MODS.q4_close
  }

  let atk = attack + chemMod - fatiguePenalty + overall * 0.05 + (mods.attack ?? 0)
  let def = defense + chemMod * 0.7 - fatiguePenalty * 0.8 + overall * 0.04 + (mods.defense ?? 0)

  if (plan) {
    atk += (plan.aggression - 1) * 8
    def += plan.protectBall * 20
  }

  if (isHome) {
    atk += HOME_COURT.attack
    def += HOME_COURT.defense
  }

  if (moment.clutch > 0) {
    if (scoreDiff < 0) atk += moment.clutch * 40
    if (scoreDiff > 0) def += moment.clutch * 20
  }

  return {
    attack: clamp(atk, 30, 115),
    defense: clamp(def, 30, 115),
    overall,
    chemistry,
    fatigue,
    moment,
    isHome,
    styleId: style.id,
    styleLabel: style.label,
    styleMods: mods,
    plan,
  }
}

export function resolveMomentKey(quarter, homeScore, awayScore) {
  if (quarter === 4 && Math.abs(homeScore - awayScore) <= 8) return 'q4_close'
  return `q${quarter}`
}
