/**
 * Event Engine — API pública.
 *
 * Eventos possuem: id, categoria, peso, probabilidade, condições,
 * efeitos, texto e escolhas (2–4). Cada escolha altera atributos de carreira.
 *
 * Fluxo:
 *   rollEvent(state) → evento | null
 *   resolveEventChoice(state, eventId, choiceId) → { effects, nextState }
 */

export {
  matchesConditions,
  getEventById,
  listEventsByCategory,
  listEligibleEvents,
  rollEvent,
  cloneEvent,
  getCategoryMeta,
  summarizeEventForUi,
} from './eligibility'

export { resolveEventChoice } from './resolve'

import { rollEvent, summarizeEventForUi, cloneEvent } from './eligibility'

/**
 * Tenta disparar um evento e, se houver, devolve payload para a Interface.
 * Não aplica efeitos de escolha — só efeitos base opcionais ficam pendentes.
 */
export function triggerEvent(state, context = {}, opts = {}) {
  const rng = opts.rng ?? Math.random
  const event = rollEvent(state, context, rng)

  if (!event) {
    return {
      ok: true,
      triggered: false,
      event: null,
      pendingEvent: null,
      nextState: { ...state, pendingEvent: null },
    }
  }

  const pendingEvent = summarizeEventForUi(cloneEvent(event))

  return {
    ok: true,
    triggered: true,
    event: pendingEvent,
    pendingEvent,
    nextState: {
      ...state,
      pendingEvent,
    },
  }
}
