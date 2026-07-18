/**
 * Estado persistível da Analytics Engine.
 */

export function emptyCountingTotals() {
  return {
    games: 0,
    minutes: 0,
    pts: 0,
    reb: 0,
    orb: 0,
    drb: 0,
    ast: 0,
    stl: 0,
    blk: 0,
    tov: 0,
    pf: 0,
    fgm: 0,
    fga: 0,
    threePm: 0,
    threePa: 0,
    ftm: 0,
    fta: 0,
    teamFgm: 0,
    teamFga: 0,
    teamFta: 0,
    teamTov: 0,
    teamReb: 0,
    teamOrb: 0,
    oppReb: 0,
    oppPoints: 0,
    teamPossessions: 0,
    oppPossessions: 0,
    pieNumer: 0,
    pieDenom: 0,
    winShares: 0,
  }
}

export function emptyAdvancedAverages() {
  return {
    per: null,
    tsPct: null,
    efgPct: null,
    usgPct: null,
    astPct: null,
    rebPct: null,
    ortg: null,
    drtg: null,
    netRtg: null,
    winShares: null,
    pie: null,
  }
}

export function createPlayerAnalytics(overrides = {}) {
  return {
    playerId: overrides.playerId ?? null,
    playerName: overrides.playerName ?? null,
    teamId: overrides.teamId ?? null,
    season: overrides.season ?? null,
    totals: { ...emptyCountingTotals(), ...(overrides.totals ?? {}) },
    averages: { ...emptyAdvancedAverages(), ...(overrides.averages ?? {}) },
    lastGame: overrides.lastGame ?? null,
  }
}

export function createAnalyticsState(overrides = {}) {
  return {
    /** Totais / médias por jogador na temporada atual */
    season: {
      ...(overrides.season ?? {}),
    },
    /** Acumulado de carreira (não reseta no roll) */
    career: {
      ...(overrides.career ?? {}),
    },
    /** Snapshot da última semana processada */
    lastWeek: overrides.lastWeek ?? null,
    seasonNumber: overrides.seasonNumber ?? null,
    updatedAt: overrides.updatedAt ?? null,
  }
}
