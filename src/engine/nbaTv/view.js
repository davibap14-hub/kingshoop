/**
 * NBA TV Engine — portal de notícias da liga.
 * Agrega News · History · Analytics · Records · Season.
 * Nunca gera notícias — só lê o que as Engines já produziram.
 */

import {
  NBA_TV_LIMITS,
  NBA_TV_VERSION,
} from '../../data/nbaTv'
import {
  NEWS_CATEGORIES,
  NEWS_CATEGORY_IDS,
} from '../../data/news'
import { getAnalyticsView } from '../analytics'
import { getHistoryView } from '../history'
import { getRecordsView } from '../records'
import {
  buildRookieBoard,
  derivePlayerOfMonth,
  derivePlayerOfWeek,
} from './awards.js'
import { buildPowerRankings } from './rankings.js'

/**
 * Visão completa do portal NBA TV.
 * @param {object} state — snapshot da carreira (store)
 * @param {{ category?: string }} [filters]
 */
export function getNbaTvView(state = {}, filters = {}) {
  const week = state.currentWeek ?? 1
  const seasonNumber = state.currentSeason ?? 1
  const weekNews = Array.isArray(state.weekNews) ? state.weekNews : []
  const newsFeed = Array.isArray(state.newsFeed) ? state.newsFeed : []

  const analyticsView = getAnalyticsView(state)
  const historyView = getHistoryView(state.leagueHistory)
  const recordsView = getRecordsView(state)

  const category = filters.category && filters.category !== 'ALL'
    ? filters.category
    : null

  const latest = pickLatestNews(weekNews, newsFeed, category).slice(
    0,
    NBA_TV_LIMITS.latest,
  )
  const rumors = newsFeed
    .filter((n) => n.category === 'rumor' || n.category === 'criticism')
    .slice(0, NBA_TV_LIMITS.rumors)
    .map(presentNews)

  const topPerformances = buildTopPerformances(analyticsView, newsFeed)

  const recordsBroken = (recordsView.brokenThisWeek ?? [])
    .slice(0, NBA_TV_LIMITS.records)
    .map((r) => ({
      id: r.id ?? `${r.key}-${r.holderId}`,
      label: r.label ?? r.key,
      value: r.value,
      holderName: r.holderName,
      holderId: r.holderId,
      scope: r.scope,
      season: r.season,
      week: r.week,
      note: r.note ?? null,
      source: 'records',
    }))

  // Recordes também via News Engine (categoria record) — só leitura
  const recordNews = newsFeed
    .filter((n) => n.category === 'record')
    .slice(0, 4)
    .map(presentNews)

  const powerRanking = buildPowerRankings(
    state.season?.standings ?? {},
    NBA_TV_LIMITS.powerRanking,
  )

  const playerOfTheWeek = derivePlayerOfWeek(analyticsView, {
    week,
    seasonNumber,
  })
  const playerOfTheMonth = derivePlayerOfMonth({
    newsFeed,
    analyticsView,
    currentWeek: week,
    seasonNumber,
  })

  const rookies = buildRookieBoard(state.gm, analyticsView, {
    limit: NBA_TV_LIMITS.rookies,
  })

  const stats = {
    tip: analyticsView.tip,
    metrics: analyticsView.metrics,
    leagueLeaders: (analyticsView.leagueLeaders ?? []).slice(
      0,
      NBA_TV_LIMITS.statsLeaders,
    ),
    teamLeaders: analyticsView.teamLeaders ?? [],
    careerPlayer: analyticsView.careerPlayer,
    historyLeaders: (historyView.leaders ?? []).slice(0, 3),
    topGameMvps: historyView.topGameMvps ?? [],
    topTripleDoubles: historyView.topTripleDoubles ?? [],
    playersTracked: analyticsView.playersTracked,
  }

  const headline = latest[0] ?? null
  const hasContent =
    latest.length > 0 ||
    Boolean(playerOfTheWeek) ||
    powerRanking.length > 0 ||
    (analyticsView.leagueLeaders ?? []).length > 0

  return {
    available: true,
    version: NBA_TV_VERSION,
    week,
    seasonNumber,
    message: hasContent
      ? 'Portal ao vivo — dados das Engines News · History · Analytics.'
      : 'Avance semanas para alimentar o portal (News / Analytics).',
    filters: {
      category: category ?? 'ALL',
      categories: [
        { id: 'ALL', label: 'Todas' },
        ...NEWS_CATEGORY_IDS.map((id) => ({
          id,
          label: NEWS_CATEGORIES[id]?.label ?? id,
        })),
      ],
    },
    headline,
    latest,
    rumors,
    topPerformances,
    recordsBroken,
    recordNews,
    powerRanking,
    playerOfTheWeek,
    playerOfTheMonth,
    rookies,
    stats,
    historySpotlight: {
      champions: (historyView.champions ?? []).slice(0, 3),
      mvps: (historyView.mvps ?? []).slice(0, 3),
      awards: (historyView.awards ?? []).slice(0, 5),
      records: (historyView.records ?? []).slice(0, 6),
      seasonsCount: historyView.seasonsCount ?? 0,
    },
    sources: {
      news: 'News Engine',
      history: 'History Engine',
      analytics: 'Analytics Engine',
      records: 'Records Engine',
      season: 'Season Engine',
    },
  }
}

function pickLatestNews(weekNews, newsFeed, category) {
  const pool =
    weekNews.length > 0
      ? [...weekNews, ...newsFeed.filter((n) => !weekNews.some((w) => w.id === n.id))]
      : [...newsFeed]

  return pool
    .filter((n) => (category ? n.category === category : true))
    .map(presentNews)
}

function presentNews(n) {
  if (!n) return null
  const cat = NEWS_CATEGORIES[n.category]
  return {
    id: n.id,
    week: n.week,
    seasonNumber: n.seasonNumber,
    category: n.category,
    categoryLabel: n.categoryLabel ?? cat?.label ?? n.category,
    tone: n.impact?.tone ?? cat?.tone ?? 'neutral',
    title: n.title,
    summary: n.summary,
    impact: n.impact
      ? {
          description: n.impact.description,
          magnitude: n.impact.magnitude,
          tone: n.impact.tone,
        }
      : null,
    refs: n.refs ?? null,
    aboutPlayerTeam: Boolean(n.aboutPlayerTeam),
    source: 'news',
  }
}

function buildTopPerformances(analyticsView, newsFeed) {
  const fromAnalytics = (analyticsView?.lastWeek?.leaders ?? []).map(
    (row, i) => ({
      id: `perf-${row.playerId}-${i}`,
      rank: i + 1,
      playerId: row.playerId,
      playerName: row.playerName,
      teamId: row.teamId,
      teamShort: row.teamShort ?? row.teamId,
      per: row.advanced?.per ?? null,
      tsPct: row.advanced?.tsPct ?? null,
      pie: row.advanced?.pie ?? null,
      title: `${row.playerName} · PER ${row.advanced?.per ?? '—'}`,
      summary:
        row.advanced?.per != null
          ? `Top performance da semana (Analytics) — PER ${row.advanced.per}.`
          : 'Destaque avançado da semana.',
      source: 'analytics',
    }),
  )

  if (fromAnalytics.length) {
    return fromAnalytics.slice(0, NBA_TV_LIMITS.topPerformances)
  }

  // Fallback: News Engine (mvp / triple_double) — textos já gerados
  return newsFeed
    .filter((n) => n.category === 'mvp' || n.category === 'triple_double')
    .slice(0, NBA_TV_LIMITS.topPerformances)
    .map((n, i) => ({
      id: n.id,
      rank: i + 1,
      playerId: n.refs?.playerId ?? null,
      playerName: null,
      teamId: n.refs?.teamId ?? null,
      teamShort: n.refs?.teamId ?? null,
      per: null,
      title: n.title,
      summary: n.summary,
      source: 'news',
    }))
}
