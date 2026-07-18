/**
 * Constantes do Save System.
 */

export const SAVE_VERSION = 19

/** Prefixo LocalStorage */
export const SAVE_STORAGE_PREFIX = 'fenomeno_nba'

export const SAVE_INDEX_KEY = `${SAVE_STORAGE_PREFIX}_index`
export const SAVE_ACTIVE_KEY = `${SAVE_STORAGE_PREFIX}_active`
export const SAVE_SLOT_KEY = (id) => `${SAVE_STORAGE_PREFIX}_slot_${id}`

/** Máximo de saves manuais + autosave */
export const MAX_SAVE_SLOTS = 12

/** Tamanho máximo do histórico em entradas */
export const MAX_HISTORY_ENTRIES = 120

export const DEFAULT_SAVE_NAME = 'Carreira Principal'
