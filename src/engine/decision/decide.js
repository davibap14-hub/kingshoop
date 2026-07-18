/**
 * API central da Decision Engine — cérebro ponderado.
 */

import { contestedSelect, weightedSelect } from '../simulation/weights'

/**
 * Decide entre opções já pontuadas.
 * Usa weightedSelect (pesos) — nunca escolha uniforme aleatória.
 *
 * @param {string} decisionId
 * @param {{ id: string, score: number, mult?: number, player?: object, meta?: object }[]} options
 * @param {object} ctx
 * @param {() => number} rng
 */
export function decide(decisionId, options, ctx = {}, rng = Math.random) {
  if (!options?.length) {
    return {
      decisionId,
      choice: null,
      options: [],
      reason: 'empty',
    }
  }

  // Em alta pressão, aumenta a potência (favoritos pesam mais)
  const power =
    (ctx.pressure ?? 50) >= 75
      ? 2.35
      : (ctx.importance ?? 50) >= 80
        ? 2.25
        : undefined

  const pick = weightedSelect(options, rng, power)
  return {
    decisionId,
    choice: pick,
    player: pick?.player ?? null,
    id: pick?.id ?? null,
    meta: pick?.meta ?? null,
    options: options.map((o) => ({
      id: o.id,
      score: Math.round((o.score ?? 0) * 1000) / 1000,
    })),
    context: {
      pressure: ctx.pressure,
      fatigue: ctx.fatigue,
      momentum: ctx.momentum,
      importance: ctx.importance,
      scoreDiff: ctx.scoreDiff,
      quarter: ctx.quarter,
    },
  }
}

/**
 * Duelo ponderado A vs B (ataque vs defesa, etc.).
 */
export function decideDuel(decisionId, scoreA, scoreB, ctx = {}, rng = Math.random) {
  // Pressão estreita duelos a favor do lado mais forte
  let a = Math.max(0.05, Number(scoreA) || 0)
  let b = Math.max(0.05, Number(scoreB) || 0)
  if ((ctx.pressure ?? 50) >= 70) {
    if (a > b) a *= 1.08
    else b *= 1.08
  }
  const duel = contestedSelect(a, b, rng)
  return {
    decisionId,
    winner: duel.winner,
    scoreA: a,
    scoreB: b,
    margin: duel.margin,
    context: {
      pressure: ctx.pressure,
      importance: ctx.importance,
    },
  }
}
