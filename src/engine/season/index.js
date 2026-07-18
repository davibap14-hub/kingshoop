/**
 * Season Engine — API pública.
 *
 * Controla a temporada da liga: calendário, classificação, W-L,
 * sequências, lesões, simulação dos outros jogos, Play-In, Playoffs,
 * Finais e premiações.
 *
 * Ao final de cada semana: processWeeklySeason(state) → atualiza a liga.
 * A Interface apenas exibe os dados retornados.
 */

export {
  SEASON_PHASES,
  SEASON_CALENDAR,
  CONFERENCES,
  AWARD_LABELS,
} from '../../data/season/constants'

export {
  createSeasonState,
  resetSeasonState,
  syncPhase,
  getSeasonView,
} from './state'

export {
  generateSeasonSchedule,
  getWeekSlot,
  phaseForWeek,
  findTeamNextGame,
} from './schedule'

export {
  createInitialStandings,
  applyGameToStandings,
  sortConference,
  getConferenceTables,
  getTeamRecord,
} from './standings'

export { simulateGames } from './simulate'
/** Lesões da liga: ver Injury Engine (`processLeagueInjuries`). */
export { processLeagueInjuries, injuryFatigueForTeam } from '../injuries'
export {
  buildPlayInGames,
  resolvePlayInBrackets,
  conferenceFinalsFromPlayIn,
  buildFinalsGame,
} from './playoffs'
export { computeSeasonAwards, awardsMessages } from './awards'
export { processWeeklySeason } from './weekly'
