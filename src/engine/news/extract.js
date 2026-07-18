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
    expansion: gmSummary.expansion
      ? { expanded: true }
      : decisions.some((d) => d.type === 'expansion')
        ? { expanded: true }
        : null,
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

  // Escala da Simulation Engine (placares ~40–60): limiares relativos
  const out = []
  for (const p of rows) {
    const pts = p.points ?? 0
    const reb = p.rebounds ?? 0
    const ast = p.assists ?? 0
    const triple = pts >= 8 && reb >= 8 && ast >= 8

    if (triple) {
      out.push({
        type: 'triple_double',
        playerId: p.id,
        playerName: p.nome,
        teamId: p.teamId,
        teamShort: p.teamShort,
        points: pts,
        rebounds: reb,
        assists: ast,
        ...meta,
      })
    }

    if (pts >= 22) {
      out.push({
        type: 'scoring_burst',
        playerId: p.id,
        playerName: p.nome,
        teamId: p.teamId,
        teamShort: p.teamShort,
        points: pts,
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
  if (margin >= 18) {
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
