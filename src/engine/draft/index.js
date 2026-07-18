/**
 * Draft Engine — API pública.
 *
 * Gera classe anual de prospects (potencial, overall, idade, posição,
 * universidade, arquétipo, personalidade, atributos, mock draft).
 * Times escolhem automaticamente por necessidade; após o draft,
 * todos entram na liga (elenco ou free agency).
 */

export {
  DRAFT_CLASS_SIZE,
  DRAFT_MAX_PICKS_PER_TEAM,
  DRAFT_REVEAL_WEEK,
  DRAFT_RUN_WEEK_START,
  DRAFT_RUN_WEEK_END,
  DRAFT_UNIVERSITIES,
} from '../../data/draft'

export { generateDraftClass, createProspect } from './generate'
export { buildMockDraft, sortByMockRank } from './mock'
export { buildDraftOrder, expandDraftPicks } from './order'
export {
  scoreProspectForTeam,
  selectProspectForTeam,
  getDraftBoard,
} from './select'
export {
  runDraft,
  processDraft,
  enterUndraftedIntoLeague,
} from './run'
