import { SEASON_CALENDAR, SEASON_PHASES } from '../../data/season/constants'
import { getConferenceTables } from './standings'

/**
 * Monta jogos de Play-In: #2 vs #3 de cada conferência.
 * Vencedor enfrenta #1 nas finais de conferência.
 */
export function buildPlayInGames(standings, seasonNumber, week) {
  const tables = getConferenceTables(standings)
  const games = []
  const brackets = { East: null, West: null }

  for (const conf of ['East', 'West']) {
    const rows = tables[conf] ?? []
    const seed1 = rows[0]
    const seed2 = rows[1]
    const seed3 = rows[2]
    if (!seed1 || !seed2 || !seed3) continue

    const game = {
      id: `S${seasonNumber}-PI-${conf}`,
      week,
      phase: SEASON_PHASES.play_in,
      homeId: seed2.teamId,
      awayId: seed3.teamId,
      label: `Play-In ${conf}`,
      conference: conf,
      meta: { seedHome: 2, seedAway: 3, byeTeamId: seed1.teamId },
    }
    games.push(game)
    brackets[conf] = {
      seed1: seed1.teamId,
      playIn: game,
      finalist: null,
    }
  }

  return { games, brackets }
}

/**
 * Após Play-In: define finalistas e agenda finais de conferência.
 */
export function resolvePlayInBrackets(playIn, weekResults, seasonNumber) {
  const brackets = {
    East: { ...(playIn?.East ?? {}) },
    West: { ...(playIn?.West ?? {}) },
  }
  const games = []

  for (const conf of ['East', 'West']) {
    const b = brackets[conf]
    if (!b?.seed1) continue
    const result = weekResults.find((r) => r.gameId === b.playIn?.id)
    const finalist = result?.winnerId ?? b.finalist ?? b.playIn?.homeId
    brackets[conf] = { ...b, finalist }

    games.push({
      id: `S${seasonNumber}-CF-${conf}`,
      week: SEASON_CALENDAR.playoffsStart,
      phase: SEASON_PHASES.playoffs,
      homeId: b.seed1,
      awayId: finalist,
      label: `Finais de Conferência — ${conf}`,
      conference: conf,
    })
  }

  return { brackets, conferenceFinalGames: games }
}

/**
 * Usa brackets de Play-In já resolvidos para montar finais de conferência.
 */
export function conferenceFinalsFromPlayIn(playIn, seasonNumber, week) {
  const games = []
  for (const conf of ['East', 'West']) {
    const b = playIn?.[conf]
    if (!b?.seed1 || !b?.finalist) continue
    games.push({
      id: `S${seasonNumber}-CF-${conf}`,
      week,
      phase: SEASON_PHASES.playoffs,
      homeId: b.seed1,
      awayId: b.finalist,
      label: `Finais de Conferência — ${conf}`,
      conference: conf,
    })
  }
  return games
}

/**
 * Agenda NBA Finals a partir dos campeões de conferência.
 */
export function buildFinalsGame(playoffs, seasonNumber, week) {
  const eastChamp = playoffs?.East?.champion
  const westChamp = playoffs?.West?.champion
  if (!eastChamp || !westChamp) return null

  return {
    id: `S${seasonNumber}-FINALS`,
    week,
    phase: SEASON_PHASES.finals,
    homeId: eastChamp,
    awayId: westChamp,
    label: 'Finais da NBA',
  }
}
