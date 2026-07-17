import { TEAMS } from '../../data/teams'
import { SEASON_CALENDAR, SEASON_PHASES } from '../../data/season/constants'

/**
 * Gera calendário completo: temporada regular (round-robin rotativo)
 * + slots de Play-In / Playoffs / Finais / Premiações.
 */
export function generateSeasonSchedule(teams = TEAMS, seasonNumber = 1) {
  const ids = teams.map((t) => t.id)
  const weeks = []

  // Round-robin circle method — cada semana todos jogam (3 jogos)
  const n = ids.length
  const rotation = [...ids]
  let gameSeq = 1

  for (let week = SEASON_CALENDAR.regularStart; week <= SEASON_CALENDAR.regularEnd; week++) {
    const games = []
    // Pair first with last, second with second-last, etc.
    for (let i = 0; i < n / 2; i++) {
      const homeId = rotation[i]
      const awayId = rotation[n - 1 - i]
      // Alterna mando conforme a semana
      const swap = week % 2 === 0
      games.push({
        id: `S${seasonNumber}-W${week}-G${gameSeq++}`,
        week,
        phase: SEASON_PHASES.regular,
        homeId: swap ? awayId : homeId,
        awayId: swap ? homeId : awayId,
        label: 'Temporada regular',
      })
    }
    weeks.push({ week, phase: SEASON_PHASES.regular, games })

    // Rotaciona (mantém índice 0 fixo)
    const fixed = rotation[0]
    const rest = rotation.slice(1)
    rest.unshift(rest.pop())
    rotation.splice(0, rotation.length, fixed, ...rest)
  }

  weeks.push({
    week: SEASON_CALENDAR.playInWeek,
    phase: SEASON_PHASES.play_in,
    games: [], // preenchido dinamicamente
  })

  for (let week = SEASON_CALENDAR.playoffsStart; week <= SEASON_CALENDAR.playoffsEnd; week++) {
    weeks.push({
      week,
      phase: SEASON_PHASES.playoffs,
      games: [],
    })
  }

  for (let week = SEASON_CALENDAR.finalsStart; week <= SEASON_CALENDAR.finalsEnd; week++) {
    weeks.push({
      week,
      phase: SEASON_PHASES.finals,
      games: [],
    })
  }

  weeks.push({
    week: SEASON_CALENDAR.awardsWeek,
    phase: SEASON_PHASES.awards,
    games: [],
  })

  for (let week = SEASON_CALENDAR.offseasonStart; week <= SEASON_CALENDAR.offseasonEnd; week++) {
    weeks.push({
      week,
      phase: SEASON_PHASES.offseason,
      games: [],
    })
  }

  return weeks
}

export function getWeekSlot(schedule, week) {
  return schedule.find((w) => w.week === week) ?? null
}

export function phaseForWeek(week) {
  const c = SEASON_CALENDAR
  if (week >= c.regularStart && week <= c.regularEnd) return SEASON_PHASES.regular
  if (week === c.playInWeek) return SEASON_PHASES.play_in
  if (week >= c.playoffsStart && week <= c.playoffsEnd) return SEASON_PHASES.playoffs
  if (week >= c.finalsStart && week <= c.finalsEnd) return SEASON_PHASES.finals
  if (week === c.awardsWeek) return SEASON_PHASES.awards
  return SEASON_PHASES.offseason
}

export function findTeamNextGame(schedule, results, teamId, fromWeek) {
  const played = new Set((results ?? []).map((r) => r.gameId))
  for (const slot of schedule) {
    if (slot.week < fromWeek) continue
    for (const game of slot.games ?? []) {
      if (played.has(game.id)) continue
      if (game.homeId === teamId || game.awayId === teamId) {
        return { week: slot.week, phase: slot.phase, game }
      }
    }
  }
  return null
}
