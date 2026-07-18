import { SEASON_CALENDAR, SEASON_PHASES } from '../../data/season/constants'
import { computeSeasonAwards, awardsMessages } from './awards'
import { processLeagueInjuries } from './injuries'
import {
  buildPlayInGames,
  buildFinalsGame,
  conferenceFinalsFromPlayIn,
  resolvePlayInBrackets,
} from './playoffs'
import { getWeekSlot, phaseForWeek } from './schedule'
import { simulateGames } from './simulate'
import { createSeasonState, resetSeasonState, syncPhase } from './state'

/**
 * Pipeline semanal da Season Engine.
 * Atualiza toda a liga ao final de cada semana de carreira.
 *
 * @param {object} state — career state (season, currentWeek, currentTeamId, injury…)
 * @param {object} opts
 * @param {number} opts.week — semana já avançada
 * @param {number} opts.seasonNumber
 * @param {boolean} opts.seasonRolled
 * @param {function} opts.rng
 */
export function processWeeklySeason(state, opts = {}) {
  const rng = opts.rng ?? Math.random
  const week = opts.week ?? state.currentWeek
  const seasonRolled = Boolean(opts.seasonRolled)
  const messages = []

  let season = createSeasonState(
    seasonRolled
      ? resetSeasonState(opts.seasonNumber ?? state.currentSeason)
      : (state.season ?? { seasonNumber: state.currentSeason ?? 1 }),
  )

  if (seasonRolled) {
    messages.push(
      `Season Engine: nova temporada da liga (T${season.seasonNumber}).`,
    )
  }

  season = syncPhase(season, week)
  const phase = season.phase

  // Lesões da liga (toda semana)
  const injuryTick = processLeagueInjuries(season.injuries, rng)
  season = { ...season, injuries: injuryTick.injuries }
  messages.push(...injuryTick.messages)

  const playerOpts = {
    rng,
    playerTeamId: state.currentTeamId,
    playerInjured: Boolean(state.injury),
    gm: state.gm ?? null,
    chemistryBonus: state.relationshipEffects?.chemistryBonus ?? 0,
  }

  let weekResults = []

  if (phase === SEASON_PHASES.regular) {
    const slot = getWeekSlot(season.schedule, week)
    const games = slot?.games ?? []
    if (games.length) {
      const sim = simulateGames(games, season, playerOpts)
      season = {
        ...season,
        standings: sim.standings,
        results: sim.results,
      }
      weekResults = sim.weekResults
      messages.push(`Rodada da liga (Semana ${week}):`)
      messages.push(...sim.messages)
    }
  } else if (phase === SEASON_PHASES.play_in) {
    let schedule = season.schedule.map((s) => ({
      ...s,
      games: [...(s.games ?? [])],
    }))
    const idx = schedule.findIndex((s) => s.week === week)
    let games = idx >= 0 ? schedule[idx].games : []

    if (!games.length) {
      const built = buildPlayInGames(season.standings, season.seasonNumber, week)
      games = built.games
      season = { ...season, playIn: built.brackets }
      if (idx >= 0) schedule[idx].games = games
      messages.push('Play-In: #2 vs #3 em cada conferência.')
    }

    const sim = simulateGames(games, { ...season, schedule }, playerOpts)
    const resolved = resolvePlayInBrackets(
      season.playIn,
      sim.weekResults,
      season.seasonNumber,
    )
    const cfIdx = schedule.findIndex(
      (s) => s.week === SEASON_CALENDAR.playoffsStart,
    )
    if (cfIdx >= 0) schedule[cfIdx].games = resolved.conferenceFinalGames

    season = {
      ...season,
      schedule,
      standings: sim.standings,
      results: sim.results,
      playIn: resolved.brackets,
      playoffs: {
        East: { ...(resolved.brackets.East ?? {}) },
        West: { ...(resolved.brackets.West ?? {}) },
        finals: null,
      },
    }
    weekResults = sim.weekResults
    messages.push(...sim.messages)
  } else if (phase === SEASON_PHASES.playoffs) {
    let schedule = season.schedule.map((s) => ({
      ...s,
      games: [...(s.games ?? [])],
    }))
    const idx = schedule.findIndex((s) => s.week === week)
    let games = idx >= 0 ? [...schedule[idx].games] : []

    // Garante jogos de CF se ainda não agendados
    if (!games.length && season.playIn) {
      games = conferenceFinalsFromPlayIn(
        season.playIn,
        season.seasonNumber,
        week,
      )
      if (!games.length) {
        const resolved = resolvePlayInBrackets(
          season.playIn,
          season.results,
          season.seasonNumber,
        )
        games = resolved.conferenceFinalGames.map((g) => ({ ...g, week }))
        season = {
          ...season,
          playIn: resolved.brackets,
        }
      }
      if (idx >= 0) schedule[idx].games = games
    }

    // Semanas 39–40: se já houve CF, não re-simula (bye / espera finais)
    const alreadyPlayed = games.every((g) =>
      (season.results ?? []).some((r) => r.gameId === g.id),
    )

    if (games.length && !alreadyPlayed) {
      const sim = simulateGames(games, { ...season, schedule }, playerOpts)
      const playoffs = {
        East: { ...(season.playoffs?.East ?? {}) },
        West: { ...(season.playoffs?.West ?? {}) },
        finals: season.playoffs?.finals ?? null,
      }

      for (const result of sim.weekResults) {
        const conf = result.label?.includes('East')
          ? 'East'
          : result.label?.includes('West')
            ? 'West'
            : null
        if (conf) {
          playoffs[conf] = {
            ...playoffs[conf],
            champion: result.winnerId,
            finalScore: `${result.homeShort} ${result.homeScore}–${result.awayScore} ${result.awayShort}`,
          }
        }
      }

      if (playoffs.East?.champion && playoffs.West?.champion) {
        const fIdx = schedule.findIndex(
          (s) => s.week === SEASON_CALENDAR.finalsStart,
        )
        const finalsGame = buildFinalsGame(
          playoffs,
          season.seasonNumber,
          SEASON_CALENDAR.finalsStart,
        )
        if (fIdx >= 0 && finalsGame) schedule[fIdx].games = [finalsGame]
      }

      season = {
        ...season,
        schedule,
        standings: sim.standings,
        results: sim.results,
        playoffs,
      }
      weekResults = sim.weekResults
      messages.push('Playoffs — finais de conferência:')
      messages.push(...sim.messages)
    } else {
      season = { ...season, schedule }
      messages.push('Playoffs: aguardando próxima chave / finais.')
    }
  } else if (phase === SEASON_PHASES.finals) {
    let schedule = season.schedule.map((s) => ({
      ...s,
      games: [...(s.games ?? [])],
    }))
    const idx = schedule.findIndex((s) => s.week === week)
    let games = idx >= 0 ? [...schedule[idx].games] : []

    if (!games.length) {
      const finalsGame = buildFinalsGame(
        season.playoffs,
        season.seasonNumber,
        week,
      )
      if (finalsGame) {
        games = [finalsGame]
        if (idx >= 0) schedule[idx].games = games
      }
    }

    const alreadyPlayed = games.every((g) =>
      (season.results ?? []).some((r) => r.gameId === g.id),
    )

    if (games.length && !alreadyPlayed) {
      const sim = simulateGames(games, { ...season, schedule }, playerOpts)
      const finals = sim.weekResults[0]
      const champion = finals?.winnerId ?? null
      season = {
        ...season,
        schedule,
        standings: sim.standings,
        results: sim.results,
        champion,
        playoffs: {
          ...(season.playoffs ?? {}),
          finals: finals
            ? {
                homeId: finals.homeId,
                awayId: finals.awayId,
                homeScore: finals.homeScore,
                awayScore: finals.awayScore,
                champion,
                mvp: finals.mvp,
                summary: finals.summary,
              }
            : season.playoffs?.finals,
        },
      }
      weekResults = sim.weekResults
      messages.push('Finais da NBA:')
      messages.push(...sim.messages)
      if (champion) {
        messages.push(
          `Campeão: ${finals.winnerId === finals.homeId ? finals.homeShort : finals.awayShort}!`,
        )
      }
    } else if (season.champion) {
      messages.push('Finais encerradas — campeão definido.')
    } else {
      messages.push('Finais: aguardando definição das conferências.')
    }
  } else if (phase === SEASON_PHASES.awards) {
    if (!season.awards) {
      const awards = computeSeasonAwards(season)
      season = { ...season, awards }
      messages.push(...awardsMessages(awards))
    } else {
      messages.push('Premiações já divulgadas.')
    }
  } else {
    messages.push('Offseason da liga.')
  }

  season = {
    ...season,
    phase,
    weekResults,
    lastWeek: week,
  }

  return {
    season,
    weekResults,
    phase,
    messages,
    summary: {
      week,
      seasonNumber: season.seasonNumber,
      phase,
      gamesPlayed: weekResults.length,
      standingsSnapshot: season.standings,
      weekResults,
      injuries: season.injuries,
      playIn: season.playIn,
      playoffs: season.playoffs,
      awards: season.awards,
      champion: season.champion,
    },
  }
}

export { phaseForWeek }
