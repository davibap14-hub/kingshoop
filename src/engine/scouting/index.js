/**
 * Scouting Engine — observação de talentos (Draft + Free Agency).
 *
 * Cada prospect: potencial oculto, personalidade, tendências,
 * fraquezas e pontos fortes.
 *
 * Quanto maior o investimento, mais precisas as informações.
 * A Franchise AI consome relatórios em Draft e FA — nunca dados true crus.
 */

export {
  SCOUTING_INVESTMENT_MIN,
  SCOUTING_INVESTMENT_MAX,
  DEFAULT_SCOUTING_INVESTMENT,
  SCOUTING_MAX_ERROR,
  SCOUTING_BY_OBJECTIVE,
} from '../../data/scouting'

export {
  createScoutingState,
  getTeamInvestment,
  setTeamInvestment,
  getReport,
  setReport,
  clampInvestment,
} from './state.js'

export { analyzeTrueProfile } from './profile.js'

export {
  calcScoutConfidence,
  calcScoutError,
  buildScoutReport,
  getScoutedView,
} from './report.js'

export {
  updateTeamInvestment,
  scoutPlayersForTeam,
  processWeeklyScouting,
} from './weekly.js'

export { getScoutingView, getProspectScoutDetail } from './view.js'
