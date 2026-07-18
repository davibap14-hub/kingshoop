/**
 * Estado da Presentation Engine — preferências de exibição apenas.
 * Nunca guarda resultados mutáveis da simulação como fonte da verdade.
 */

import {
  PLAYBACK_SPEEDS,
  PRESENTATION_VERSION,
} from '../../data/presentation'

export function createPresentationState(overrides = {}) {
  const speedId = overrides.prefs?.speed ?? overrides.speed ?? 'normal'
  return {
    version: overrides.version ?? PRESENTATION_VERSION,
    prefs: {
      speed: PLAYBACK_SPEEDS[speedId] ? speedId : 'normal',
      showCommentary: overrides.prefs?.showCommentary ?? true,
      showHighlights: overrides.prefs?.showHighlights ?? true,
      autoPlay: overrides.prefs?.autoPlay ?? false,
    },
    /** Metadados da última apresentação (ids / contagens — sem clonar a sim) */
    lastPresented: overrides.lastPresented ?? null,
  }
}

export function hydratePresentationState(raw = null) {
  return createPresentationState(raw ?? {})
}

export function updatePresentationPrefs(state, patch = {}) {
  const next = createPresentationState(state)
  return {
    ...next,
    prefs: {
      ...next.prefs,
      ...patch,
      speed: PLAYBACK_SPEEDS[patch.speed ?? next.prefs.speed]
        ? patch.speed ?? next.prefs.speed
        : next.prefs.speed,
    },
  }
}
