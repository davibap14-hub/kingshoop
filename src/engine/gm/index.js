/**
 * General Manager Engine — API pública.
 *
 * Cada franquia tem personalidade (Reconstrução, Competitiva, Contender,
 * Jovem, Financeira). O GM decide automaticamente: contratações, trocas,
 * dispensas, renovações, draft e salary cap — sempre com base na situação.
 *
 * A Interface apenas exibe os dados retornados.
 */

export {
  SALARY_CAP,
  SALARY_FLOOR,
  ROSTER_SIZE_TARGET,
  GM_PERSONALITIES,
  TEAM_PERSONALITY_MAP,
} from '../../data/gm'

export {
  createGmState,
  buildInitialRosters,
  buildInitialContracts,
  assignPersonalities,
  generateDraftClass,
  appendGmLog,
  getPersonality,
} from './state'

export {
  teamPayroll,
  capSpace,
  isOverCap,
  capPressure,
  canAfford,
} from './cap'

export { analyzeFranchise, resolvePlayer } from './situation'

export {
  releasePlayer,
  signFreeAgent,
  renewContract,
  tradePlayers,
  draftProspect,
} from './actions'

export { decideForTeam, runDraft } from './decide'
export { processWeeklyGm, getGmView } from './weekly'
