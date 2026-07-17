import { HOME_COURT, POSSESSION_BASE } from '../../data/match/constants'
import { DEFAULT_TEAM_STYLE, TEAM_STYLES } from '../../data/ai/styles'
import { clamp } from '../utils/math'

function pickPlayer(players, rng, biasFn) {
  if (!players.length) return null
  const weights = players.map((p) => {
    const base = typeof biasFn === 'function' ? biasFn(p) : (p.overall ?? 70)
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

function shooterBias(styleId) {
  return (p) => {
    if (styleId === 'especialista_3pt') {
      return (p.arremesso?.tresPontos ?? 60) * 1.4 + (p.overall ?? 70) * 0.3
    }
    if (styleId === 'garrafao') {
      return (p.arremesso?.bandeja ?? 60) * 1.3 + (p.fisico?.forca ?? 60) * 0.5
    }
    if (styleId === 'transicao' || styleId === 'fast_pace') {
      return (p.fisico?.velocidade ?? 60) * 0.8 + (p.arremesso?.bandeja ?? 60) * 0.7
    }
    return p.overall ?? 70
  }
}

/**
 * Simula uma posse — decisões moduladas pelo estilo da AI Engine.
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

  const offStyle =
    TEAM_STYLES[offenseRatings.styleId] ?? TEAM_STYLES[DEFAULT_TEAM_STYLE]
  const defStyle =
    TEAM_STYLES[defenseRatings.styleId] ?? TEAM_STYLES[DEFAULT_TEAM_STYLE]
  const offMods = offStyle.match
  const defMods = defStyle.match
  const plan = offenseRatings.plan

  let toRate =
    POSSESSION_BASE.turnoverRate -
    gap * 0.0015 +
    (offMods.turnoverRate ?? 0) -
    (defMods.stealChance ?? 0) * 0.15
  let foulRate = POSSESSION_BASE.foulRate + (offMods.foulRate ?? 0) + (defMods.foulRate ?? 0) * 0.5
  let threeRate =
    POSSESSION_BASE.threePointRate +
    gap * 0.001 +
    (offMods.threeRate ?? 0) +
    (plan?.threeBias ?? 0)
  let twoRate =
    POSSESSION_BASE.twoPointRate +
    gap * 0.0008 +
    (offMods.twoRate ?? 0) +
    (plan?.twoBias ?? 0)

  if (offenseRatings.isHome) {
    toRate -= HOME_COURT.turnoverResist
  }

  toRate -= plan?.protectBall ?? 0
  toRate = clamp(toRate, 0.05, 0.24)
  foulRate = clamp(foulRate, 0.04, 0.16)
  threeRate = clamp(threeRate, 0.12, 0.48)
  twoRate = clamp(twoRate, 0.2, 0.55)

  // Renormaliza se soma estourar
  const shotSum = threeRate + twoRate
  if (shotSum > 0.72) {
    const scale = 0.72 / shotSum
    threeRate *= scale
    twoRate *= scale
  }

  const makeTwo = clamp(
    0.48 + gap * 0.004 + (offMods.makeTwo ?? 0),
    0.3,
    0.72,
  )
  const makeThree = clamp(
    0.34 + gap * 0.0035 + (offMods.makeThree ?? 0),
    0.2,
    0.52,
  )
  const ftMake = clamp(0.72 + gap * 0.002, 0.55, 0.9)
  const orbRate = clamp(
    0.28 + gap * 0.002 + (offMods.orbRate ?? 0),
    0.15,
    0.45,
  )
  const stealShare = clamp(0.55 + (defMods.stealChance ?? 0), 0.4, 0.75)
  const assistChance = clamp(
    0.5 + (offMods.assistChance ?? 0) + (plan?.aggression ?? 1) * 0.05,
    0.35,
    0.75,
  )

  const roll = rng()
  const styleId = offStyle.id

  if (roll < toRate) {
    const stealer = pickPlayer(defensePlayers, rng, (p) => p.defesa?.roubo ?? p.overall)
    const culprit = pickPlayer(offensePlayers, rng, (p) => 100 - (p.qi?.tomadaDecisao ?? 50))
    const isSteal = rng() < stealShare
    return {
      outcome: isSteal ? 'steal' : 'turnover',
      points: 0,
      stealerId: isSteal ? stealer?.id : undefined,
      turnoversById: culprit?.id,
      styleId,
    }
  }

  if (roll < toRate + foulRate) {
    const shooter = pickPlayer(offensePlayers, rng, shooterBias(styleId))
    const fouler = pickPlayer(defensePlayers, rng, (p) => p.defesa?.perimetro ?? p.overall)
    const isThree = rng() < threeRate / Math.max(0.01, threeRate + twoRate)
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
      styleId,
    }
  }

  if (roll < toRate + foulRate + threeRate) {
    const shooter = pickPlayer(offensePlayers, rng, shooterBias(styleId))
    const assister =
      rng() < assistChance
        ? pickPlayer(
            offensePlayers.filter((p) => p.id !== shooter?.id),
            rng,
            (p) => p.qi?.passe ?? p.overall,
          )
        : null

    if (rng() < clamp(0.04 + (def - atk) * 0.001 + (defMods.defense ?? 0) * 0.002, 0.02, 0.12)) {
      const blocker = pickPlayer(defensePlayers, rng, (p) => p.defesa?.toco ?? p.overall)
      return {
        outcome: 'block',
        points: 0,
        blockerId: blocker?.id,
        scorerId: shooter?.id,
        isThree: true,
        styleId,
      }
    }

    if (rng() < makeThree) {
      return {
        outcome: 'make3',
        points: 3,
        scorerId: shooter?.id,
        assisterId: assister?.id,
        isThree: true,
        styleId,
      }
    }

    const offenseBoard = rng() < orbRate
    const rebounder = pickPlayer(
      offenseBoard ? offensePlayers : defensePlayers,
      rng,
      (p) => (p.fisico?.impulsao ?? 60) + (p.fisico?.forca ?? 60),
    )
    return {
      outcome: offenseBoard ? 'orb' : 'drb',
      points: 0,
      rebounderId: rebounder?.id,
      isThree: true,
      styleId,
    }
  }

  {
    const shooter = pickPlayer(offensePlayers, rng, shooterBias(styleId))
    const assister =
      rng() < assistChance
        ? pickPlayer(
            offensePlayers.filter((p) => p.id !== shooter?.id),
            rng,
            (p) => p.qi?.passe ?? p.overall,
          )
        : null

    if (rng() < clamp(0.05 + (def - atk) * 0.0012 + (defMods.defense ?? 0) * 0.002, 0.02, 0.14)) {
      const blocker = pickPlayer(defensePlayers, rng, (p) => p.defesa?.toco ?? p.overall)
      return {
        outcome: 'block',
        points: 0,
        blockerId: blocker?.id,
        scorerId: shooter?.id,
        isThree: false,
        styleId,
      }
    }

    if (rng() < makeTwo) {
      return {
        outcome: 'make2',
        points: 2,
        scorerId: shooter?.id,
        assisterId: assister?.id,
        isThree: false,
        styleId,
      }
    }

    const offenseBoard = rng() < orbRate
    const rebounder = pickPlayer(
      offenseBoard ? offensePlayers : defensePlayers,
      rng,
      (p) => (p.fisico?.impulsao ?? 60) + (p.fisico?.forca ?? 60),
    )
    return {
      outcome: offenseBoard ? 'orb' : 'drb',
      points: 0,
      rebounderId: rebounder?.id,
      isThree: false,
      styleId,
    }
  }
}
