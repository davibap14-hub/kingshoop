/**
 * Event Engine — ponte compatível para a Story Engine procedural.
 *
 * O catálogo fixo CAREER_EVENTS não alimenta mais o fluxo semanal.
 * Histórias são geradas dinamicamente (cadeias + memória).
 */

export {
  matchesConditions,
  getEventById,
  listEventsByCategory,
  listEligibleEvents,
  rollEvent,
  cloneEvent,
  getCategoryMeta,
} from './eligibility'

export { summarizeStoryForUi as summarizeEventForUi } from '../story/generate.js'
export { resolveStoryChoice as resolveEventChoice } from '../story/resolve.js'
export { triggerStory as triggerEvent } from '../story/trigger.js'
