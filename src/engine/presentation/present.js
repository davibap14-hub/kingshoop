/**
 * API principal — transforma resultado da Simulation Engine em experiência visual.
 * NUNCA altera o resultado da simulação.
 */

import { freezeMatch } from './freeze.js'
import { extractHighlights } from './highlights.js'
import {
  buildFinalLiveStats,
  buildLiveStatTimeline,
} from './liveStats.js'
import {
  buildHighlightReelOrder,
  buildPresentationSequence,
} from './sequence.js'
import { createPresentationState } from './state.js'
import { buildAnimationPayload } from './animations.js'

/**
 * Interpreta um match da Simulation Engine.
 *
 * @param {object} matchResult — retorno de simulateGame (imutável para a engine)
 * @param {object} [opts]
 * @param {object} [opts.presentation] — prefs state
 * @param {boolean} [opts.embedHighlights=true]
 * @returns {object} pacote de apresentação (somente leitura)
 */
export function presentMatch(matchResult, opts = {}) {
  if (!matchResult) {
    return {
      ok: false,
      error: 'match_required',
      presentation: null,
    }
  }

  // Clone + freeze: garante que a Presentation Engine não muta a sim
  const match = freezeMatch(matchResult)
  const prefsState = createPresentationState(opts.presentation ?? {})
  const prefs = prefsState.prefs
  const speed = opts.speed ?? prefs.speed
  const showCommentary = opts.showCommentary ?? prefs.showCommentary
  const showHighlights = opts.showHighlights ?? prefs.showHighlights

  const liveTimeline = buildLiveStatTimeline(match)
  const highlights = showHighlights
    ? extractHighlights(match, liveTimeline)
    : []
  const sequence = buildPresentationSequence(match, {
    liveTimeline,
    highlights,
    speed,
    showCommentary,
    embedHighlights: opts.embedHighlights ?? true,
  })
  const displayOrder = sequence.map((s) => ({
    order: s.order,
    id: s.id,
    type: s.type,
    durationMs: s.durationMs,
    animation: s.animation,
  }))
  const animations = sequence.map((s) => buildAnimationPayload(s, speed))
  const liveStats = {
    timeline: liveTimeline,
    final: buildFinalLiveStats(match),
  }

  const scoreboard = {
    home: {
      id: match.placarFinal?.homeTeam?.id,
      short: match.placarFinal?.homeTeam?.short,
      name: match.placarFinal?.homeTeam?.name,
      score: match.homeScore,
    },
    away: {
      id: match.placarFinal?.awayTeam?.id,
      short: match.placarFinal?.awayTeam?.short,
      name: match.placarFinal?.awayTeam?.name,
      score: match.awayScore,
    },
    quarters: (match.quarters ?? []).map((q) => ({ ...q })),
    overtime: Boolean(match.overtime),
    summary: match.summary ?? '',
  }

  const package_ = {
    ok: true,
    error: null,
    /** Referência congelada — nunca mutar */
    sourceMatch: match,
    prefs: { ...prefs, speed },
    scoreboard,
    mvp: match.mvp
      ? {
          id: match.mvp.id,
          name: match.mvp.nome,
          teamId: match.mvp.teamId,
          teamShort: match.mvp.teamShort,
          line: {
            points: match.mvp.points,
            rebounds: match.mvp.rebounds,
            assists: match.mvp.assists,
            steals: match.mvp.steals,
            blocks: match.mvp.blocks,
          },
        }
      : null,
    /** Sequência completa dos eventos (ordem de exibição) */
    sequence,
    /** Ordem compacta para a Interface */
    displayOrder,
    /** Destaques */
    highlights,
    highlightReel: buildHighlightReelOrder(highlights),
    /** Narração / comentários já embutidos nos passos */
    narration: sequence.map((s) => ({
      stepId: s.id,
      order: s.order,
      text: s.narration,
    })),
    commentary: sequence
      .filter((s) => s.commentary)
      .map((s) => ({
        stepId: s.id,
        order: s.order,
        text: s.commentary,
      })),
    /** Stats em tempo real */
    liveStats,
    /** Cues de animação para a Interface disparar */
    animations,
    boxScore: match.boxScore
      ? {
          home: match.boxScore.home,
          away: match.boxScore.away,
        }
      : null,
    styles: match.styles ?? null,
    momentum: match.momentum ?? null,
    meta: {
      possessionCount: match.possessionCount ?? 0,
      eventCount: (match.playByPlay ?? []).length,
      stepCount: sequence.length,
      highlightCount: highlights.length,
      presentedAt: Date.now(),
    },
  }

  return {
    ok: true,
    error: null,
    presentation: package_,
    /** Metadados leves para persistir em state.presentation.lastPresented */
    lastPresented: {
      homeShort: scoreboard.home.short,
      awayShort: scoreboard.away.short,
      homeScore: scoreboard.home.score,
      awayScore: scoreboard.away.score,
      eventCount: package_.meta.eventCount,
      highlightCount: package_.meta.highlightCount,
      stepCount: package_.meta.stepCount,
      at: package_.meta.presentedAt,
    },
  }
}

/**
 * Avança um passo na sequência (controle de UI — puro).
 */
export function getPresentationStep(presentation, stepIndex = 0) {
  const seq = presentation?.sequence ?? []
  if (!seq.length) return null
  const idx = Math.max(0, Math.min(stepIndex, seq.length - 1))
  return seq[idx]
}

/**
 * Lista cues de animação a partir do índice atual (para a Interface).
 */
export function getAnimationCueAt(presentation, stepIndex = 0) {
  const step = getPresentationStep(presentation, stepIndex)
  if (!step) return null
  return buildAnimationPayload(step, presentation?.prefs?.speed ?? 'normal')
}
