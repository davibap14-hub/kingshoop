/**
 * Expansion Engine — expansão da liga após N temporadas.
 * Novas franquias · Expansion Draft · calendário · identidade · uniformes · arenas.
 * Integra Season · GM · Draft · History · News · Save. Sem Interface.
 */

export {
  EXPANSION_AFTER_SEASONS,
  EXPANSION_PROTECT_COUNT,
  EXPANSION_ROSTER_TARGET,
  EXPANSION_FRANCHISES,
} from '../../data/expansion'

export {
  createExpansionState,
  hydrateExpansionState,
  shouldExpandLeague,
  pendingExpansionFranchises,
  markExpanded,
} from './state.js'

export {
  buildProtectedSets,
  runExpansionDraft,
} from './draft.js'

export { ensureGmForActiveLeague } from './ensure.js'

export {
  applyLeagueExpansion,
  listExpansionCatalog,
} from './apply.js'
