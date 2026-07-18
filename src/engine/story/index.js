/**
 * Story Engine — narrativas procedurais em cadeias.
 *
 * Substitui eventos fixos. Gera histórias dinamicamente a partir de:
 * Relacionamentos · Personalidade · Popularidade · Desempenho ·
 * Time · Cidade · Patrocínios · Treinador · Companheiros · Liga
 *
 * Cada história: Título · Descrição · Contexto · Escolhas ·
 * Consequências · Continuação futura.
 *
 * Decisões anteriores (flags + cadeias) influenciam eventos futuros.
 */

export {
  STORY_THEMES,
  STORY_THEME_IDS,
  STORY_BASE_CHANCE,
  STORY_SEEDS,
} from '../../data/story'

export { createStoryState, createChainRecord } from './state.js'
export { gatherStoryContext, fillPattern } from './context.js'
export {
  getFlag,
  applyFlagDeltas,
  listOpenChains,
  findDueChain,
  scoreSeedAgainstMemory,
} from './memory.js'
export {
  generateStory,
  composeStoryFromSeed,
  summarizeStoryForUi,
} from './generate.js'
export { triggerStory } from './trigger.js'
export { resolveStoryChoice } from './resolve.js'
export { getStoryView } from './view.js'
