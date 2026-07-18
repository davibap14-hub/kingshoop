/**
 * Comentários de cor — camada de apresentação sobre o PBP.
 */

import {
  COMMENTARY_BY_ACTION,
  COMMENTARY_DEFENSE,
  COMMENTARY_FINAL,
  COMMENTARY_LEAD_CHANGE,
  COMMENTARY_RUN,
  COMMENTARY_SCORE,
} from '../../data/presentation/templates.js'

function pick(arr, seed = 0) {
  if (!arr?.length) return null
  return arr[Math.abs(seed) % arr.length]
}

/**
 * Gera comentário opcional para um evento / passo.
 */
export function commentOnEvent(event, ctx = {}) {
  if (!event && !ctx.kind) return null
  const seed = ctx.seed ?? event?.seq ?? 0
  const pts = event?.points ?? 0
  const action = event?.action ?? ''
  const text = (event?.text ?? '').toLowerCase()

  if (ctx.kind === 'run') {
    return pick(COMMENTARY_RUN, seed)
  }
  if (ctx.kind === 'lead_change' || ctx.live?.leadChange) {
    return pick(COMMENTARY_LEAD_CHANGE, seed)
  }
  if (ctx.kind === 'final') {
    return pick(COMMENTARY_FINAL, seed)
  }

  if (pts === 3) {
    const clutch = ctx.live?.margin != null && ctx.live.margin <= 5
    return pick(clutch ? COMMENTARY_SCORE.clutch : COMMENTARY_SCORE.three, seed)
  }
  if (pts === 2) {
    return pick(COMMENTARY_SCORE.make2, seed)
  }

  if (text.includes('roubo') || text.includes('steal')) {
    return pick(COMMENTARY_DEFENSE.steal, seed)
  }
  if (text.includes('toco') || text.includes('block') || text.includes('rejeit')) {
    return pick(COMMENTARY_DEFENSE.block, seed)
  }
  if (text.includes('turnover') || text.includes('perda')) {
    return pick(COMMENTARY_DEFENSE.turnover, seed)
  }

  const byAction = COMMENTARY_BY_ACTION[action]
  if (byAction) return pick(byAction, seed)

  return null
}

export function commentOnHighlight(highlight) {
  return commentOnEvent(
    {
      text: highlight.text,
      action: highlight.action,
      points: highlight.points,
      seq: highlight.eventIndex,
    },
    {
      kind:
        highlight.type === 'run'
          ? 'run'
          : highlight.type === 'lead_change'
            ? 'lead_change'
            : null,
      seed: highlight.seed,
      live: { margin: highlight.score ? Math.abs(highlight.score.home - highlight.score.away) : 99, leadChange: highlight.type === 'lead_change' },
    },
  )
}
