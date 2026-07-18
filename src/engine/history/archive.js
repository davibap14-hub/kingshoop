import { AWARD_IDS, AWARD_LABELS } from '../../data/season/constants'
import { getTeamById } from '../../data/teams'
import { computeSeasonLeaders, computeSeasonStats } from './leaders.js'
import {
  extractRecordCandidatesFromSeasonArchive,
  updateLeagueRecords,
} from './records.js'
import { createEmptyRecords } from './state.js'

/**
 * Monta o arquivo permanente de uma temporada (antes do reset).
 * Nada desta estrutura deve ser truncado ou descartado.
 */
export function buildSeasonArchive(seasonState, extras = {}) {
  if (!seasonState || seasonState.seasonNumber == null) return null

  const leaders = computeSeasonLeaders(seasonState)
  const seasonStats = computeSeasonStats(seasonState)
  const championId =
    seasonState.champion ??
    seasonState.playoffs?.finals?.champion ??
    seasonState.awards?.champion?.teamId ??
    null
  const championTeam = championId ? getTeamById(championId) : null

  const awards = {}
  for (const id of AWARD_IDS) {
    const a = seasonState.awards?.[id]
    if (!a) continue
    awards[id] = {
      id,
      label: a.label ?? AWARD_LABELS[id] ?? id,
      teamId: a.teamId ?? null,
      teamShort: a.teamShort ?? null,
      detail: a.detail ?? null,
    }
  }

  return {
    season: seasonState.seasonNumber,
    archivedAt: Date.now(),
    phase: seasonState.phase,
    lastWeek: seasonState.lastWeek ?? null,
    champion: championId
      ? {
          teamId: championId,
          teamShort: championTeam?.short ?? seasonState.awards?.champion?.teamShort,
          name: championTeam?.name ?? championId,
          detail: seasonState.awards?.champion?.detail ?? null,
        }
      : null,
    awards,
    standings: seasonStats.standings,
    playoffs: seasonState.playoffs
      ? JSON.parse(JSON.stringify(seasonState.playoffs))
      : null,
    leaders,
    seasonStats,
    gameMvpTotals: { ...(extras.gameMvpTotals ?? {}) },
    tripleDoubleTotals: { ...(extras.tripleDoubleTotals ?? {}) },
    resultsCount: (seasonState.results ?? []).length,
  }
}

/**
 * Anexa arquivo de temporada ao histórico permanente da liga.
 * Nunca remove entradas anteriores — apenas upsert da mesma temporada.
 */
export function appendSeasonToHistory(history, archive) {
  if (!archive) return history

  const seasons = [...(history.seasons || [])]
  const existingIdx = seasons.findIndex((s) => s.season === archive.season)
  if (existingIdx >= 0) seasons[existingIdx] = archive
  else seasons.push(archive)
  seasons.sort((a, b) => a.season - b.season)

  const champions = [...(history.champions || [])]
  if (archive.champion) {
    const entry = {
      season: archive.season,
      teamId: archive.champion.teamId,
      teamShort: archive.champion.teamShort,
      name: archive.champion.name,
      detail: archive.champion.detail,
    }
    const chIdx = champions.findIndex((c) => c.season === archive.season)
    if (chIdx >= 0) champions[chIdx] = entry
    else champions.push(entry)
  }

  const mvps = [...(history.mvps || [])]
  if (archive.awards?.mvp) {
    const entry = {
      season: archive.season,
      teamId: archive.awards.mvp.teamId,
      teamShort: archive.awards.mvp.teamShort,
      detail: archive.awards.mvp.detail,
      label: archive.awards.mvp.label,
    }
    const mvpIdx = mvps.findIndex((m) => m.season === archive.season)
    if (mvpIdx >= 0) mvps[mvpIdx] = entry
    else mvps.push(entry)
  }

  const awards = [...(history.awards || [])]
  for (const id of AWARD_IDS) {
    const a = archive.awards?.[id]
    if (!a) continue
    const entry = {
      season: archive.season,
      type: id,
      label: a.label,
      teamId: a.teamId,
      teamShort: a.teamShort,
      detail: a.detail,
    }
    const idx = awards.findIndex((x) => x.season === archive.season && x.type === id)
    if (idx >= 0) awards[idx] = entry
    else awards.push(entry)
  }

  const leaders = [...(history.leaders || [])]
  const leaderEntry = { season: archive.season, ...archive.leaders }
  const leaderIdx = leaders.findIndex((l) => l.season === archive.season)
  if (leaderIdx >= 0) leaders[leaderIdx] = leaderEntry
  else leaders.push(leaderEntry)

  const records = updateLeagueRecords(
    history.records || createEmptyRecords(),
    extractRecordCandidatesFromSeasonArchive(archive),
  )

  return {
    ...history,
    seasons,
    mvps: mvps.sort((a, b) => a.season - b.season),
    champions: champions.sort((a, b) => a.season - b.season),
    awards: awards.sort(
      (a, b) => a.season - b.season || String(a.type).localeCompare(String(b.type)),
    ),
    leaders: leaders.sort((a, b) => a.season - b.season),
    records,
    hallOfFame: history.hallOfFame || [],
    retirements: history.retirements || [],
    gameMvpTotals: history.gameMvpTotals || {},
    tripleDoubleTotals: history.tripleDoubleTotals || {},
  }
}
