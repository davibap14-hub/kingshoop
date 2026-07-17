import { TEAMS } from '../../data/teams'
import { SEASON_PHASES } from '../../data/season/constants'
import { generateSeasonSchedule, phaseForWeek } from './schedule'
import { createInitialStandings } from './standings'

/**
 * Estado inicial da Season Engine.
 */
export function createSeasonState(overrides = {}) {
  const seasonNumber = overrides.seasonNumber ?? 1
  const schedule =
    overrides.schedule ?? generateSeasonSchedule(TEAMS, seasonNumber)

  return {
    seasonNumber,
    phase: overrides.phase ?? SEASON_PHASES.regular,
    schedule,
    standings: overrides.standings ?? createInitialStandings(TEAMS),
    results: overrides.results ?? [],
    weekResults: overrides.weekResults ?? [],
    injuries: overrides.injuries ?? [],
    playIn: overrides.playIn ?? null,
    playoffs: overrides.playoffs ?? null,
    awards: overrides.awards ?? null,
    champion: overrides.champion ?? null,
    lastWeek: overrides.lastWeek ?? 0,
  }
}

/**
 * Reinicia a liga para uma nova temporada (mesmo número ou +1).
 */
export function resetSeasonState(seasonNumber) {
  return createSeasonState({ seasonNumber })
}

export function syncPhase(seasonState, week) {
  return {
    ...seasonState,
    phase: phaseForWeek(week),
  }
}

/** Visão read-only para a Interface */
export function getSeasonView(seasonState, opts = {}) {
  const teamId = opts.teamId
  const week = opts.week ?? seasonState.lastWeek ?? 1
  const record = seasonState.standings?.[teamId] ?? null

  const nextFromSchedule = (() => {
    for (const slot of seasonState.schedule ?? []) {
      if (slot.week < week) continue
      for (const game of slot.games ?? []) {
        const played = (seasonState.results ?? []).some(
          (r) => r.gameId === game.id,
        )
        if (played) continue
        if (!teamId || game.homeId === teamId || game.awayId === teamId) {
          return { week: slot.week, phase: slot.phase, game }
        }
      }
    }
    return null
  })()

  return {
    seasonNumber: seasonState.seasonNumber,
    phase: seasonState.phase,
    standings: seasonState.standings,
    weekResults: seasonState.weekResults,
    injuries: seasonState.injuries,
    playIn: seasonState.playIn,
    playoffs: seasonState.playoffs,
    awards: seasonState.awards,
    champion: seasonState.champion,
    teamRecord: record
      ? {
          wins: record.wins,
          losses: record.losses,
          streakLabel: record.streakLabel,
          streak: record.streak,
        }
      : { wins: 0, losses: 0, streakLabel: '—', streak: 0 },
    nextGame: nextFromSchedule,
    schedule: seasonState.schedule,
  }
}
