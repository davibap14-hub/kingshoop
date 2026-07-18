/**
 * Constantes da Presentation Engine.
 * Sem lógica de jogo — só metadados de exibição.
 */

export const PRESENTATION_VERSION = 1

/** Velocidades de reprodução (Interface) */
export const PLAYBACK_SPEEDS = {
  slow: { id: 'slow', label: 'Lenta', factor: 1.6 },
  normal: { id: 'normal', label: 'Normal', factor: 1 },
  fast: { id: 'fast', label: 'Rápida', factor: 0.55 },
  instant: { id: 'instant', label: 'Instantânea', factor: 0 },
}

/** Tipos de passo na sequência de exibição */
export const SEQUENCE_STEP_TYPES = {
  tipoff: 'tipoff',
  quarter_start: 'quarter_start',
  possession: 'possession',
  scoring: 'scoring',
  defensive: 'defensive',
  highlight: 'highlight',
  run: 'run',
  timeout: 'timeout',
  quarter_end: 'quarter_end',
  overtime: 'overtime',
  final: 'final',
  mvp: 'mvp',
}

/** Tipos de destaque */
export const HIGHLIGHT_TYPES = {
  scoring_burst: 'scoring_burst',
  and_one: 'and_one',
  block: 'block',
  steal: 'steal',
  alley_oop: 'alley_oop',
  three: 'three',
  fast_break: 'fast_break',
  clutch: 'clutch',
  run: 'run',
  dunk_style: 'dunk_style',
  mvp_moment: 'mvp_moment',
  lead_change: 'lead_change',
  blowout: 'blowout',
}

/** Animações que a Interface pode disparar (cues, não CSS) */
export const ANIMATION_CUES = {
  score_pulse: 'score_pulse',
  basket_swish: 'basket_swish',
  three_flash: 'three_flash',
  block_reject: 'block_reject',
  steal_swipe: 'steal_swipe',
  crowd_cheer: 'crowd_cheer',
  crowd_gasp: 'crowd_gasp',
  run_banner: 'run_banner',
  highlight_zoom: 'highlight_zoom',
  quarter_wipe: 'quarter_wipe',
  final_horn: 'final_horn',
  mvp_spotlight: 'mvp_spotlight',
  lead_change_flash: 'lead_change_flash',
  timeout_break: 'timeout_break',
  none: 'none',
}

/** Duração base (ms) por tipo de passo — Interface multiplica por speed factor */
export const STEP_BASE_DURATION_MS = {
  tipoff: 1200,
  quarter_start: 900,
  possession: 700,
  scoring: 1100,
  defensive: 850,
  highlight: 1600,
  run: 1400,
  timeout: 1000,
  quarter_end: 1100,
  overtime: 1300,
  final: 1800,
  mvp: 2000,
}

/** Máximo de highlights na reel principal */
export const MAX_HIGHLIGHTS = 12

/** Sequência de pontos para considerar "parcial" (run) */
export const RUN_THRESHOLD_POINTS = 8
export const RUN_WINDOW_EVENTS = 12
