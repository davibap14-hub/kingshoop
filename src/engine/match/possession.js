import { HOME_COURT, POSSESSION_BASE } from '../../data/match/constants'
import { clamp } from '../utils/math'

function pickPlayer(players, rng, biasKey = 'overall') {
  if (!players.length) return null
  // Softmax-ish: favorece overall / atributo
  const weights = players.map((p) => {
    const base = p[biasKey] ?? p.overall ?? 70
    return Math.max(1, base) ** 1.6
  })
  const total = weights.reduce((s, w) => s + w, 0)
  let roll = rng() * total
  for (let i = 0; i < players.length; i++) {
    roll -= weights[i]
    if (roll <= 0) return players[i]
  }
  return players[players.length - 1]
}

/**
 * Simula uma posse de bola.
 *
 * @returns {{
 *   outcome: string,
 *   points: number,
 *   scorerId?: string,
 *   assisterId?: string,
 *   rebounderId?: string,
 *   stealerId?: string,
 *   blockerId?: string,
 *   turnoversById?: string,
 *   foulerId?: string,
 *   fouledId?: string,
 *   isThree?: boolean,
 * }}
 */
export function simulatePossession({
  offensePlayers,
  defensePlayers,
  offenseRatings,
  defenseRatings,
  rng = Math.random,
}) {
  const atk = offenseRatings.attack
  const def = defenseRatings.defense
  const gap = atk - def

  // Probabilidades ajustadas pelo matchup
  let toRate = POSSESSION_BASE.turnoverRate - gap * 0.0015
  let foulRate = POSSESSION_BASE.foulRate
  let threeRate = POSSESSION_BASE.threePointRate + gap * 0.001
  let twoRate = POSSESSION_BASE.twoPointRate + gap * 0.0008

  if (offenseRatings.isHome) {
    toRate -= HOME_COURT.turnoverResist
  }

  toRate = clamp(toRate, 0.06, 0.22)
  foulRate = clamp(foulRate, 0.04, 0.14)
  threeRate = clamp(threeRate, 0.18, 0.38)
  twoRate = clamp(twoRate, 0.28, 0.5)

  const makeTwo = clamp(0.48 + gap * 0.004, 0.32, 0.68)
  const makeThree = clamp(0.34 + gap * 0.0035, 0.22, 0.48)
  const ftMake = clamp(0.72 + gap * 0.002, 0.55, 0.9)
  const orbRate = clamp(0.28 + gap * 0.002, 0.18, 0.4)

  const roll = rng()

  // 1) Turnover / roubo
  if (roll < toRate) {
    const stealer = pickPlayer(defensePlayers, rng, 'overall')
    const culprit = pickPlayer(offensePlayers, rng, 'overall')
    const isSteal = rng() < 0.55
    return {
      outcome: isSteal ? 'steal' : 'turnover',
      points: 0,
      stealerId: isSteal ? stealer?.id : undefined,
      turnoversById: culprit?.id,
    }
  }

  // 2) Falta de arremesso
  if (roll < toRate + foulRate) {
    const shooter = pickPlayer(offensePlayers, rng, 'overall')
    const fouler = pickPlayer(defensePlayers, rng, 'overall')
    const isThree = rng() < 0.25
    const fts = isThree ? 3 : 2
    let points = 0
    for (let i = 0; i < fts; i++) {
      if (rng() < ftMake) points += 1
    }
    return {
      outcome: 'shooting_foul',
      points,
      scorerId: points > 0 ? shooter?.id : undefined,
      foulerId: fouler?.id,
      fouledId: shooter?.id,
      isThree,
    }
  }

  // 3) Tentativa de 3
  if (roll < toRate + foulRate + threeRate) {
    const shooter = pickPlayer(offensePlayers, rng, 'overall')
    const assister =
      rng() < 0.55 ? pickPlayer(
        offensePlayers.filter((p) => p.id !== shooter?.id),
        rng,
        'overall',
      ) : null

    // block chance
    if (rng() < clamp(0.04 + (def - atk) * 0.001, 0.02, 0.1)) {
      const blocker = pickPlayer(defensePlayers, rng, 'overall')
      return {
        outcome: 'block',
        points: 0,
        blockerId: blocker?.id,
        scorerId: shooter?.id,
        isThree: true,
      }
    }

    if (rng() < makeThree) {
      return {
        outcome: 'make3',
        points: 3,
        scorerId: shooter?.id,
        assisterId: assister?.id,
        isThree: true,
      }
    }

    // miss → rebound
    const offenseBoard = rng() < orbRate
    const rebounder = pickPlayer(
      offenseBoard ? offensePlayers : defensePlayers,
      rng,
      'overall',
    )
    return {
      outcome: offenseBoard ? 'orb' : 'drb',
      points: 0,
      rebounderId: rebounder?.id,
      isThree: true,
    }
  }

  // 4) Tentativa de 2
  {
    const shooter = pickPlayer(offensePlayers, rng, 'overall')
    const assister =
      rng() < 0.5 ? pickPlayer(
        offensePlayers.filter((p) => p.id !== shooter?.id),
        rng,
        'overall',
      ) : null

    if (rng() < clamp(0.05 + (def - atk) * 0.0012, 0.02, 0.12)) {
      const blocker = pickPlayer(defensePlayers, rng, 'overall')
      return {
        outcome: 'block',
        points: 0,
        blockerId: blocker?.id,
        scorerId: shooter?.id,
        isThree: false,
      }
    }

    if (rng() < makeTwo) {
      return {
        outcome: 'make2',
        points: 2,
        scorerId: shooter?.id,
        assisterId: assister?.id,
        isThree: false,
      }
    }

    const offenseBoard = rng() < orbRate
    const rebounder = pickPlayer(
      offenseBoard ? offensePlayers : defensePlayers,
      rng,
      'overall',
    )
    return {
      outcome: offenseBoard ? 'orb' : 'drb',
      points: 0,
      rebounderId: rebounder?.id,
      isThree: false,
    }
  }
}
