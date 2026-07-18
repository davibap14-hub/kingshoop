/**
 * Draft Night Engine — transmissão estilo ESPN do Draft.
 * Agrega Draft · Scouting · Franchise · News. Sem React.
 */

export {
  DRAFT_NIGHT_VERSION,
  DRAFT_NIGHT_SPEEDS,
  DRAFT_NIGHT_CLOCK_MS,
  DRAFT_NIGHT_REVEAL_MS,
  DRAFT_NIGHT_NEWS_WINDOW,
  DRAFT_NIGHT_BOARD_SIZE,
} from '../../data/draftNight'

export {
  getDraftNightStatus,
  buildDraftNightLive,
  buildDraftNightReplay,
  getDraftNightFrame,
  rescaleDraftNightSpeed,
} from './build.js'

export { analyzeProspect, compareProspects } from './analysis.js'
export { buildCrowdReaction } from './crowd.js'
export { buildDraftNightNews } from './news.js'
