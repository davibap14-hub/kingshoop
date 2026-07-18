/**
 * Constantes da Live Match Engine — reprodução do Play-by-Play.
 */

export const LIVE_MATCH_VERSION = 1

/** Velocidades de replay (ms base por evento) */
export const LIVE_PLAYBACK_SPEEDS = {
  slow: { id: 'slow', label: 'Lenta', factor: 1.75 },
  normal: { id: 'normal', label: 'Normal', factor: 1 },
  fast: { id: 'fast', label: 'Rápida', factor: 0.5 },
  blaze: { id: 'blaze', label: 'Blitz', factor: 0.22 },
}

export const LIVE_BASE_DURATION_MS = {
  tipoff: 900,
  scoring: 1100,
  assist: 1000,
  foul: 900,
  timeout: 1200,
  defensive: 750,
  possession: 650,
  quarter: 800,
  final: 1400,
}

/** Quantas jogadas recentes mostrar na fita */
export const LIVE_PLAY_FEED_WINDOW = 8
