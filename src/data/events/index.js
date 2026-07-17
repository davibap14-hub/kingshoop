/**
 * Camada Data — eventos de carreira.
 */

export { EVENT_CATEGORIES, EVENT_CATEGORY_IDS } from './categories'
export { EVENT_SCHEMA_VERSION } from './schema'
export {
  CAREER_EVENTS,
  CAREER_EVENT_COUNT,
  CAREER_EVENTS_BY_ID,
} from './catalog'

/** @deprecated catálogo legado curto — use CAREER_EVENTS */
export const WEEKLY_EVENTS = [
  {
    id: 'legacy_media',
    type: 'media',
    weight: 2,
    text: 'Entrevista pós-jogo aumenta a fama.',
    effects: { fama: 2 },
  },
  {
    id: 'legacy_locker',
    type: 'locker',
    weight: 2,
    text: 'Conversa no vestiário melhora a química.',
    effects: { quimica: 3 },
  },
  {
    id: 'legacy_none',
    type: 'none',
    weight: 3,
    text: 'Semana tranquila de rotina.',
    effects: {},
  },
]
