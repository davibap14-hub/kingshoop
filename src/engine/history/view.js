import { RECORD_KEYS, RECORD_LABELS } from '../../data/history/index.js'
import { AWARD_LABELS } from '../../data/season/constants'
import { createLeagueHistory } from './state.js'

/**
 * Visão agregada para a Interface (somente leitura).
 */
export function getHistoryView(leagueHistory) {
  const h = createLeagueHistory(leagueHistory ?? {})

  const records = RECORD_KEYS.map((key) => ({
    key,
    label: RECORD_LABELS[key] ?? key,
    entry: h.records?.[key] ?? null,
  })).filter((r) => r.entry)

  const latestSeason = h.seasons?.length
    ? h.seasons[h.seasons.length - 1]
    : null

  return {
    seasonsCount: h.seasons.length,
    seasons: [...h.seasons].reverse(),
    latestSeason,
    champions: [...h.champions].reverse(),
    mvps: [...h.mvps].reverse(),
    awards: [...h.awards]
      .map((a) => ({
        ...a,
        label: a.label ?? AWARD_LABELS[a.type] ?? a.type,
      }))
      .reverse(),
    leaders: [...h.leaders].reverse(),
    records,
    hallOfFame: [...h.hallOfFame].reverse(),
    retirements: [...h.retirements].reverse(),
    topGameMvps: Object.entries(h.gameMvpTotals || {})
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    topTripleDoubles: Object.entries(h.tripleDoubleTotals || {})
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
  }
}
