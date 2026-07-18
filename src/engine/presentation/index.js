/**
 * Presentation Engine — experiência visual sobre a Simulation Engine.
 *
 * Sem lógica de jogo. Nunca altera resultados da simulação.
 * Interpreta: sequência · destaques · narração · comentários ·
 * estatísticas em tempo real · animações (cues) · ordem de exibição.
 */

export {
  PRESENTATION_VERSION,
  PLAYBACK_SPEEDS,
  SEQUENCE_STEP_TYPES,
  HIGHLIGHT_TYPES,
  ANIMATION_CUES,
  STEP_BASE_DURATION_MS,
  MAX_HIGHLIGHTS,
} from '../../data/presentation'

export {
  createPresentationState,
  hydratePresentationState,
  updatePresentationPrefs,
} from './state.js'

export { freezeMatch } from './freeze.js'
export {
  buildLiveStatTimeline,
  buildFinalLiveStats,
  liveStatsAt,
} from './liveStats.js'
export { extractHighlights } from './highlights.js'
export { narrateEvent, narrateHighlight } from './narration.js'
export { commentOnEvent, commentOnHighlight } from './commentary.js'
export {
  resolveAnimationCue,
  durationForStep,
  buildAnimationPayload,
} from './animations.js'
export {
  buildPresentationSequence,
  buildHighlightReelOrder,
} from './sequence.js'
export {
  presentMatch,
  getPresentationStep,
  getAnimationCueAt,
} from './present.js'
export { getPresentationView } from './view.js'
