/**
 * Save System — API pública (pura).
 *
 * Serializa/hidrata o estado de carreira. Persistência LocalStorage
 * fica no service (`saveService`).
 *
 * Salva: jogador, time, temporada, atributos, eventos, histórico,
 * estatísticas e contratos.
 */

export {
  createEmptyHistory,
  createEmptyCareerStats,
  buildWeekHistoryEntry,
  buildEventHistoryEntry,
  appendHistory,
  updateCareerStatsAfterWeek,
  updateCareerStatsAfterEvent,
} from './history'

export {
  buildSaveSnapshot,
  createSavePayload,
  buildSaveSummary,
  hydrateSaveToOverrides,
  validateSavePayload,
} from './serialize'

/** Gera id estável o bastante para slots. */
export function generateSaveId(rng = Math.random) {
  const stamp = Date.now().toString(36)
  const rand = Math.floor(rng() * 1e9).toString(36)
  return `save_${stamp}_${rand}`
}
