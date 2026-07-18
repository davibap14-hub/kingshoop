/**
 * Simulação — wrappers de eventos (compat).
 * Prefira a API de `engine/events`.
 */

export {
  rollEvent as rollCareerEvent,
  triggerEvent,
  resolveEventChoice,
  listEligibleEvents,
} from '../events'

import { rollEvent } from '../events'

/** @deprecated use rollEvent / triggerEvent */
export function rollWeeklyEvent(rng = Math.random) {
  const event = rollEvent(
    {
      status: {
        energia: 80,
        motivacao: 70,
        popularidade: 40,
        relTreinador: 50,
        relCompanheiros: 50,
      },
      currentWeek: 1,
      injury: null,
    },
    {},
    rng,
  )

  if (!event) {
    return { id: 'none', type: 'none', text: 'Semana sem evento.', effects: {} }
  }

  return {
    id: event.id,
    type: event.categoria,
    text: event.texto,
    effects: { ...(event.efeitos ?? {}) },
    escolhas: event.escolhas,
  }
}
