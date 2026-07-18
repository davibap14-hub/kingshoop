/**
 * Pipeline semanal da Analytics Engine.
 */

import { analyzeGameBox } from './game.js'
import {
  accumulateAnalyticsMap,
  attachTeamContext,
} from './aggregate.js'
import { createAnalyticsState } from './state.js'
import { ANALYTICS_METRICS } from '../../data/analytics'

/**
 * Processa resultados da semana → atualiza season/career analytics.
 *
 * Aceita weekResults com `boxScore` completo OU `boxSummary` enriquecido.
 */
export function processWeeklyAnalytics({
  analytics,
  weekResults = [],
  seasonNumber = null,
  seasonRolled = false,
  careerPlayerId = null,
} = {}) {
  const messages = []
  let state = createAnalyticsState(analytics ?? {})

  // Nova temporada → zera season, mantém career
  if (seasonRolled) {
    state = {
      ...state,
      season: {},
      seasonNumber,
    }
    messages.push('Analytics: totais de temporada reiniciados.')
  }

  if (!weekResults.length) {
    return {
      analytics: {
        ...state,
        seasonNumber: seasonNumber ?? state.seasonNumber,
        updatedAt: Date.now(),
      },
      messages,
      summary: {
        games: 0,
        playersUpdated: 0,
        leaders: [],
        careerPlayer: null,
      },
    }
  }

  let seasonMap = { ...state.season }
  let careerMap = { ...state.career }
  let games = 0
  const weekPlayers = []

  for (const result of weekResults) {
    const analyzed = analyzeWeekResult(result)
    if (!analyzed?.players?.length) continue
    games += 1
    const withCtx = attachTeamContext(analyzed)
    weekPlayers.push(...withCtx)
    seasonMap = accumulateAnalyticsMap(seasonMap, withCtx, { seasonNumber })
    careerMap = accumulateAnalyticsMap(careerMap, withCtx, { seasonNumber })
  }

  const leaders = buildWeekLeaders(weekPlayers)
  const careerPlayer = careerPlayerId
    ? seasonMap[careerPlayerId] ?? careerMap[careerPlayerId] ?? null
    : null

  if (games) {
    messages.push(
      `Analytics: ${games} jogo(s) · ${Object.keys(seasonMap).length} jogador(es) com métricas avançadas.`,
    )
  }
  if (leaders[0]) {
    const top = leaders[0]
    messages.push(
      `Analytics líder PER: ${top.playerName} (${top.advanced?.per ?? '—'}).`,
    )
  }

  const next = {
    ...state,
    season: seasonMap,
    career: careerMap,
    lastWeek: {
      week: weekResults[0]?.week ?? null,
      seasonNumber,
      games,
      leaders,
      careerPlayerId,
    },
    seasonNumber: seasonNumber ?? state.seasonNumber,
    updatedAt: Date.now(),
  }

  return {
    analytics: next,
    messages,
    summary: {
      games,
      playersUpdated: Object.keys(seasonMap).length,
      leaders,
      careerPlayer: careerPlayer
        ? {
            playerId: careerPlayer.playerId,
            playerName: careerPlayer.playerName,
            averages: careerPlayer.averages,
            totals: {
              games: careerPlayer.totals.games,
              pts: careerPlayer.totals.pts,
              reb: careerPlayer.totals.reb,
              ast: careerPlayer.totals.ast,
            },
          }
        : null,
      metrics: Object.values(ANALYTICS_METRICS).map((m) => m.short),
    },
  }
}

/**
 * Reconstrói análise a partir de um resultado de semana.
 */
export function analyzeWeekResult(result) {
  if (result?.boxScore?.home && result?.boxScore?.away) {
    return analyzeGameBox(result.boxScore, {
      possessionCount: result.possessionCount,
    })
  }

  // boxSummary enriquecido (sem boxScore completo)
  if (result?.boxSummary?.length && result.homeId && result.awayId) {
    return analyzeGameBox(boxScoreFromSummary(result), {
      possessionCount: result.possessionCount,
    })
  }

  return null
}

function boxScoreFromSummary(result) {
  const toPlayers = (teamId) =>
    (result.boxSummary ?? [])
      .filter((l) => l.teamId === teamId)
      .map((l) => ({
        id: l.playerId,
        nome: l.playerName,
        points: l.points ?? 0,
        rebounds: l.rebounds ?? 0,
        orb: l.orb ?? 0,
        drb: l.drb ?? Math.max(0, (l.rebounds ?? 0) - (l.orb ?? 0)),
        assists: l.assists ?? 0,
        steals: l.steals ?? 0,
        blocks: l.blocks ?? 0,
        turnovers: l.turnovers ?? 0,
        fouls: l.fouls ?? 0,
        fgMade: l.fgMade ?? 0,
        fgAtt: l.fgAtt ?? 0,
        threeMade: l.threeMade ?? 0,
        threeAtt: l.threeAtt ?? 0,
        ftMade: l.ftMade ?? 0,
        ftAtt: l.ftAtt ?? 0,
      }))

  return {
    home: {
      teamId: result.homeId,
      teamShort: result.homeShort,
      players: toPlayers(result.homeId),
    },
    away: {
      teamId: result.awayId,
      teamShort: result.awayShort,
      players: toPlayers(result.awayId),
    },
  }
}

function buildWeekLeaders(weekPlayers) {
  const byId = new Map()
  for (const row of weekPlayers) {
    const prev = byId.get(row.playerId)
    const per = row.advanced?.per
    if (per == null) continue
    if (!prev || (prev.advanced?.per ?? -Infinity) < per) {
      byId.set(row.playerId, row)
    }
  }
  return [...byId.values()]
    .sort((a, b) => (b.advanced?.per ?? 0) - (a.advanced?.per ?? 0))
    .slice(0, 8)
    .map((r) => ({
      playerId: r.playerId,
      playerName: r.playerName,
      teamId: r.teamId,
      teamShort: r.teamShort,
      advanced: r.advanced,
    }))
}
