/**
 * Player Profile Engine — perfil estilo NBA 2K.
 * Agrega Career · Personality · DNA · Achievements · Contract ·
 * Injury · History · Analytics · Progression · Legacy · Story.
 */

export {
  PLAYER_PROFILE_VERSION,
  PLAYER_PROFILE_LIMITS,
} from '../../data/playerProfile'

export { getPlayerProfileView } from './view.js'
export {
  buildAttributeRadar,
  buildTendencyBars,
  buildEvolutionSeries,
} from './charts.js'
export { buildCareerTimeline } from './timeline.js'
