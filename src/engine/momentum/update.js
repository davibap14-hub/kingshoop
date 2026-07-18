import {
  MOMENTUM_FACTOR_DELTAS as D,
  MOMENTUM_NEUTRAL,
  MOMENTUM_REGRESSION,
  STREAK_BONUS_CAP,
  THREE_STREAK_BONUS_CAP,
  TIMEOUT_COOLDOWN_POSSESSIONS,
  TIMEOUT_MISS_STREAK,
  TIMEOUT_OPP_MAKE_STREAK,
} from '../../data/momentum/constants.js'
import { clampMomentum, createGameMomentum } from './state.js'

function pushEvent(state, text) {
  const lastEvents = [...(state.lastEvents ?? []), text].slice(-12)
  return { ...state, lastEvents }
}

function nudge(side, delta, mult = 1) {
  return {
    ...side,
    value: clampMomentum(side.value + delta * mult),
  }
}

function regress(side) {
  const toward = (MOMENTUM_NEUTRAL - side.value) * MOMENTUM_REGRESSION
  return { ...side, value: clampMomentum(side.value + toward) }
}

function isClutch(ctx) {
  return (
    (ctx.quarter >= 4 && Math.abs(ctx.scoreDiff ?? 0) <= 8) ||
    ctx.momentKey === 'q4_close'
  )
}

function detectDunk(result) {
  const style = result?.finishStyle ?? result?.shotType
  if (style === 'alley_oop' || style === 'dunk') return true
  return (result?.events ?? []).some(
    (e) =>
      e.action === 'alley_oop' ||
      e.action === 'dunk' ||
      (typeof e.text === 'string' && /alley|enterra|dunk/i.test(e.text)),
  )
}

/**
 * Atualiza momentum após uma posse — fatores psicológicos.
 */
export function updateMomentumFromPossession(state, result, ctx = {}) {
  let next = state ?? createGameMomentum()
  next = {
    ...next,
    possessionIndex: (next.possessionIndex ?? 0) + 1,
  }

  const offenseIsHome = Boolean(ctx.offenseIsHome)
  let offense = offenseIsHome ? { ...next.home } : { ...next.away }
  let defense = offenseIsHome ? { ...next.away } : { ...next.home }

  const clutch = isClutch(ctx)
  let mult = 1
  if (clutch) mult *= D.clutchMult
  if ((next.rivalry ?? 0) >= 50) {
    mult *= 1 + ((next.rivalry - 50) / 50) * (D.rivalryMult - 1)
  }

  const outcome = result?.outcome ?? ''
  const isMake =
    outcome === 'make2' ||
    outcome === 'make3' ||
    (outcome === 'shooting_foul' && (result?.points ?? 0) > 0)
  const isThree = Boolean(result?.isThree) || outcome === 'make3'
  const dunked = isMake && detectDunk(result)

  let note = null

  if (outcome === 'block') {
    defense = nudge(defense, D.block, mult)
    offense = nudge(offense, -D.block * 0.55, mult)
    defense = { ...defense, makeStreak: defense.makeStreak, missStreak: 0 }
    offense = {
      ...offense,
      makeStreak: 0,
      missStreak: offense.missStreak + 1,
      threeStreak: 0,
      runPoints: 0,
    }
    note = `Toco — momentum ${defense.isHome ? 'casa' : 'fora'}`
  } else if (outcome === 'steal') {
    defense = nudge(defense, D.steal, mult)
    offense = nudge(offense, -D.steal * 0.5, mult)
    offense = {
      ...offense,
      makeStreak: 0,
      missStreak: offense.missStreak + 1,
      threeStreak: 0,
      runPoints: 0,
    }
    note = 'Roubo eleva a defesa'
  } else if (outcome === 'turnover') {
    defense = nudge(defense, D.turnoverAgainst, mult)
    offense = nudge(offense, -D.turnoverAgainst * 0.6, mult)
    offense = {
      ...offense,
      makeStreak: 0,
      missStreak: offense.missStreak + 1,
      threeStreak: 0,
      runPoints: 0,
    }
    note = 'Turnover corta o ritmo'
  } else if (isMake) {
    let delta = D.make
    const streak = Math.min(STREAK_BONUS_CAP, offense.makeStreak)
    delta += streak * D.makeStreakBonus

    if (isThree) {
      delta += D.threeMake
      const tStreak = Math.min(THREE_STREAK_BONUS_CAP, offense.threeStreak)
      delta += tStreak * D.threeStreakBonus
    }
    if (dunked) {
      delta += D.dunk
      note = 'Enterrada / alley — explosão de momentum'
    } else if (isThree && offense.threeStreak >= 1) {
      note = `Sequência de ${offense.threeStreak + 1} bolas de três`
    } else if (offense.makeStreak >= 2) {
      note = `Sequência de ${offense.makeStreak + 1} acertos`
    } else {
      note = 'Cesta — momentum sobe'
    }

    if (offense.isHome) delta += D.crowdHome

    offense = nudge(offense, delta, mult)
    defense = nudge(defense, -delta * 0.35, mult)
    offense = {
      ...offense,
      makeStreak: offense.makeStreak + 1,
      missStreak: 0,
      threeStreak: isThree ? offense.threeStreak + 1 : 0,
      runPoints: offense.runPoints + (result?.points ?? 2),
    }
    defense = {
      ...defense,
      makeStreak: 0,
      runPoints: 0,
    }
  } else if (outcome === 'orb') {
    // Miss com ORB — erro leve, posse mantida
    let delta = D.miss * 0.65
    delta += Math.min(STREAK_BONUS_CAP, offense.missStreak) * D.missStreakPenalty * 0.5
    offense = nudge(offense, delta, mult)
    offense = {
      ...offense,
      makeStreak: 0,
      missStreak: offense.missStreak + 1,
      threeStreak: 0,
    }
    note = 'Erro — rebote ofensivo salva parcialmente'
  } else {
    // Miss / DRB / empty
    let delta = D.miss
    const streak = Math.min(STREAK_BONUS_CAP, offense.missStreak)
    delta += streak * D.missStreakPenalty
    offense = nudge(offense, delta, mult)
    defense = nudge(defense, -delta * 0.25, mult)
    offense = {
      ...offense,
      makeStreak: 0,
      missStreak: offense.missStreak + 1,
      threeStreak: 0,
      runPoints: 0,
    }
    if (offense.missStreak >= 2) {
      note = `Sequência de ${offense.missStreak} erros`
    }
  }

  offense = regress(offense)
  defense = regress(defense)

  next = {
    ...next,
    home: offenseIsHome ? offense : defense,
    away: offenseIsHome ? defense : offense,
  }
  if (note) next = pushEvent(next, note)

  return maybeCallTimeout(next, offenseIsHome)
}

/**
 * Timeout: recupera levemente o time frio e corta o run adversário.
 */
export function maybeCallTimeout(state, offenseIsHome) {
  const idx = state.possessionIndex ?? 0
  if (idx - (state.lastTimeoutPossession ?? -999) < TIMEOUT_COOLDOWN_POSSESSIONS) {
    return state
  }

  const offense = offenseIsHome ? state.home : state.away
  const defense = offenseIsHome ? state.away : state.home

  const offenseNeeds =
    offense.missStreak >= TIMEOUT_MISS_STREAK &&
    defense.makeStreak >= TIMEOUT_OPP_MAKE_STREAK
  const defenseNeeds =
    defense.missStreak >= TIMEOUT_MISS_STREAK + 1 &&
    offense.runPoints >= 6

  if (!offenseNeeds && !defenseNeeds) return state

  const benefitingOffense = offenseNeeds
  let cold = benefitingOffense ? { ...offense } : { ...defense }
  let hot = benefitingOffense ? { ...defense } : { ...offense }

  cold = nudge(cold, D.timeoutBoost, 1)
  hot = nudge(hot, D.timeoutOpponentCut, 1)
  cold = {
    ...cold,
    missStreak: 0,
    runPoints: 0,
  }
  hot = {
    ...hot,
    makeStreak: Math.max(0, hot.makeStreak - 1),
    threeStreak: Math.max(0, hot.threeStreak - 1),
    runPoints: Math.max(0, hot.runPoints - 4),
  }

  const sideKey = cold.isHome ? 'home' : 'away'
  const otherKey = cold.isHome ? 'away' : 'home'
  const timeoutCount = {
    ...state.timeoutCount,
    [sideKey]: (state.timeoutCount?.[sideKey] ?? 0) + 1,
  }

  let next = {
    ...state,
    [sideKey]: cold,
    [otherKey]: hot,
    lastTimeoutPossession: idx,
    lastTimeoutTeamId: cold.teamId,
    timeoutCount,
  }
  next = pushEvent(
    next,
    `Timeout ${cold.isHome ? 'casa' : 'fora'} — recupera confiança`,
  )
  return next
}
