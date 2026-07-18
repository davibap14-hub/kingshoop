/**
 * Playbook Engine — jogadas por franquia + escolha automática na posse.
 *
 * Nunca importa React / Interface.
 */

export {
  createPlaybookEngineState,
  normalizeTeamPlaybook,
  getTeamPlaybook,
  setTeamPlaybook,
} from './state.js'

export {
  generateTeamPlaybook,
  ensureLeaguePlaybooks,
} from './generate.js'

export { scorePlaybookPlay } from './score.js'
export { decidePlaybookPlay } from './decide.js'
export { processWeeklyPlaybooks } from './weekly.js'
export { getPlaybookView } from './view.js'
