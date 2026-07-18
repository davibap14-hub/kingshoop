import {
  BACK_TO_BACK_LOAD,
  TRAVEL_LOAD,
} from '../../data/fatigue/constants.js'

/**
 * Analisa calendário da semana: viagem, road trip, densidade B2B.
 */
export function analyzeWeekScheduleLoad({
  season = null,
  teamId = null,
  week = 1,
} = {}) {
  if (!season?.schedule || !teamId) {
    return {
      playsThisWeek: false,
      isAway: false,
      playedLastWeek: false,
      wasAwayLastWeek: false,
      travel: 0,
      backToBack: 0,
      game: null,
    }
  }

  const thisSlot = (season.schedule ?? []).find((w) => w.week === week)
  const prevSlot = (season.schedule ?? []).find((w) => w.week === week - 1)

  const findGame = (slot) =>
    (slot?.games ?? []).find(
      (g) => g.homeId === teamId || g.awayId === teamId,
    ) ?? null

  const game = findGame(thisSlot)
  const prevGame = findGame(prevSlot)

  const playsThisWeek = Boolean(game)
  const isAway = Boolean(game && game.awayId === teamId)
  const playedLastWeek = Boolean(prevGame)
  const wasAwayLastWeek = Boolean(prevGame && prevGame.awayId === teamId)

  let travel = TRAVEL_LOAD.home
  if (isAway && wasAwayLastWeek) travel = TRAVEL_LOAD.roadTrip
  else if (isAway) travel = TRAVEL_LOAD.away
  else if (wasAwayLastWeek) travel = TRAVEL_LOAD.returnHome

  // Densidade: jogou semana passada + joga esta (e está em viagem ou carga)
  const backToBack =
    playsThisWeek && playedLastWeek
      ? isAway || wasAwayLastWeek
        ? BACK_TO_BACK_LOAD
        : Math.round(BACK_TO_BACK_LOAD * 0.55)
      : 0

  return {
    playsThisWeek,
    isAway,
    playedLastWeek,
    wasAwayLastWeek,
    travel,
    backToBack,
    game,
  }
}

/** Carga sintética de viagem/B2B para qualquer time da liga (sim). */
export function teamScheduleFatigue(season, teamId, week) {
  const load = analyzeWeekScheduleLoad({ season, teamId, week })
  return Math.min(40, load.travel + load.backToBack * 0.65)
}
