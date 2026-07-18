/**
 * News Engine — API pública.
 *
 * Toda semana gera notícias automáticas com base no que aconteceu
 * na liga: performances, lesões, trocas, MVP, críticas, rumores, etc.
 * Cada notícia tem título, resumo e impacto.
 */

export {
  NEWS_CATEGORIES,
  NEWS_CATEGORY_IDS,
  MAX_WEEKLY_NEWS,
  MAX_NEWS_FEED,
} from '../../data/news'

export { collectWeekFacts, extractPerformances } from './extract'
export {
  generateWeekNews,
  processWeeklyNews,
  createEmptyNewsState,
} from './generate'
