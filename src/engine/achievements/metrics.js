/**
 * Extrai métricas de progresso a partir do estado de carreira.
 */

import { createAchievementsState } from './state.js'

function careerPlayerId(state) {
  return state.player?.id ?? 'career_player'
}

function teamStanding(state) {
  const teamId = state.currentTeamId
  return state.season?.standings?.[teamId] ?? null
}

/**
 * Constrói mapa metric → valor atual (para todo o catálogo).
 */
export function buildAchievementMetrics(state = {}, effects = null) {
  const stats = state.careerStats ?? {}
  const status = state.status ?? {}
  const rel = state.relationships ?? {}
  const finance = state.finance ?? {}
  const story = state.story ?? {}
  const history = state.leagueHistory ?? {}
  const ach = createAchievementsState(state.achievements)
  const counters = ach.counters ?? {}
  const pid = careerPlayerId(state)
  const analytics =
    state.analytics?.season?.[pid] ?? state.analytics?.career?.[pid] ?? null
  const careerTotals =
    history.careerTotals?.[pid] ??
    history.careerTotals?.[state.playerName] ??
    {}

  const standing = teamStanding(state)
  const seasonWins = standing?.wins ?? 0
  const seasonLosses = standing?.losses ?? 0
  const seasonGames = seasonWins + seasonLosses
  const winPct = seasonGames > 0 ? seasonWins / seasonGames : 0

  const awards = history.awards ?? []
  const records = history.records ?? {}
  const recordsCount = Object.values(records).filter(Boolean).length

  const teamsPlayed = new Set(counters.teamsPlayed ?? [])
  if (state.currentTeamId) teamsPlayed.add(state.currentTeamId)

  const storyThemesDone = new Set()
  for (const h of story.history ?? []) {
    if (h.theme && h.continued === false) storyThemesDone.add(h.theme)
  }
  // também conta temas com cadeia fechada
  for (const c of story.chains ?? []) {
    if (!c.open && c.theme) storyThemesDone.add(c.theme)
  }

  const chemistryPairs = Object.keys(state.gm?.chemistry?.pairs ?? {}).length
  const scoutingReports = Object.keys(
    state.gm?.scouting?.reports ?? state.gm?.scouting?.prospectReports ?? {},
  ).length

  const metrics = {
    weeksPlayed: stats.weeksPlayed ?? 0,
    level: state.progression?.level ?? 1,
    peakOverall: Math.max(stats.peakOverall ?? 0, state.player?.overall ?? 0),
    peakPopularidade: Math.max(
      stats.peakPopularidade ?? 0,
      status.popularidade ?? 0,
    ),
    storiesResolved: story.storiesResolved ?? stats.eventsResolved ?? 0,
    trainingWeeks: stats.trainingWeeks ?? 0,
    restWeeks: stats.restWeeks ?? 0,
    mediaWeeks: stats.mediaWeeks ?? 0,
    currentSeason: state.currentSeason ?? 1,
    seasonWins,
    seasonGames,
    seasonsArchived: history.seasons?.length ?? 0,
    seasonWinPct60: seasonGames >= 10 && winPct >= 0.6 ? 1 : 0,
    seasonWinPct75: seasonGames >= 12 && winPct >= 0.75 ? 1 : 0,
    winStreak: Math.max(0, standing?.streak ?? 0),
    bestGamePoints: counters.bestGamePoints ?? 0,
    bestGameAssists: counters.bestGameAssists ?? 0,
    bestGameRebounds: counters.bestGameRebounds ?? 0,
    bestGameSteals: counters.bestGameSteals ?? 0,
    bestGameBlocks: counters.bestGameBlocks ?? 0,
    bestMarginWin: counters.bestMarginWin ?? 0,
    gameMvps: counters.gameMvps ?? history.gameMvpTotals?.[pid] ?? 0,
    tripleDoubles:
      counters.tripleDoubles ?? history.tripleDoubleTotals?.[pid] ?? 0,
    dinheiro: status.dinheiro ?? 0,
    peakPatrimonio: Math.max(
      stats.peakPatrimonio ?? 0,
      finance.patrimonio ?? 0,
    ),
    activeSponsors: (state.sponsorships ?? []).length,
    totalSalaryEarned: stats.totalSalaryEarned ?? 0,
    totalSponsorEarned: stats.totalSponsorEarned ?? 0,
    luxuryLevel: finance.luxuryLevel ?? 0,
    coachRel: rel.coach ?? status.relTreinador ?? 0,
    teammatesRel: rel.teammates ?? status.relCompanheiros ?? 0,
    fansRel: rel.fans ?? 0,
    pressRel: rel.press ?? 0,
    sponsorsRel: rel.sponsors ?? 0,
    gmRel: rel.gm ?? 0,
    agentRel: rel.agent ?? 0,
    allRels70:
      (rel.coach ?? 0) >= 70 &&
      (rel.teammates ?? 0) >= 70 &&
      (rel.fans ?? 0) >= 70 &&
      (rel.press ?? 0) >= 70 &&
      (rel.sponsors ?? 0) >= 70 &&
      (rel.gm ?? 0) >= 70
        ? 1
        : 0,
    chemistryPairs,
    championships: history.champions?.length ?? 0,
    // Dynasty Engine
    dynastiesRecognized: history.dynasties?.length ?? 0,
    dynastyActive: state.dynasty?.active?.[state.currentTeamId] ? 1 : 0,
    dynastyTierRank: (() => {
      const t = state.dynasty?.active?.[state.currentTeamId]?.tier
      if (t === 'super') return 3
      if (t === 'dynasty') return 2
      if (t === 'rising') return 1
      return 0
    })(),
    dynastyTitlesBest: Math.max(
      0,
      ...(history.dynasties ?? []).map((d) => d.criteria?.titles ?? 0),
    ),
    seasonMvps: history.mvps?.length ?? 0,
    awardsCount: awards.length,
    hofBallots: history.hofBallots?.length ?? 0,
    hofInductees: history.hallOfFame?.length ?? 0,
    finalsMvps: awards.filter((a) => a.type === 'finals_mvp').length,
    dpoyCount: awards.filter((a) => a.type === 'dpoy').length,
    careerPoints: Math.max(careerTotals.points ?? 0, analytics?.totals?.pts ?? 0),
    careerAssists: Math.max(
      careerTotals.assists ?? 0,
      analytics?.totals?.ast ?? 0,
    ),
    careerRebounds: Math.max(
      careerTotals.rebounds ?? 0,
      analytics?.totals?.reb ?? 0,
    ),
    seasonPer: analytics?.averages?.per ?? 0,
    seasonTsPct: analytics?.averages?.tsPct ?? 0,
    seasonPie: analytics?.averages?.pie ?? 0,
    seasonWinShares: analytics?.averages?.winShares ?? 0,
    seasonNetPositive: (analytics?.averages?.netRtg ?? -1) > 0 ? 1 : 0,
    seasonUsg25: (analytics?.averages?.usgPct ?? 0) >= 25 ? 1 : 0,
    teamsPlayed: teamsPlayed.size,
    storyFlagCount: Object.keys(story.flags ?? {}).length,
    storyChainsTotal: (story.chains ?? []).length,
    injuryRecoveries: counters.injuryRecoveries ?? 0,
    investmentsCount: Object.keys(finance.investments ?? {}).length ||
      (Array.isArray(finance.investments) ? finance.investments.length : 0),
    recordsCount,
    analyticsGames: analytics?.totals?.games ?? 0,
    scoutingReports,
    achievementsUnlocked: Object.keys(ach.unlocked ?? {}).length,
  }

  for (const teamId of teamsPlayed) {
    metrics[`playedTeam_${teamId}`] = 1
  }
  for (const theme of storyThemesDone) {
    metrics[`storyTheme_${theme}`] = 1
  }

  // streak: standing.streak may be negative for losses
  if (typeof standing?.streak === 'number' && standing.streak > 0) {
    metrics.winStreak = standing.streak
  }

  // injury recovery from effects
  if (effects?.injuryHealed) {
    metrics.injuryRecoveries = (counters.injuryRecoveries ?? 0) + 1
  }

  return metrics
}

/**
 * Atualiza contadores a partir dos resultados da semana (partidas).
 */
export function updateAchievementCounters(achievements, state, effects = null) {
  const next = createAchievementsState(achievements)
  const counters = { ...next.counters }
  const teamId = state.currentTeamId
  const pid = careerPlayerId(state)
  const playerName = state.playerName ?? state.player?.nome

  const teams = new Set(counters.teamsPlayed ?? [])
  if (teamId) teams.add(teamId)
  counters.teamsPlayed = [...teams]

  if (effects?.injuryHealed) {
    counters.injuryRecoveries = (counters.injuryRecoveries ?? 0) + 1
  }

  const weekResults =
    effects?.season?.weekResults ??
    state.season?.weekResults ??
    state.lastWeekResult?.season?.weekResults ??
    []

  for (const result of weekResults) {
    // margem
    if (result.winnerId === teamId) {
      const margin = Math.abs((result.homeScore ?? 0) - (result.awayScore ?? 0))
      counters.bestMarginWin = Math.max(counters.bestMarginWin ?? 0, margin)
    }

    // MVP
    const mvpId = result.mvpStats?.id
    const mvpName = result.mvpStats?.nome ?? result.mvp
    if (mvpId === pid || mvpName === playerName) {
      counters.gameMvps = (counters.gameMvps ?? 0) + 1
    }

    for (const line of result.boxSummary ?? []) {
      const isPlayer =
        line.playerId === pid ||
        line.playerName === playerName ||
        line.playerId === 'career_player'
      if (!isPlayer) continue

      counters.bestGamePoints = Math.max(
        counters.bestGamePoints ?? 0,
        line.points ?? 0,
      )
      counters.bestGameAssists = Math.max(
        counters.bestGameAssists ?? 0,
        line.assists ?? 0,
      )
      counters.bestGameRebounds = Math.max(
        counters.bestGameRebounds ?? 0,
        line.rebounds ?? 0,
      )
      counters.bestGameSteals = Math.max(
        counters.bestGameSteals ?? 0,
        line.steals ?? 0,
      )
      counters.bestGameBlocks = Math.max(
        counters.bestGameBlocks ?? 0,
        line.blocks ?? 0,
      )

      const pts = line.points ?? 0
      const ast = line.assists ?? 0
      const reb = line.rebounds ?? 0
      if (pts >= 10 && ast >= 10 && reb >= 10) {
        counters.tripleDoubles = (counters.tripleDoubles ?? 0) + 1
      }
    }

    // advanced lines
    for (const row of result.analytics?.players ?? []) {
      if (row.playerId !== pid && row.playerName !== playerName) continue
      // already covered via boxSummary usually
    }
  }

  return {
    ...next,
    counters,
  }
}
