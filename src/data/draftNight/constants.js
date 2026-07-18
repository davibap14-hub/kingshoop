/**
 * Constantes da Draft Night Engine — transmissão estilo ESPN.
 */

export const DRAFT_NIGHT_VERSION = 1

/** Velocidades da transmissão (ms base no relógio / entre picks) */
export const DRAFT_NIGHT_SPEEDS = {
  slow: { id: 'slow', label: 'Lenta', factor: 1.6 },
  normal: { id: 'normal', label: 'Normal', factor: 1 },
  fast: { id: 'fast', label: 'Rápida', factor: 0.55 },
  blaze: { id: 'blaze', label: 'Blitz', factor: 0.28 },
}

/** Duração base do relógio da escolha (antes do fator de velocidade) */
export const DRAFT_NIGHT_CLOCK_MS = 8200

/** Pausa após anúncio da escolha */
export const DRAFT_NIGHT_REVEAL_MS = 2400

/** Itens no ticker de notícias */
export const DRAFT_NIGHT_NEWS_WINDOW = 8

/** Prospects na board “disponíveis” */
export const DRAFT_NIGHT_BOARD_SIZE = 10
