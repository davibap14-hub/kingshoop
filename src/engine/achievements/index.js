/**
 * Achievement Engine — conquistas com progresso e recompensas.
 *
 * Categorias: Carreira · Temporada · Partida · Financeiro ·
 * Relacionamentos · Títulos · Estatísticas · Colecionáveis
 *
 * Cada conquista: ID · Nome · Descrição · Categoria · Recompensa ·
 * Status · Progresso — persistido via Save Engine.
 */

export {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_CATEGORY_IDS,
  ACHIEVEMENT_STATUS,
  ACHIEVEMENT_STATUS_LABEL,
  ACHIEVEMENTS,
  ACHIEVEMENT_COUNT,
  ACHIEVEMENTS_BY_ID,
} from '../../data/achievements'

export { createAchievementsState } from './state.js'
export {
  buildAchievementMetrics,
  updateAchievementCounters,
} from './metrics.js'
export {
  evaluateAchievements,
  getAchievementProgress,
} from './evaluate.js'
export { applyAchievementRewards } from './rewards.js'
export {
  processWeeklyAchievements,
  processAchievementCheck,
} from './weekly.js'
export { getAchievementsView } from './view.js'
