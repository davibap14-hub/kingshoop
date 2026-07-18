/**
 * Narração textual — interpreta eventos da simulação sem alterá-los.
 */

import { NARRATION_OPENERS } from '../../data/presentation/templates.js'

function pick(arr, seed = 0) {
  if (!arr?.length) return ''
  return arr[Math.abs(seed) % arr.length]
}

/**
 * Narração principal de um evento PBP (usa text da sim + envelope).
 */
export function narrateEvent(event, ctx = {}) {
  const base = event?.text?.trim() || event?.actionLabel || ''
  const score =
    event?.score != null
      ? ` Placar ${event.score.home}–${event.score.away}.`
      : ''

  if (ctx.kind === 'tipoff') {
    return pick(NARRATION_OPENERS, ctx.seed ?? 0)
  }
  if (ctx.kind === 'quarter_start') {
    return `Início do ${formatPeriod(ctx.quarter)}.`
  }
  if (ctx.kind === 'quarter_end') {
    return `Fim do ${formatPeriod(ctx.quarter)}.${score}`
  }
  if (ctx.kind === 'final') {
    return ctx.summary ?? `Partida encerrada.${score}`
  }
  if (ctx.kind === 'mvp') {
    const mvp = ctx.mvp
    return mvp
      ? `MVP da partida: ${mvp.nome} (${mvp.teamShort}) com ${mvp.points} pontos, ${mvp.rebounds} rebotes e ${mvp.assists} assistências.`
      : 'MVP indefinido.'
  }

  if (!base) return 'Jogada em andamento.'
  if ((event?.points ?? 0) > 0) {
    return `${base}${score}`
  }
  return base
}

export function narrateHighlight(highlight) {
  const label = highlight.label ?? highlight.type
  const score = highlight.score
    ? ` (${highlight.score.home}–${highlight.score.away})`
    : ''
  return `Destaque — ${label}: ${highlight.text}${score}`
}

function formatPeriod(quarter) {
  if (quarter === 'OT' || quarter === 'ot') return 'prorrogação'
  if (typeof quarter === 'number') return `${quarter}º quarto`
  return String(quarter ?? 'período')
}
