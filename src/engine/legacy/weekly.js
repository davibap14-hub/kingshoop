import {
  LEGACY_POPULARITY_WEEKLY_CAP,
  LEGACY_RANKING_SIZE,
} from '../../data/legacy/constants.js'
import { createLeagueHistory } from '../history/state.js'
import { gatherLegacyInputs } from './inputs.js'
import { calculateLegacyScore } from './score.js'
import { getPlayerLegacy, hydrateLegacyState } from './state.js'

/**
 * Atualiza Legacy Score de jogadores relevantes e ranking histórico.
 */
export function processWeeklyLegacy({
  legacy,
  leagueHistory,
  gm = null,
  analytics = null,
  dynasty = null,
  player = null,
  status = null,
  seasonNumber = 1,
  seasonRolled = false,
} = {}) {
  let state = hydrateLegacyState(legacy)
  let history = createLeagueHistory(leagueHistory ?? {})
  const messages = []
  const decisions = []
  const events = []

  const ids = collectTrackedPlayerIds({
    history,
    gm,
    careerPlayerId: player?.id ?? 'career_player',
  })

  const scores = { ...(state.scores ?? {}) }
  let careerPopBoost = 0

  for (const playerId of ids) {
    const prev = scores[playerId]
    const nameHint =
      history.careerTotals?.[playerId]?.name ??
      (playerId === (player?.id ?? 'career_player') ? player?.nome : null)

    const inputs = gatherLegacyInputs({
      playerId,
      playerName: nameHint,
      history,
      gm,
      analytics,
      dynasty,
      playerOverride:
        playerId === (player?.id ?? 'career_player') ? player : null,
      status: playerId === (player?.id ?? 'career_player') ? status : null,
    })

    const computed = calculateLegacyScore(inputs)
    const entry = {
      playerId,
      name: inputs.name,
      teamId: inputs.teamId,
      score: computed.score,
      tier: computed.tier,
      tierLabel: computed.tierLabel,
      historicalValue: computed.historicalValue,
      breakdown: computed.breakdown,
      inputs: {
        titles: inputs.titles,
        mvp: inputs.mvp,
        finalsMvp: inputs.finalsMvp,
        allStar: inputs.allStar,
        allNba: inputs.allNba,
        defense: inputs.defense,
        records: inputs.records,
        longevity: inputs.longevitySeasons,
        popularity: inputs.popularity,
        personality: inputs.personality,
        historicalMoments: inputs.historicalMoments,
        rivalries: inputs.rivalries,
      },
      updatedAt: Date.now(),
      season: seasonNumber,
    }

    // Milestone de tier
    if (prev && tierRank(computed.tier) > tierRank(prev.tier)) {
      const event = {
        type: 'legacy_tier_up',
        playerId,
        playerName: entry.name,
        teamId: entry.teamId,
        tier: entry.tier,
        tierLabel: entry.tierLabel,
        score: entry.score,
        reason: `${entry.name} sobe no legado: ${entry.tierLabel}`,
        at: Date.now(),
      }
      events.push(event)
      decisions.push(event)
      messages.push(`Legacy Engine: ${event.reason} (${entry.score}).`)
    } else if (!prev && computed.score >= 45 && seasonRolled) {
      const event = {
        type: 'legacy_recognized',
        playerId,
        playerName: entry.name,
        teamId: entry.teamId,
        tier: entry.tier,
        tierLabel: entry.tierLabel,
        score: entry.score,
        reason: `${entry.name} entra no radar histórico (${entry.tierLabel})`,
        at: Date.now(),
      }
      events.push(event)
      decisions.push(event)
      messages.push(`Legacy Engine: ${event.reason}.`)
    }

    scores[playerId] = entry

    if (playerId === (player?.id ?? 'career_player')) {
      // Popularidade: legado alto puxa levemente a percepção pública
      const target = Math.round(computed.score * 0.85)
      const current = status?.popularidade ?? inputs.popularity
      if (target > current) {
        careerPopBoost = Math.min(
          LEGACY_POPULARITY_WEEKLY_CAP,
          Math.ceil((target - current) / 20),
        )
      }
    }
  }

  const ranking = buildLegacyRanking(scores).slice(0, LEGACY_RANKING_SIZE)

  state = {
    ...state,
    scores,
    ranking,
    lastEvaluatedSeason: seasonRolled
      ? seasonNumber
      : state.lastEvaluatedSeason,
    lastEvents: [...(state.lastEvents ?? []), ...events].slice(-24),
  }

  // Espelho no History para ranking permanente
  history = {
    ...history,
    legacyScores: Object.fromEntries(
      ranking.map((r) => [
        r.playerId,
        {
          score: r.score,
          tier: r.tier,
          tierLabel: r.tierLabel,
          name: r.name,
          teamId: r.teamId,
          historicalValue: r.historicalValue,
          rank: r.rank,
        },
      ]),
    ),
    legacyRanking: ranking,
  }

  return {
    legacy: state,
    leagueHistory: history,
    decisions,
    messages,
    events,
    popularityDelta: careerPopBoost,
    summary: {
      tracked: ids.length,
      careerScore: scores[player?.id ?? 'career_player']?.score ?? null,
      careerTier: scores[player?.id ?? 'career_player']?.tier ?? null,
      topRank: ranking[0] ?? null,
      newEvents: events.length,
      popularityDelta: careerPopBoost,
    },
  }
}

function collectTrackedPlayerIds({ history, gm, careerPlayerId }) {
  const ids = new Set()
  ids.add(careerPlayerId)

  // Top por game MVP / career totals
  const mvpEntries = Object.entries(history?.gameMvpTotals ?? {})
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .slice(0, 24)
  for (const [id] of mvpEntries) ids.add(id)

  for (const id of Object.keys(history?.careerTotals ?? {})) {
    const t = history.careerTotals[id]
    if ((t?.points ?? 0) >= 200 || (t?.gameMvps ?? 0) >= 2) ids.add(id)
  }

  // Rosters da liga (amostra — todos os ativos)
  for (const roster of Object.values(gm?.rosters ?? {})) {
    for (const id of roster ?? []) ids.add(id)
  }

  return [...ids]
}

function buildLegacyRanking(scores) {
  return Object.values(scores ?? {})
    .filter((e) => e && typeof e.score === 'number')
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return String(a.playerId).localeCompare(String(b.playerId))
    })
    .map((e, i) => ({
      rank: i + 1,
      playerId: e.playerId,
      name: e.name,
      teamId: e.teamId,
      score: e.score,
      tier: e.tier,
      tierLabel: e.tierLabel,
      historicalValue: e.historicalValue,
    }))
}

function tierRank(tier) {
  const map = {
    immortal: 5,
    legend: 4,
    great: 3,
    notable: 2,
    developing: 1,
  }
  return map[tier] ?? 0
}

export function getLegacyView(state = {}) {
  const legacy = hydrateLegacyState(state.legacy)
  const careerId = state.player?.id ?? 'career_player'
  const mine = getPlayerLegacy(legacy, careerId)
  return {
    available: Boolean(mine) || (legacy.ranking?.length ?? 0) > 0,
    career: mine,
    ranking: (legacy.ranking ?? []).slice(0, 12),
    historyMirror: state.leagueHistory?.legacyRanking?.slice(0, 12) ?? [],
  }
}
