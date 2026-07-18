/**
 * Extrai candidatos a recorde a partir da semana / temporada / carreira.
 */

import { RECORD_BUCKETS } from '../../data/records'

const TD_THRESHOLD = 8

function isTripleDouble(line) {
  const pts = line.points ?? 0
  const reb = line.rebounds ?? 0
  const ast = line.assists ?? 0
  return pts >= TD_THRESHOLD && reb >= TD_THRESHOLD && ast >= TD_THRESHOLD
}

function cand(partial) {
  if (partial.value == null || !(partial.value > 0)) return null
  return {
    key: partial.key,
    bucket: partial.bucket,
    value: partial.value,
    holderKind: partial.holderKind ?? 'player',
    holderId: partial.holderId ?? null,
    holderName: partial.holderName ?? null,
    teamId: partial.teamId ?? null,
    season: partial.season ?? null,
    week: partial.week ?? null,
    gameId: partial.gameId ?? null,
    note: partial.note ?? '',
  }
}

function keepBest(map, entry) {
  if (!entry) return
  const id = `${entry.bucket}.${entry.key}`
  const prev = map[id]
  if (!prev || entry.value > prev.value) {
    map[id] = entry
  }
}

/**
 * Atualiza trackers de temporada a partir do box da semana.
 */
export function accumulateSeasonTrackers(trackers, weekResults = [], seasonNumber) {
  let seasonPlayers = { ...(trackers?.seasonPlayers ?? {}) }
  let sn = trackers?.seasonNumber ?? seasonNumber

  if (sn != null && seasonNumber != null && sn !== seasonNumber) {
    // Nova temporada — caller deve resetar; aqui só acumula se bate
    seasonPlayers = {}
    sn = seasonNumber
  }

  for (const result of weekResults) {
    for (const line of result.boxSummary ?? []) {
      const pid = line.playerId ?? line.playerName
      if (!pid) continue
      const prev = seasonPlayers[pid] ?? {
        playerId: line.playerId ?? null,
        name: line.playerName ?? String(pid),
        teamId: line.teamId ?? null,
        points: 0,
        rebounds: 0,
        assists: 0,
        steals: 0,
        blocks: 0,
        tripleDoubles: 0,
        games: 0,
      }
      const next = {
        ...prev,
        name: line.playerName ?? prev.name,
        teamId: line.teamId ?? prev.teamId,
        points: prev.points + (line.points ?? 0),
        rebounds: prev.rebounds + (line.rebounds ?? 0),
        assists: prev.assists + (line.assists ?? 0),
        steals: prev.steals + (line.steals ?? 0),
        blocks: prev.blocks + (line.blocks ?? 0),
        games: prev.games + 1,
        tripleDoubles:
          prev.tripleDoubles + (isTripleDouble(line) ? 1 : 0),
      }
      seasonPlayers[pid] = next
    }
  }

  return {
    seasonNumber: seasonNumber ?? sn,
    seasonPlayers,
  }
}

/**
 * Candidatos de jogo (jogador + time).
 */
export function extractGameCandidates(weekResults = [], season, week) {
  const map = {}

  for (const result of weekResults) {
    const homeScore = result.homeScore ?? 0
    const awayScore = result.awayScore ?? 0
    const high = Math.max(homeScore, awayScore)
    const margin = Math.abs(homeScore - awayScore)
    const highTeam =
      homeScore >= awayScore ? result.homeId : result.awayId

    keepBest(
      map,
      cand({
        key: 'points',
        bucket: RECORD_BUCKETS.teamGame,
        value: high,
        holderKind: 'team',
        holderId: highTeam,
        holderName: highTeam,
        teamId: highTeam,
        season,
        week,
        gameId: result.gameId,
        note: `${result.awayShort ?? result.awayId} @ ${result.homeShort ?? result.homeId}`,
      }),
    )

    keepBest(
      map,
      cand({
        key: 'margin',
        bucket: RECORD_BUCKETS.teamGame,
        value: margin,
        holderKind: 'team',
        holderId: highTeam,
        holderName: highTeam,
        teamId: highTeam,
        season,
        week,
        gameId: result.gameId,
        note: `${high}–${Math.min(homeScore, awayScore)}`,
      }),
    )

    for (const line of result.boxSummary ?? []) {
      const name = line.playerName ?? line.playerId
      const pid = line.playerId ?? name
      const teamId = line.teamId ?? null
      const base = {
        holderKind: 'player',
        holderId: pid,
        holderName: name,
        teamId,
        season,
        week,
        gameId: result.gameId,
      }

      for (const stat of ['points', 'rebounds', 'assists', 'steals', 'blocks']) {
        keepBest(
          map,
          cand({
            ...base,
            key: stat,
            bucket: RECORD_BUCKETS.game,
            value: line[stat] ?? 0,
            note: `${name}: ${line[stat] ?? 0} ${stat}`,
          }),
        )
      }

      if (isTripleDouble(line)) {
        const composite =
          (line.points ?? 0) + (line.rebounds ?? 0) + (line.assists ?? 0)
        keepBest(
          map,
          cand({
            ...base,
            key: 'tripleDouble',
            bucket: RECORD_BUCKETS.game,
            value: composite,
            note: `${name}: ${line.points}/${line.rebounds}/${line.assists}`,
          }),
        )
      }
    }
  }

  return Object.values(map)
}

/**
 * Candidatos de temporada (jogador via trackers + time via standings).
 */
export function extractSeasonCandidates({
  trackers,
  standings = null,
  season,
  week,
  seasonLabel = null,
} = {}) {
  const map = {}
  const labelSeason = seasonLabel ?? season

  for (const row of Object.values(trackers?.seasonPlayers ?? {})) {
    const base = {
      holderKind: 'player',
      holderId: row.playerId ?? row.name,
      holderName: row.name,
      teamId: row.teamId,
      season: labelSeason,
      week,
    }
    for (const stat of [
      'points',
      'rebounds',
      'assists',
      'steals',
      'blocks',
      'tripleDoubles',
    ]) {
      keepBest(
        map,
        cand({
          ...base,
          key: stat,
          bucket: RECORD_BUCKETS.season,
          value: row[stat] ?? 0,
          note: `${row.name}: ${row[stat] ?? 0} ${stat} (T${labelSeason})`,
        }),
      )
    }
  }

  if (standings) {
    for (const row of Object.values(standings)) {
      const wins = row.wins ?? 0
      keepBest(
        map,
        cand({
          key: 'wins',
          bucket: RECORD_BUCKETS.teamSeason,
          value: wins,
          holderKind: 'team',
          holderId: row.teamId,
          holderName: row.teamShort ?? row.teamId,
          teamId: row.teamId,
          season: labelSeason,
          week,
          note: `${wins}-${row.losses ?? 0} na temporada ${labelSeason}`,
        }),
      )
    }
  }

  return Object.values(map)
}

/**
 * Candidatos de sequência (standings atuais).
 */
export function extractStreakCandidates(standings = {}, season, week) {
  const map = {}
  for (const row of Object.values(standings)) {
    const streak = row.streak ?? 0
    if (streak <= 0) continue
    keepBest(
      map,
      cand({
        key: 'wins',
        bucket: RECORD_BUCKETS.streak,
        value: streak,
        holderKind: 'team',
        holderId: row.teamId,
        holderName: row.teamShort ?? row.teamId,
        teamId: row.teamId,
        season,
        week,
        note: row.streakLabel || `${streak}V`,
      }),
    )
  }
  return Object.values(map)
}

/**
 * Candidatos de carreira (History + Analytics).
 */
export function extractCareerCandidates({
  leagueHistory = null,
  analytics = null,
  season,
  week,
} = {}) {
  const map = {}
  const careerTotals = leagueHistory?.careerTotals ?? {}
  const tdTotals = leagueHistory?.tripleDoubleTotals ?? {}
  const analyticsCareer = analytics?.career ?? {}

  const ids = new Set([
    ...Object.keys(careerTotals),
    ...Object.keys(analyticsCareer),
    ...Object.keys(tdTotals),
  ])

  for (const id of ids) {
    const totals = careerTotals[id] ?? {}
    const a = analyticsCareer[id]?.totals ?? {}
    const name =
      totals.name ?? analyticsCareer[id]?.playerName ?? id
    const teamId = analyticsCareer[id]?.teamId ?? totals.teamId ?? null

    const points = Math.max(totals.points ?? 0, a.pts ?? 0)
    const rebounds = Math.max(totals.rebounds ?? 0, a.reb ?? 0)
    const assists = Math.max(totals.assists ?? 0, a.ast ?? 0)
    const steals = Math.max(totals.steals ?? 0, a.stl ?? 0)
    const blocks = Math.max(totals.blocks ?? 0, a.blk ?? 0)
    const tripleDoubles = Math.max(
      totals.tripleDoubles ?? 0,
      tdTotals[id] ?? 0,
      typeof tdTotals[name] === 'number' ? tdTotals[name] : 0,
    )
    const seasons =
      totals.seasons ||
      Math.max(1, Math.round((totals.games ?? a.games ?? 0) / 70)) ||
      0

    const base = {
      holderKind: 'player',
      holderId: id,
      holderName: name,
      teamId,
      season,
      week,
    }

    const stats = {
      points,
      rebounds,
      assists,
      steals,
      blocks,
      tripleDoubles,
      seasons,
    }

    for (const [key, value] of Object.entries(stats)) {
      keepBest(
        map,
        cand({
          ...base,
          key,
          bucket: RECORD_BUCKETS.career,
          value,
          note: `${name}: ${value} ${key} (carreira)`,
        }),
      )
    }
  }

  return Object.values(map)
}
