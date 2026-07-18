import { tendency } from '../simulation/weights'

/**
 * Lê a ameaça ofensiva da posse para a defesa reagir.
 * Usa handler, transição, playbook e set (se já conhecido).
 */
export function readOffensiveThreat({
  ballHandler = null,
  offensePlayers = [],
  ctx = {},
  offensiveSet = null,
} = {}) {
  const setId = offensiveSet?.id ?? null
  const playCategory = offensiveSet?.meta?.play?.category ?? null

  const driveThreat = ballHandler ? tendency(ballHandler, 'drive') : 50
  const isoThreat = ballHandler ? tendency(ballHandler, 'isolation') : 50
  const passThreat = ballHandler ? tendency(ballHandler, 'pass') : 50
  const threeThreat =
    offensePlayers.reduce((s, p) => s + tendency(p, 'shoot3'), 0) /
    Math.max(1, offensePlayers.length)
  const postThreat =
    offensePlayers.reduce((s, p) => s + tendency(p, 'postUp'), 0) /
    Math.max(1, offensePlayers.length)

  let likelySet = setId
  if (!likelySet) {
    if (ctx.allowFastBreak) likelySet = 'fast_break'
    else if (driveThreat >= 70 && passThreat >= 60) likelySet = 'pick_and_roll'
    else if (isoThreat >= 68) likelySet = 'isolation'
    else if (postThreat >= 65) likelySet = 'post_up'
    else if (threeThreat >= 68) likelySet = 'cut'
    else likelySet = 'pick_and_roll'
  }

  return {
    likelySet,
    setId,
    playCategory,
    driveThreat,
    isoThreat,
    passThreat,
    threeThreat,
    postThreat,
    transition: Boolean(ctx.allowFastBreak),
    pressure: ctx.pressure ?? 50,
    scoreDiff: ctx.scoreDiff ?? 0,
    timeRemaining: ctx.timeRemaining ?? 0.5,
    quarter: ctx.quarter ?? 1,
    fatigue: ctx.fatigue ?? 30,
    importance: ctx.importance ?? 50,
  }
}
