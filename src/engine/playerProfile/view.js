/**
 * Player Profile Engine — perfil estilo NBA 2K.
 * Agrega Engines existentes; não cria regras novas.
 */

import {
  PLAYER_PROFILE_LIMITS,
  PLAYER_PROFILE_VERSION,
} from '../../data/playerProfile'
import { ARCHETYPES } from '../../data/constants/archetypes'
import { listTendencies } from '../../data/players/utils'
import { getTeamById } from '../../data/teams'
import { getAchievementsView } from '../achievements'
import { getAnalyticsView } from '../analytics'
import { getContractView } from '../contracts'
import { getDnaView } from '../dna'
import { getHistoryView } from '../history'
import { getInjuryView } from '../injuries'
import { getLegacyView } from '../legacy'
import { listPersonalityTraits } from '../personality'
import { getStoryView } from '../story'
import {
  buildAttributeRadar,
  buildDetailedAttributes,
  buildEvolutionSeries,
  buildTendencyBars,
} from './charts.js'
import { buildCareerTimeline } from './timeline.js'

/**
 * @param {object} state — snapshot da carreira
 */
export function getPlayerProfileView(state = {}) {
  const player = state.player
  if (!player) {
    return {
      available: false,
      version: PLAYER_PROFILE_VERSION,
      message: 'Jogador indisponível — inicie a carreira.',
    }
  }

  const archetypeId = state.archetypeId ?? player.arquetipo
  const arch = ARCHETYPES[archetypeId] ?? null
  const team = getTeamById(state.currentTeamId)
  const pid = player.id ?? 'career_player'

  const achievements = getAchievementsView(state)
  const analytics = getAnalyticsView(state)
  const contract = getContractView(state)
  const dna = getDnaView(state)
  const history = getHistoryView(state.leagueHistory)
  const injury = getInjuryView(state)
  const legacy = getLegacyView(state)
  const story = getStoryView(state)

  const personality = listPersonalityTraits(player)
  const tendencies = listTendencies(player)

  const badges = buildBadgesFromAchievements(achievements)
  const awards = filterPlayerAwards(history, {
    playerId: pid,
    teamId: state.currentTeamId,
    playerName: player.nome ?? state.playerName,
  })

  const evolution = buildEvolutionSeries({
    history: state.history,
    careerStats: state.careerStats,
    player,
  })

  const timeline = buildCareerTimeline({
    history: state.history,
    storyView: story,
    achievementsView: achievements,
    injuryView: injury,
  })

  return {
    available: true,
    version: PLAYER_PROFILE_VERSION,
    week: state.currentWeek ?? 1,
    seasonNumber: state.currentSeason ?? 1,
    identity: {
      id: pid,
      nome: player.nome ?? state.playerName ?? 'Jogador',
      posicao: player.posicao,
      idade: player.idade,
      overall: player.overall,
      potencial: player.potencial,
      popularidade: player.popularidade ?? null,
      arquetipo: archetypeId,
      arquetipoLabel: arch?.label ?? archetypeId,
      arquetipoTagline: arch?.tagline ?? null,
      arquetipoDescription: arch?.description ?? null,
      teamId: state.currentTeamId,
      teamShort: team?.short ?? null,
      teamName: team?.name ?? null,
      initials: initials(player.nome ?? state.playerName),
      photoPlaceholder: true,
    },
    personality,
    dna: {
      available: dna.available !== false,
      traits: dna.traits ?? [],
      dominant: dna.dominant ?? [],
      summary: dna.summary ?? null,
      maxDrift: dna.maxDrift ?? null,
    },
    tendencies,
    badges,
    achievements: {
      unlockedCount: achievements.unlockedCount,
      total: achievements.total,
      percent: achievements.percent,
      recent: (achievements.recent ?? []).slice(
        0,
        PLAYER_PROFILE_LIMITS.achievements,
      ),
      inProgress: (achievements.inProgress ?? []).slice(0, 6),
      categories: achievements.categories ?? [],
    },
    contract: {
      contract: contract.contract,
      pendingOffer: contract.pendingOffer,
      history: (contract.history ?? []).slice(0, 6),
    },
    injury: {
      healthy: injury.healthy,
      active: injury.active,
      profile: injury.profile,
      history: (injury.history ?? []).slice(0, PLAYER_PROFILE_LIMITS.injuries),
    },
    awards,
    careerStats: {
      meta: state.careerStats ?? {},
      analytics: analytics.careerPlayer,
      progression: state.progression
        ? {
            level: state.progression.level,
            xp: state.progression.xp,
            xpToNext: state.progression.xpToNext,
            evolutionPoints: state.progression.evolutionPoints,
          }
        : null,
      legacy: legacy.career
        ? {
            score: legacy.career.score,
            tier: legacy.career.tier,
            tierLabel: legacy.career.tierLabel ?? legacy.career.tier,
          }
        : null,
    },
    charts: {
      radar: buildAttributeRadar(player),
      attributes: buildDetailedAttributes(player),
      tendencies: buildTendencyBars(player),
      evolution,
    },
    timeline,
    historico: {
      weeksPlayed: state.careerStats?.weeksPlayed ?? 0,
      weekLog: [...(state.history ?? [])]
        .reverse()
        .slice(0, 12)
        .map((h) => ({
          season: h.season,
          week: h.week,
          activityLabel: h.activityLabel,
          at: h.at,
        })),
      storyOpen: (story.openChains ?? []).slice(0, 4),
    },
    sources: {
      identity: 'Career · Archetypes',
      personality: 'Personality Engine',
      dna: 'DNA Engine',
      tendencies: 'player.tendencias',
      badges: 'Achievement Engine',
      achievements: 'Achievement Engine',
      contract: 'Contract Engine',
      injury: 'Injury Engine',
      awards: 'History Engine',
      stats: 'Analytics · careerStats · Progression · Legacy',
      charts: 'Attributes · Tendencies · Save history',
      timeline: 'Save history · Story · Achievements · Injury',
    },
  }
}

function buildBadgesFromAchievements(achievements) {
  const unlocked = []
  for (const cat of Object.values(achievements.byCategory ?? {})) {
    for (const item of cat.items ?? []) {
      if (item.status !== 'unlocked') continue
      unlocked.push({
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category,
        categoryLabel: cat.label,
        unlockedAt: item.unlockedAt ?? null,
      })
    }
  }
  unlocked.sort((a, b) => (b.unlockedAt ?? 0) - (a.unlockedAt ?? 0))
  return {
    count: unlocked.length,
    items: unlocked.slice(0, PLAYER_PROFILE_LIMITS.badges),
    note: 'Badges = conquistas desbloqueadas (Achievement Engine).',
  }
}

function filterPlayerAwards(history, { playerId, teamId, playerName }) {
  const name = String(playerName ?? '').toLowerCase()
  const mvps = (history.mvps ?? []).filter(
    (m) =>
      m.teamId === teamId ||
      (m.detail && name && String(m.detail).toLowerCase().includes(name)) ||
      (m.playerName &&
        name &&
        String(m.playerName).toLowerCase().includes(name)),
  )
  const awards = (history.awards ?? []).filter(
    (a) =>
      a.teamId === teamId ||
      a.playerId === playerId ||
      (a.detail && name && String(a.detail).toLowerCase().includes(name)) ||
      (a.playerName &&
        name &&
        String(a.playerName).toLowerCase().includes(name)),
  )
  const gameMvp = (history.topGameMvps ?? []).find((x) => x.id === playerId)
  const tripleDoubles = (history.topTripleDoubles ?? []).find(
    (x) => x.id === playerId,
  )

  return {
    mvps: mvps.slice(0, PLAYER_PROFILE_LIMITS.awards),
    awards: awards.slice(0, PLAYER_PROFILE_LIMITS.awards),
    gameMvpCount: gameMvp?.count ?? 0,
    tripleDoubleCount: tripleDoubles?.count ?? 0,
  }
}

function initials(name) {
  return String(name ?? '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?'
}
