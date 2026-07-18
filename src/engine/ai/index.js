/**
 * AI Engine — API pública.
 *
 * Cada equipe tem um estilo (Fast Pace, Defensivo, 3PT, Garrafão, Transição).
 * A IA escolhe o melhor estilo pelo elenco e altera decisões da Match Engine.
 */

export {
  analyzeRoster,
  scoreStyleFit,
  rankStylesForRoster,
} from './profile'

export {
  chooseBestStyle,
  decidePossessionPlan,
  resolveTeamStyle,
  chooseAiPlaystyle,
  estimateAiDifficulty,
} from './decide'

export { TEAM_STYLES, TEAM_STYLE_LIST, DEFAULT_TEAM_STYLE } from '../../data/ai/styles'
