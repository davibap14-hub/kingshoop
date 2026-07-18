/**
 * Ordem de exibição dos acontecimentos da partida.
 */

import {
  SEQUENCE_STEP_TYPES,
} from '../../data/presentation'
import { resolveAnimationCue, durationForStep } from './animations.js'
import { commentOnEvent } from './commentary.js'
import { narrateEvent, narrateHighlight } from './narration.js'
import { commentOnHighlight } from './commentary.js'

/**
 * Monta a sequência ordenada de passos de apresentação.
 */
export function buildPresentationSequence(match, {
  liveTimeline = [],
  highlights = [],
  speed = 'normal',
  showCommentary = true,
  embedHighlights = true,
} = {}) {
  const events = match?.playByPlay ?? []
  const steps = []
  let order = 0
  const push = (partial) => {
    const type = partial.type
    const step = {
      id: partial.id ?? `step_${order}`,
      order,
      type,
      narration: partial.narration ?? '',
      commentary: showCommentary ? partial.commentary ?? null : null,
      animation: partial.animation ?? resolveAnimationCue(type, partial.event, partial.ctx),
      durationMs: durationForStep(type, speed),
      liveStats: partial.liveStats ?? null,
      eventIndex: partial.eventIndex ?? null,
      event: partial.event
        ? {
            id: partial.event.id,
            seq: partial.event.seq,
            quarter: partial.event.quarter,
            clock: partial.event.clock,
            action: partial.event.action,
            actionLabel: partial.event.actionLabel,
            text: partial.event.text,
            points: partial.event.points,
            score: partial.event.score
              ? { ...partial.event.score }
              : null,
            offense: partial.event.offense,
            defense: partial.event.defense,
          }
        : null,
      highlightId: partial.highlightId ?? null,
      meta: partial.meta ?? {},
    }
    steps.push(step)
    order += 1
  }

  const homeShort = match?.placarFinal?.homeTeam?.short ?? 'HOME'
  const awayShort = match?.placarFinal?.awayTeam?.short ?? 'AWAY'

  push({
    id: 'tipoff',
    type: SEQUENCE_STEP_TYPES.tipoff,
    narration: narrateEvent(null, {
      kind: 'tipoff',
      seed: match?.possessionCount ?? 1,
    }),
    commentary: showCommentary
      ? `${homeShort} recebe ${awayShort} em casa.`
      : null,
    meta: { homeShort, awayShort },
  })

  // Index highlights by event for inline insert
  const hlByEvent = new Map()
  if (embedHighlights) {
    for (const h of highlights) {
      if (!hlByEvent.has(h.eventIndex)) hlByEvent.set(h.eventIndex, [])
      hlByEvent.get(h.eventIndex).push(h)
    }
  }

  let lastQuarter = null
  for (let i = 0; i < events.length; i += 1) {
    const event = events[i]
    const live = liveTimeline[i] ?? null
    const q = event.quarter

    if (q !== lastQuarter) {
      if (lastQuarter != null) {
        push({
          id: `qend_${lastQuarter}`,
          type: SEQUENCE_STEP_TYPES.quarter_end,
          narration: narrateEvent(event, { kind: 'quarter_end', quarter: lastQuarter }),
          liveStats: liveTimeline[i - 1] ?? live,
          meta: { quarter: lastQuarter },
        })
      }
      const isOt = q === 'OT' || q === 'ot' || (typeof q === 'number' && q > 4)
      push({
        id: `qstart_${q}`,
        type: isOt
          ? SEQUENCE_STEP_TYPES.overtime
          : SEQUENCE_STEP_TYPES.quarter_start,
        narration: narrateEvent(null, { kind: 'quarter_start', quarter: q }),
        commentary: isOt && showCommentary ? 'Prorrogação!' : null,
        liveStats: live,
        meta: { quarter: q },
      })
      lastQuarter = q
    }

    if (event.action === 'timeout') {
      push({
        id: `timeout_${i}`,
        type: SEQUENCE_STEP_TYPES.timeout,
        narration: narrateEvent(event),
        commentary: commentOnEvent(event, { seed: i }),
        eventIndex: i,
        event,
        liveStats: live,
      })
      continue
    }

    const pts = event.points ?? 0
    const stepType =
      pts > 0
        ? SEQUENCE_STEP_TYPES.scoring
        : isDefensiveEvent(event)
          ? SEQUENCE_STEP_TYPES.defensive
          : SEQUENCE_STEP_TYPES.possession

    push({
      id: `pbp_${event.id ?? i}`,
      type: stepType,
      narration: narrateEvent(event),
      commentary: commentOnEvent(event, { seed: i, live }),
      eventIndex: i,
      event,
      liveStats: live,
      ctx: { leadChange: Boolean(live?.leadChange) },
    })

    const inline = hlByEvent.get(i)
    if (inline?.length) {
      for (const h of inline) {
        push({
          id: `hl_step_${h.id}`,
          type:
            h.type === 'run'
              ? SEQUENCE_STEP_TYPES.run
              : SEQUENCE_STEP_TYPES.highlight,
          narration: narrateHighlight(h),
          commentary: commentOnHighlight(h),
          eventIndex: i,
          event,
          liveStats: live,
          highlightId: h.id,
          meta: { highlightType: h.type, intensity: h.intensity },
        })
      }
    }
  }

  if (lastQuarter != null) {
    push({
      id: `qend_${lastQuarter}_final`,
      type: SEQUENCE_STEP_TYPES.quarter_end,
      narration: narrateEvent(events[events.length - 1], {
        kind: 'quarter_end',
        quarter: lastQuarter,
      }),
      liveStats: liveTimeline[liveTimeline.length - 1] ?? null,
      meta: { quarter: lastQuarter },
    })
  }

  push({
    id: 'final',
    type: SEQUENCE_STEP_TYPES.final,
    narration: narrateEvent(null, {
      kind: 'final',
      summary: match?.summary,
    }),
    commentary: commentOnEvent(null, { kind: 'final', seed: events.length }),
    liveStats: liveTimeline[liveTimeline.length - 1] ?? null,
    meta: {
      homeScore: match?.homeScore,
      awayScore: match?.awayScore,
      overtime: match?.overtime,
    },
  })

  if (match?.mvp) {
    push({
      id: 'mvp',
      type: SEQUENCE_STEP_TYPES.mvp,
      narration: narrateEvent(null, { kind: 'mvp', mvp: match.mvp }),
      commentary: showCommentary
        ? `${match.mvp.nome} foi o melhor em quadra.`
        : null,
      meta: {
        mvpId: match.mvp.id,
        mvpName: match.mvp.nome,
      },
    })
  }

  return steps
}

function isDefensiveEvent(event) {
  const text = (event?.text ?? '').toLowerCase()
  const action = event?.action ?? ''
  if ((event?.points ?? 0) > 0) return false
  if (text.includes('roubo') || text.includes('toco') || text.includes('steal')) {
    return true
  }
  if (action === 'help_defense' || action === 'individual_defense') return true
  return false
}

/**
 * Ordem de exibição só dos destaques (reel).
 */
export function buildHighlightReelOrder(highlights = []) {
  return [...highlights]
    .sort((a, b) => a.order - b.order)
    .map((h, i) => ({
      order: i,
      highlightId: h.id,
      eventIndex: h.eventIndex,
      type: h.type,
      label: h.label,
    }))
}
