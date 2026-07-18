import { CATEGORY_EXECUTION_SET } from '../../data/playbook/constants.js'
import { dnaSetBias } from '../dna/factors.js'
import { situationBundle } from '../decision/factors.js'
import { attr, combineScore, tendency } from '../simulation/weights'

function hasBig(players = []) {
  return players.some((p) => p.posicao === 'C' || p.posicao === 'PF')
}

function hasShooter(players = []) {
  return players.some(
    (p) =>
      (p.arremesso?.tresPontos ?? 0) >= 72 || tendency(p, 'shoot3') >= 65,
  )
}

function hasCreator(players = [], handler = null) {
  const pool = handler ? [handler, ...players] : players
  return pool.some(
    (p) =>
      (p.qi?.tomadaDecisao ?? 0) >= 72 ||
      tendency(p, 'isolation') >= 60 ||
      tendency(p, 'drive') >= 65,
  )
}

function rosterFit(play, players, handler) {
  let score = 70
  if (play.needsBig && !hasBig(players)) score -= 35
  if (play.needsShooter && !hasShooter(players)) score -= 28
  if (play.needsCreator && !hasCreator(players, handler)) score -= 30
  if (play.needsBig && hasBig(players)) score += 8
  if (play.needsShooter && hasShooter(players)) score += 8
  if (play.needsCreator && hasCreator(players, handler)) score += 8
  return Math.max(5, Math.min(99, score))
}

function readingScore(play, ctx, handler) {
  const sit = situationBundle(ctx, 'offense')
  const pressure = sit.pressure ?? ctx.pressure ?? 50
  const clock = sit.clock ?? 40
  const fatigue = sit.fatigue ?? ctx.fatigue ?? 30
  const scoreHeat = sit.score ?? 50

  const map = {
    reject_or_roll: tendency(handler, 'drive') * 0.45 + tendency(handler, 'pass') * 0.35 + (100 - fatigue) * 0.2,
    drop_or_switch: attr(handler, 'qi.tomadaDecisao') * 0.5 + tendency(handler, 'pass') * 0.3 + pressure * 0.2,
    empty_side_attack: tendency(handler, 'drive') * 0.55 + tendency(handler, 'isolation') * 0.25 + (100 - fatigue) * 0.2,
    drag_secondary: (ctx.stylePace ?? 1) * 40 + tendency(handler, 'fastBreak') * 0.35 + attr(handler, 'fisico.velocidade') * 0.25,
    pop_spacing: tendency(handler, 'pass') * 0.35 + (ctx.styleThreeBias ?? 0.5) * 50 + 20,
    short_roll_decision: attr(handler, 'qi.visao') * 0.45 + tendency(handler, 'pass') * 0.35 + scoreHeat * 0.2,
    ghost_slip: attr(handler, 'qi.tomadaDecisao') * 0.4 + (ctx.styleMotion ?? 0.5) * 40 + 15,
    mismatch_iso: tendency(handler, 'isolation') * 0.55 + pressure * 0.2 + (ctx.matchup ?? 50) * 0.25,
    midrange_iso: tendency(handler, 'stepBack') * 0.35 + attr(handler, 'arremesso.midRange') * 0.4 + pressure * 0.15,
    post_mismatch: tendency(handler, 'postUp') * 0.3 + (ctx.matchup ?? 55) * 0.4 + 20,
    backdoor_window: (ctx.styleMotion ?? 0.5) * 45 + attr(handler, 'qi.visao') * 0.35 + (100 - pressure) * 0.15,
    dho_attack: tendency(handler, 'drive') * 0.4 + (ctx.styleMotion ?? 0.5) * 35 + 20,
    loop_timing: (ctx.styleMotion ?? 0.5) * 50 + attr(handler, 'qi.tomadaDecisao') * 0.3 + 15,
    split_read: (ctx.styleThreeBias ?? 0.5) * 45 + tendency(handler, 'pass') * 0.3 + 20,
    triangle_entry: tendency(handler, 'postUp') * 0.25 + attr(handler, 'qi.passe') * 0.4 + 25,
    gap_cut: (ctx.styleMotion ?? 0.5) * 40 + tendency(handler, 'pass') * 0.3 + 20,
    triangle_iso: tendency(handler, 'isolation') * 0.4 + pressure * 0.25 + 20,
    horns_ballscreen: tendency(handler, 'pass') * 0.35 + tendency(handler, 'drive') * 0.3 + 25,
    horns_flare_read: (ctx.styleThreeBias ?? 0.5) * 50 + tendency(handler, 'pass') * 0.3 + 15,
    twist_rescreen: attr(handler, 'qi.tomadaDecisao') * 0.45 + tendency(handler, 'drive') * 0.3 + 20,
    horns_clear: tendency(handler, 'isolation') * 0.45 + pressure * 0.25 + 20,
    flex_cut: (ctx.styleMotion ?? 0.5) * 45 + tendency(handler, 'pass') * 0.3 + 18,
    flex_option_read: attr(handler, 'qi.visao') * 0.4 + (ctx.styleThreeBias ?? 0.4) * 35 + 15,
    stagger_exit: (ctx.styleThreeBias ?? 0.5) * 48 + tendency(handler, 'pass') * 0.28 + 15,
    spain_backscreen: tendency(handler, 'pass') * 0.4 + attr(handler, 'qi.tomadaDecisao') * 0.35 + 20,
    spain_reject: tendency(handler, 'drive') * 0.5 + (100 - fatigue) * 0.25 + 15,
    spain_exit: (ctx.styleThreeBias ?? 0.5) * 45 + tendency(handler, 'pass') * 0.3 + 18,
    drive_kick_chain: tendency(handler, 'drive') * 0.4 + tendency(handler, 'pass') * 0.35 + (ctx.stylePace ?? 1) * 20,
    swing_dho: (ctx.styleMotion ?? 0.5) * 40 + tendency(handler, 'pass') * 0.35 + 18,
    delay_cut: attr(handler, 'qi.visao') * 0.4 + (ctx.styleMotion ?? 0.5) * 35 + 15,
    post_seal: tendency(handler, 'postUp') * 0.2 + (ctx.matchup ?? 55) * 0.35 + clock * 0.15 + 20,
    duck_in_window: attr(handler, 'qi.passe') * 0.4 + scoreHeat * 0.25 + 25,
    mid_post_read: attr(handler, 'arremesso.midRange') * 0.35 + pressure * 0.2 + 25,
    high_low_entry: attr(handler, 'qi.passe') * 0.45 + tendency(handler, 'postUp') * 0.2 + 25,
    short_corner_feed: attr(handler, 'qi.visao') * 0.4 + scoreHeat * 0.2 + 25,
    pinch_dive: tendency(handler, 'pass') * 0.35 + (ctx.styleMotion ?? 0.4) * 30 + 20,
    transition_lane: tendency(handler, 'fastBreak') * 0.5 + attr(handler, 'fisico.velocidade') * 0.35 + (ctx.stylePace ?? 1) * 15,
    early_three_window: tendency(handler, 'shoot3') * 0.45 + (ctx.styleThreeBias ?? 0.5) * 35 + 15,
    secondary_drag: tendency(handler, 'pass') * 0.3 + (ctx.stylePace ?? 1) * 35 + 20,
    pin_down_exit: (ctx.styleThreeBias ?? 0.5) * 48 + tendency(handler, 'pass') * 0.28 + 15,
    flare_space: (ctx.styleThreeBias ?? 0.5) * 50 + attr(handler, 'qi.visao') * 0.25 + 15,
    elevator_catch: (ctx.styleThreeBias ?? 0.5) * 45 + pressure * 0.2 + 20,
  }

  return Math.max(5, Math.min(99, map[play.reading] ?? 55))
}

/**
 * Pontua uma jogada do playbook para a posse atual.
 */
export function scorePlaybookPlay(play, { offensePlayers, ballHandler, ctx }) {
  const handler = ballHandler
  const sit = situationBundle(ctx, 'offense')
  const setBias = ctx.coachSetBias ?? {}
  const executionSet =
    play.executionSet ?? CATEGORY_EXECUTION_SET[play.category] ?? 'isolation'
  const coachBias = setBias[executionSet] ?? 50
  const categoryBias = ctx.playbookCategoryBias?.[play.category] ?? 55

  // Transição só com fast break liberado
  if (play.transitionOnly && !ctx.allowFastBreak) {
    return {
      id: play.id,
      play,
      executionSet,
      score: 0.01,
      mult: 1,
      blocked: true,
    }
  }

  // Relógio baixo favorece iso / sets simples
  const lateClock =
    (ctx.timeRemaining ?? 1) < 0.2 || (ctx.quarter >= 4 && (ctx.timeRemaining ?? 1) < 0.35)
  const priorityBoost = lateClock && play.category === 'isolation' ? 12 : 0

  const score = combineScore([
    { value: play.priority + priorityBoost, weight: 1.1 },
    { value: categoryBias, weight: 0.85 },
    { value: coachBias, weight: 0.9 },
    { value: rosterFit(play, offensePlayers, handler), weight: 1.05 },
    { value: readingScore(play, ctx, handler), weight: 1.0 },
    { value: dnaSetBias(handler, executionSet), weight: 0.75 },
    { value: sit.fatigue, weight: 0.55, invert: true },
    { value: ctx.matchup ?? 50, weight: 0.7 },
    { value: sit.clock, weight: 0.45 },
    { value: sit.score, weight: 0.5 },
    { value: sit.importance, weight: 0.55 },
    { value: sit.pressure, weight: play.category === 'isolation' ? 0.55 : 0.35 },
    { value: sit.momentum, weight: 0.35 },
  ])

  return {
    id: play.id,
    play,
    executionSet,
    score,
    mult: play.transitionOnly ? 1.2 : 1,
    blocked: false,
    meta: {
      positioning: play.positioning,
      reading: play.reading,
      firstOption: play.firstOption,
      secondOption: play.secondOption,
      thirdOption: play.thirdOption,
      category: play.category,
      priority: play.priority,
    },
  }
}
