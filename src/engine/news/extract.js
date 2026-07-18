/**
 * Extrai fatos estruturados da liga para o News Engine.
 */

export function collectWeekFacts({
  week,
  seasonNumber,
  playerTeamId,
  playerName,
  careerInjury,
  seasonSummary = {},
  gmSummary = {},
  gmState = {},
  previousSeason = {},
}) {
  const weekResults = seasonSummary.weekResults ?? []
  const leagueInjuries = seasonSummary.injuries ?? []
  const decisions = gmSummary.decisions ?? []
  const awards = seasonSummary.awards ?? null
  const champion = seasonSummary.champion ?? null
  const standings = seasonSummary.standingsSnapshot ?? {}
  const objectives = gmState.objectives ?? {}
  const prevObjectives = previousSeason?.objectives ?? {}

  return {
    week,
    seasonNumber,
    playerTeamId,
    playerName,
    careerInjury,
    weekResults,
    leagueInjuries,
    decisions,
    awards,
    champion,
    standings,
    objectives,
    objectiveChanges: diffObjectives(prevObjectives, objectives),
    phase: seasonSummary.phase ?? 'regular',
  }
}

function diffObjectives(prev = {}, next = {}) {
  const changes = []
  for (const [teamId, obj] of Object.entries(next)) {
    const before = prev[teamId]?.objectiveId
    if (before && before !== obj.objectiveId) {
      changes.push({
        teamId,
        from: before,
        to: obj.objectiveId,
        reason: obj.reason,
        label: obj.label,
      })
    }
  }
  return changes
}

/**
 * Extrai performances notáveis de um box score de partida.
 */
export function extractPerformances(match, meta = {}) {
  const home = match?.boxScore?.home
  const away = match?.boxScore?.away
  if (!home || !away) return []

  const rows = [
    ...home.players.map((p) => ({
      ...p,
      teamId: home.teamId,
      teamShort: home.teamShort,
    })),
    ...away.players.map((p) => ({
      ...p,
      teamId: away.teamId,
      teamShort: away.teamShort,
    })),
  ]

  const out = []
  for (const p of rows) {
    const triple =
      (p.points ?? 0) >= 10 &&
      (p.rebounds ?? 0) >= 10 &&
      (p.assists ?? 0) >= 10

    if (triple) {
      out.push({
        type: 'triple_double',
        playerId: p.id,
        playerName: p.nome,
        teamId: p.teamId,
        teamShort: p.teamShort,
        points: p.points,
        rebounds: p.rebounds,
        assists: p.assists,
        ...meta,
      })
    }

    if ((p.points ?? 0) >= 35) {
      out.push({
        type: 'scoring_burst',
        playerId: p.id,
        playerName: p.nome,
        teamId: p.teamId,
        teamShort: p.teamShort,
        points: p.points,
        ...meta,
      })
    }
  }

  if (match.mvp) {
    out.push({
      type: 'game_mvp',
      playerId: match.mvp.id,
      playerName: match.mvp.nome,
      teamId: match.mvp.teamId,
      teamShort: match.mvp.teamShort,
      points: match.mvp.points,
      rebounds: match.mvp.rebounds,
      assists: match.mvp.assists,
      ...meta,
    })
  }

  const margin = Math.abs((match.homeScore ?? 0) - (match.awayScore ?? 0))
  if (margin >= 25) {
    out.push({
      type: 'blowout',
      margin,
      winnerId: match.homeScore > match.awayScore ? meta.homeId : meta.awayId,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      ...meta,
    })
  }

  return out
}
