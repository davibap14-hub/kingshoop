/**
 * Hall of Fame Engine — votação automática na aposentadoria.
 *
 * Pontuação: Títulos · MVPs · All-Star · All-NBA · DPOY ·
 * Pontos · Assistências · Rebotes · Longevidade · Popularidade
 *
 * Classificação: Primeira votação · Hall da Fama · Não entrou
 * Persistência permanente via History Engine.
 */

export {
  HOF_CLASSIFICATION,
  HOF_SCORE_WEIGHTS,
  HOF_STAT_SCALES,
} from '../../data/hallOfFame'

export {
  gatherCredentials,
  getCareerTotals,
  emptyTotals,
} from './credentials.js'

export { calculateHofScore, normalizeStat } from './score.js'
export { classifyHofScore, isHofInducted } from './classify.js'

export {
  evaluateRetiredPlayer,
  processHallOfFameBallots,
  appendHofToHistory,
} from './evaluate.js'

export {
  accumulateCareerTotals,
  creditSeasonHonors,
} from './career.js'

export { getHallOfFameView } from './view.js'
