/**
 * Visão somente leitura da Presentation Engine.
 */

import { PLAYBACK_SPEEDS } from '../../data/presentation'
import { hydratePresentationState } from './state.js'

/**
 * @param {object} state — career state ou { presentation, lastMatch presentation package }
 */
export function getPresentationView(state = {}) {
  const presentation = hydratePresentationState(state.presentation ?? null)
  const last = state.lastPresentation ?? null

  return {
    prefs: presentation.prefs,
    speeds: Object.values(PLAYBACK_SPEEDS),
    lastPresented: presentation.lastPresented,
    /** Pacote completo se a Interface guardou o último presentMatch */
    lastPresentation: last
      ? {
          scoreboard: last.scoreboard,
          highlightCount: last.highlights?.length ?? last.meta?.highlightCount,
          stepCount: last.sequence?.length ?? last.meta?.stepCount,
          meta: last.meta,
        }
      : null,
    hasSequence: Boolean(last?.sequence?.length),
  }
}
