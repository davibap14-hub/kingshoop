import { WEEKLY_EVENTS } from '../../data/events'
import { pickWeighted } from '../utils/math'

/**
 * Sorteia um evento semanal a partir do catálogo de dados.
 * @returns {{ id: string, type: string, text: string, effects: object }}
 */
export function rollWeeklyEvent(rng = Math.random) {
  const event = pickWeighted(WEEKLY_EVENTS, 'weight', rng)
  return {
    id: event.id,
    type: event.type,
    text: event.text,
    effects: { ...event.effects },
  }
}
