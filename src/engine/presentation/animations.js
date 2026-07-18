/**
 * Cues de animação para a Interface.
 * A Engine só declara o que pode animar — a UI dispara.
 */

import {
  ANIMATION_CUES,
  SEQUENCE_STEP_TYPES,
  STEP_BASE_DURATION_MS,
} from '../../data/presentation'
import { PLAYBACK_SPEEDS } from '../../data/presentation/constants.js'

/**
 * Resolve cue de animação a partir do tipo de passo + evento.
 */
export function resolveAnimationCue(stepType, event = null, ctx = {}) {
  if (stepType === SEQUENCE_STEP_TYPES.tipoff) return ANIMATION_CUES.crowd_cheer
  if (stepType === SEQUENCE_STEP_TYPES.quarter_start) {
    return ANIMATION_CUES.quarter_wipe
  }
  if (stepType === SEQUENCE_STEP_TYPES.quarter_end) {
    return ANIMATION_CUES.quarter_wipe
  }
  if (stepType === SEQUENCE_STEP_TYPES.timeout) {
    return ANIMATION_CUES.timeout_break
  }
  if (stepType === SEQUENCE_STEP_TYPES.final) return ANIMATION_CUES.final_horn
  if (stepType === SEQUENCE_STEP_TYPES.mvp) return ANIMATION_CUES.mvp_spotlight
  if (stepType === SEQUENCE_STEP_TYPES.highlight) {
    return ANIMATION_CUES.highlight_zoom
  }
  if (stepType === SEQUENCE_STEP_TYPES.run) return ANIMATION_CUES.run_banner
  if (ctx.leadChange) return ANIMATION_CUES.lead_change_flash

  const pts = event?.points ?? 0
  const text = (event?.text ?? '').toLowerCase()
  const action = event?.action ?? ''

  if (pts === 3) return ANIMATION_CUES.three_flash
  if (pts > 0) {
    return pts >= 2 && (text.includes('enterr') || action === 'alley_oop')
      ? ANIMATION_CUES.crowd_cheer
      : ANIMATION_CUES.basket_swish
  }
  if (text.includes('toco') || text.includes('rejeit') || text.includes('block')) {
    return ANIMATION_CUES.block_reject
  }
  if (text.includes('roubo') || text.includes('steal')) {
    return ANIMATION_CUES.steal_swipe
  }
  if (text.includes('turnover') || text.includes('perda')) {
    return ANIMATION_CUES.crowd_gasp
  }

  return ANIMATION_CUES.score_pulse
}

export function durationForStep(stepType, speedId = 'normal') {
  const base = STEP_BASE_DURATION_MS[stepType] ?? 800
  const speed = PLAYBACK_SPEEDS[speedId] ?? PLAYBACK_SPEEDS.normal
  if (speed.factor === 0) return 0
  return Math.round(base * speed.factor)
}

/**
 * Pacote de animação pronto para a Interface.
 */
export function buildAnimationPayload(step, speedId = 'normal') {
  return {
    cue: step.animation ?? ANIMATION_CUES.none,
    durationMs: durationForStep(step.type, speedId),
    stepId: step.id,
    order: step.order,
  }
}
