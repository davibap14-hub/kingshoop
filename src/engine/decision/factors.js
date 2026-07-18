/**
 * Fatores situacionais da Decision Engine.
 * Cada decisão combina estes pesos — nunca só RNG.
 */

import { SITUATION_FACTOR_WEIGHTS } from '../../data/decision'
import { dnaFactors } from '../dna/factors.js'
import { attr, combineScore, tendency } from '../simulation/weights'
import { personality } from './context.js'

/**
 * Score situacional compartilhado (fadiga, momentum, placar, relógio, pressão…).
 * Usado como fator adicional em toda decisão.
 */
export function situationBundle(ctx, role = 'neutral') {
  const fatiguePenalty =
    role === 'offense' || role === 'shoot' || role === 'handle'
      ? ctx.fatigue
      : ctx.fatigue * 0.6

  // Sob pressão, disciplina/confiança entram via caller; aqui o ambiente
  const clockHeat =
    ctx.quarter >= 4
      ? (1 - ctx.timeRemaining) * 100
      : (1 - ctx.timeRemaining) * 40

  const scoreHeat =
    Math.abs(ctx.scoreDiff) <= 6
      ? 70 + (ctx.quarter >= 4 ? 20 : 0)
      : Math.abs(ctx.scoreDiff) >= 15
        ? 30
        : 50

  return {
    fatigue: fatiguePenalty,
    momentum: ctx.momentum,
    score: scoreHeat,
    clock: clockHeat,
    pressure: ctx.pressure,
    importance: ctx.importance,
  }
}

/**
 * Fatores de personalidade por papel.
 */
export function personalityFactors(player, role) {
  const ego = personality(player, 'ego')
  const compete = personality(player, 'competitividade')
  const discipline = personality(player, 'disciplina')
  const temper = personality(player, 'temperamento')
  const lead = personality(player, 'lideranca')
  const confidence = personality(player, 'confianca')
  const ambition = personality(player, 'ambicao')

  switch (role) {
    case 'ball_handler':
      return combineScore([
        { value: lead, weight: 1.0 },
        { value: confidence, weight: 0.9 },
        { value: discipline, weight: 0.7 },
        { value: ego, weight: 0.35 },
      ])
    case 'isolation':
      return combineScore([
        { value: ego, weight: 1.3 },
        { value: confidence, weight: 1.0 },
        { value: compete, weight: 0.9 },
        { value: ambition, weight: 0.5 },
      ])
    case 'shoot':
      return combineScore([
        { value: confidence, weight: 1.2 },
        { value: compete, weight: 0.8 },
        { value: ego, weight: 0.6 },
        { value: temper, weight: 0.35, invert: true },
      ])
    case 'pass':
    case 'cutter':
    case 'receiver':
      return combineScore([
        { value: lead, weight: 0.7 },
        { value: discipline, weight: 0.9 },
        { value: ego, weight: 0.5, invert: true },
      ])
    case 'screen':
      return combineScore([
        { value: discipline, weight: 1.0 },
        { value: lead, weight: 0.5 },
        { value: compete, weight: 0.6 },
      ])
    case 'steal':
    case 'contest':
      return combineScore([
        { value: compete, weight: 1.1 },
        { value: temper, weight: 0.7 },
        { value: confidence, weight: 0.6 },
        { value: discipline, weight: 0.5 },
      ])
    case 'rebound':
      return combineScore([
        { value: compete, weight: 1.2 },
        { value: confidence, weight: 0.7 },
        { value: temper, weight: 0.4 },
      ])
    case 'drive':
      return combineScore([
        { value: compete, weight: 1.0 },
        { value: confidence, weight: 0.9 },
        { value: ambition, weight: 0.5 },
      ])
    default:
      return combineScore([
        { value: confidence, weight: 0.8 },
        { value: compete, weight: 0.8 },
        { value: discipline, weight: 0.6 },
      ])
  }
}

/**
 * Empacota fatores de um candidato a uma decisão.
 *
 * @param {object} p
 * @param {'ball_handler'|'cutter'|...} role
 * @param {object} ctx — decision context
 * @param {{ attrScore: number, tendencyScore: number, chemistryScore?: number, matchupScore?: number, coachScore?: number, mult?: number }} base
 */
export function scoreCandidate(p, role, ctx, base = {}) {
  const sit = situationBundle(ctx, role === 'steal' || role === 'contest' || role === 'rebound' ? 'defense' : 'offense')
  const w = SITUATION_FACTOR_WEIGHTS

  const dnaScore = dnaFactors(p, role)

  const factors = [
    { value: base.attrScore ?? p.overall ?? 70, weight: w.attributes },
    { value: base.tendencyScore ?? 50, weight: w.tendencies },
    { value: personalityFactors(p, role) * 100, weight: w.personality, scale: 100 },
    { value: dnaScore, weight: (w.dna ?? 0.9) },
    { value: base.chemistryScore ?? ctx.chemistry ?? 50, weight: w.chemistry },
    { value: base.coachScore ?? 50, weight: w.coach },
    { value: sit.fatigue, weight: w.fatigue, invert: true },
    { value: sit.momentum, weight: w.momentum },
    { value: base.matchupScore ?? 50, weight: w.matchup },
    { value: sit.score, weight: w.score },
    { value: sit.clock, weight: w.clock },
    { value: sit.pressure, weight: w.pressure },
    { value: sit.importance, weight: w.importance },
  ]

  // Sob alta pressão, disciplina/confiança já estão em personalityFactors;
  // fadiga pesa mais no fim do jogo
  if (ctx.pressure >= 70) {
    factors.push({
      value: personality(p, 'disciplina'),
      weight: 0.35,
    })
  }

  return {
    id: p.id,
    player: p,
    score: combineScore(factors),
    mult: base.mult ?? 1,
    meta: base.meta,
    breakdown: {
      attr: base.attrScore,
      tendency: base.tendencyScore,
      personality: personalityFactors(p, role),
      dna: dnaScore,
      chemistry: base.chemistryScore,
      fatigue: sit.fatigue,
      pressure: sit.pressure,
    },
  }
}

export { attr, tendency, combineScore }
