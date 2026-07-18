/**
 * Coach Engine — técnicos com sistemas, rotação e decisões automáticas.
 *
 * Atributos: sistema ofensivo/defensivo, rotação, confiança em jovens,
 * rigor, motivação, desenvolvimento.
 *
 * Influencia: minutos, jogadas, treinos, desenvolvimento, relação com atletas.
 *
 * Decisões sempre por pesos — nunca totalmente aleatórias.
 */

export {
  COACH_ATTR_KEYS,
  COACH_ATTR_LABELS,
  PRACTICE_FOCI,
  COACH_DECISION_WEIGHTS,
  COACH_ARCHETYPES,
} from '../../data/coaches'

export {
  createCoachEngineState,
  getTeamCoach,
  setTeamCoach,
  normalizeCoach,
  clampCoachAttr,
} from './state.js'

export {
  hashString,
  generateCoachForTeam,
  ensureLeagueCoaches,
  deriveMedicalStaffFromCoach,
} from './generate.js'

export {
  decidePracticeFocus,
  decidePlayingTime,
  decideTeamStyle,
  decideRelationDelta,
  decideCoachWeek,
} from './decide.js'

export {
  buildCoachEffects,
  mergeCoachIntoRelationshipEffects,
} from './effects.js'

export { processWeeklyCoaches } from './weekly.js'
export { getCoachView } from './view.js'
