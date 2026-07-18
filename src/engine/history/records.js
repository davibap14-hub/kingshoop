import { createEmptyRecords } from './state.js'

/**
 * Atualiza recordes permanentes da liga.
 */
export function updateLeagueRecords(records, candidates = {}) {
  const next = { ...(records || createEmptyRecords()) }

  for (const [key, candidate] of Object.entries(candidates)) {
    if (!candidate || candidate.value == null) continue
    const current = next[key]
    const shouldReplace = !current || current.value == null || candidate.value > current.value

    if (shouldReplace) {
      next[key] = {
        value: candidate.value,
        holder: candidate.holder ?? null,
        teamId: candidate.teamId ?? null,
        season: candidate.season ?? null,
        week: candidate.week ?? null,
        note: candidate.note ?? '',
      }
    }
  }

  return next
}

/**
 * Extrai candidatos a recorde a partir dos resultados da semana.
 */
export function extractRecordCandidatesFromWeek(weekResults = [], season, week) {
  const candidates = {}

  for (const result of weekResults) {
    const homeScore = result.homeScore ?? 0
    const awayScore = result.awayScore ?? 0
    const high = Math.max(homeScore, awayScore)
    const margin = Math.abs(homeScore - awayScore)
    const highTeam =
      homeScore >= awayScore ? result.homeId : result.awayId

    if (!candidates.highestTeamScore || high > candidates.highestTeamScore.value) {
      candidates.highestTeamScore = {
        value: high,
        holder: highTeam,
        teamId: highTeam,
        season,
        week,
        note: `${result.awayShort ?? result.awayId} @ ${result.homeShort ?? result.homeId}`,
      }
    }

    if (!candidates.largestMargin || margin > candidates.largestMargin.value) {
      candidates.largestMargin = {
        value: margin,
        holder: highTeam,
        teamId: highTeam,
        season,
        week,
        note: `${high}–${Math.min(homeScore, awayScore)}`,
      }
    }

    const mvpPts = result.mvpStats?.points
    if (mvpPts != null) {
      if (!candidates.mostPointsGame || mvpPts > candidates.mostPointsGame.value) {
        candidates.mostPointsGame = {
          value: mvpPts,
          holder: result.mvpStats?.id ?? result.mvp,
          teamId: result.winnerId ?? highTeam,
          season,
          week,
          note: `${result.mvp ?? 'Jogador'}: ${mvpPts} pts`,
        }
      }
    }

    for (const perf of result.performances ?? []) {
      const pts = perf.points ?? 0
      if (!pts) continue
      if (!candidates.mostPointsGame || pts > candidates.mostPointsGame.value) {
        candidates.mostPointsGame = {
          value: pts,
          holder: perf.playerId ?? perf.playerName,
          teamId: perf.teamId ?? null,
          season,
          week,
          note: `${perf.playerName ?? perf.playerId}: ${pts} pts`,
        }
      }
    }
  }

  return candidates
}

/**
 * Recordes derivados do arquivo de temporada.
 */
export function extractRecordCandidatesFromSeasonArchive(archive) {
  if (!archive) return {}
  const candidates = {}
  const standings = archive.seasonStats?.standings || []
  const top = standings[0]
  if (top) {
    candidates.mostWinsSeason = {
      value: top.wins,
      holder: top.teamId,
      teamId: top.teamId,
      season: archive.season,
      note: `${top.wins}-${top.losses} na temporada ${archive.season}`,
    }
  }

  const streak = archive.seasonStats?.bestWinStreak
  if (streak?.streak) {
    candidates.longestWinStreak = {
      value: streak.streak,
      holder: streak.teamId,
      teamId: streak.teamId,
      season: archive.season,
      note: streak.streakLabel || `Sequência de ${streak.streak} vitórias`,
    }
  }

  const tdTop = (archive.leaders?.tripleDoubles || [])[0]
  if (tdTop) {
    candidates.tripleDoublesSeason = {
      value: tdTop.value,
      holder: tdTop.playerId ?? tdTop.name,
      teamId: tdTop.teamId ?? null,
      season: archive.season,
      note: `${tdTop.value} triplos-duplos — ${tdTop.name ?? tdTop.playerId}`,
    }
  }

  return candidates
}
