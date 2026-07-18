/**
 * Extrai destaques a partir do Play-by-Play — sem alterar a simulação.
 */

import {
  HIGHLIGHT_TYPES,
  MAX_HIGHLIGHTS,
  RUN_THRESHOLD_POINTS,
  RUN_WINDOW_EVENTS,
} from '../../data/presentation'
import { HIGHLIGHT_LABELS } from '../../data/presentation/templates.js'

function pick(arr, seed = 0) {
  if (!arr?.length) return ''
  return arr[Math.abs(seed) % arr.length]
}

/**
 * @param {object} match — resultado congelado da Simulation Engine
 * @param {object[]} liveTimeline
 */
export function extractHighlights(match, liveTimeline = []) {
  const events = match?.playByPlay ?? []
  const highlights = []
  let runHome = 0
  let runAway = 0
  let windowStart = 0

  for (let i = 0; i < events.length; i += 1) {
    const e = events[i]
    const live = liveTimeline[i]
    const pts = e.points ?? 0
    const action = e.action ?? ''
    const text = (e.text ?? '').toLowerCase()

    // Parcial (run)
    if (pts > 0) {
      const offenseIsHome =
        e.offense === match?.placarFinal?.homeTeam?.short ||
        e.offense === match?.placarFinal?.homeTeam?.id
      if (offenseIsHome) {
        runHome += pts
        runAway = 0
      } else {
        runAway += pts
        runHome = 0
      }
      if (i - windowStart > RUN_WINDOW_EVENTS) {
        windowStart = i
      }
      if (runHome >= RUN_THRESHOLD_POINTS || runAway >= RUN_THRESHOLD_POINTS) {
        const team = runHome >= RUN_THRESHOLD_POINTS ? 'home' : 'away'
        const value = Math.max(runHome, runAway)
        highlights.push(
          makeHighlight({
            type: HIGHLIGHT_TYPES.run,
            eventIndex: i,
            event: e,
            live,
            intensity: Math.min(5, 2 + Math.floor(value / 4)),
            meta: { team, points: value },
          }),
        )
        runHome = 0
        runAway = 0
      }
    }

    if (pts === 3) {
      highlights.push(
        makeHighlight({
          type: HIGHLIGHT_TYPES.three,
          eventIndex: i,
          event: e,
          live,
          intensity: live?.margin <= 5 ? 4 : 3,
        }),
      )
    }

    if (action === 'alley_oop' || text.includes('alley')) {
      highlights.push(
        makeHighlight({
          type: HIGHLIGHT_TYPES.alley_oop,
          eventIndex: i,
          event: e,
          live,
          intensity: 4,
        }),
      )
    }

    if (action === 'fast_break' && pts > 0) {
      highlights.push(
        makeHighlight({
          type: HIGHLIGHT_TYPES.fast_break,
          eventIndex: i,
          event: e,
          live,
          intensity: 3,
        }),
      )
    }

    if (
      text.includes('toco') ||
      text.includes('rejeit') ||
      text.includes('block')
    ) {
      highlights.push(
        makeHighlight({
          type: HIGHLIGHT_TYPES.block,
          eventIndex: i,
          event: e,
          live,
          intensity: 4,
        }),
      )
    }

    if (text.includes('roubo') || text.includes('steal')) {
      highlights.push(
        makeHighlight({
          type: HIGHLIGHT_TYPES.steal,
          eventIndex: i,
          event: e,
          live,
          intensity: 3,
        }),
      )
    }

    if (live?.leadChange && pts > 0) {
      highlights.push(
        makeHighlight({
          type: HIGHLIGHT_TYPES.lead_change,
          eventIndex: i,
          event: e,
          live,
          intensity: 5,
        }),
      )
    }

    // Clutch: Q4/OT, placar apertado, cesta
    const q = e.quarter
    const late = q === 4 || q === 'OT' || q === 'ot' || (typeof q === 'number' && q > 4)
    if (late && pts > 0 && (live?.margin ?? 99) <= 6) {
      highlights.push(
        makeHighlight({
          type: HIGHLIGHT_TYPES.clutch,
          eventIndex: i,
          event: e,
          live,
          intensity: 5,
        }),
      )
    }

    if (pts >= 2 && (text.includes('enterr') || text.includes('dunk'))) {
      highlights.push(
        makeHighlight({
          type: HIGHLIGHT_TYPES.dunk_style,
          eventIndex: i,
          event: e,
          live,
          intensity: 3,
        }),
      )
    }
  }

  // Blowout no final
  const finalHome = match?.homeScore ?? 0
  const finalAway = match?.awayScore ?? 0
  const finalMargin = Math.abs(finalHome - finalAway)
  if (finalMargin >= 18 && events.length) {
    highlights.push(
      makeHighlight({
        type: HIGHLIGHT_TYPES.blowout,
        eventIndex: events.length - 1,
        event: events[events.length - 1],
        live: liveTimeline[liveTimeline.length - 1],
        intensity: 3,
        meta: { margin: finalMargin },
      }),
    )
  }

  // MVP moment — melhor linha do MVP no PBP (maior pontos num evento dele)
  if (match?.mvp?.nome) {
    const name = match.mvp.nome
    let bestIdx = -1
    let bestPts = 0
    for (let i = 0; i < events.length; i += 1) {
      const e = events[i]
      if ((e.points ?? 0) > bestPts && (e.text ?? '').includes(name)) {
        bestPts = e.points
        bestIdx = i
      }
    }
    if (bestIdx >= 0) {
      highlights.push(
        makeHighlight({
          type: HIGHLIGHT_TYPES.mvp_moment,
          eventIndex: bestIdx,
          event: events[bestIdx],
          live: liveTimeline[bestIdx],
          intensity: 4,
          meta: { playerName: name },
        }),
      )
    }
  }

  // Dedup por eventIndex+type, ordena por intensidade, corta
  const seen = new Set()
  const unique = []
  for (const h of highlights) {
    const id = `${h.type}:${h.eventIndex}`
    if (seen.has(id)) continue
    seen.add(id)
    unique.push(h)
  }

  unique.sort((a, b) => b.intensity - a.intensity || a.eventIndex - b.eventIndex)
  return unique.slice(0, MAX_HIGHLIGHTS).map((h, order) => ({
    ...h,
    order,
    label: HIGHLIGHT_LABELS[h.type] ?? h.type,
  }))
}

function makeHighlight({ type, eventIndex, event, live, intensity, meta = {} }) {
  return {
    id: `hl_${type}_${eventIndex}`,
    type,
    eventIndex,
    intensity: intensity ?? 3,
    quarter: event?.quarter,
    clock: event?.clock,
    text: event?.text ?? '',
    action: event?.action,
    points: event?.points ?? 0,
    score: event?.score ? { ...event.score } : live?.score ?? null,
    meta,
    seed: eventIndex + (event?.seq ?? 0),
  }
}

export { pick }
