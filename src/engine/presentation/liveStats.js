/**
 * Estatísticas em tempo real reconstruídas a partir do Play-by-Play.
 * Somente leitura — não altera box score da simulação.
 */

/**
 * Constrói snapshots cumulativos alinhados a cada evento PBP.
 * @returns {Array<{ seq, score, homeLead, margin, eventIndex }>}
 */
export function buildLiveStatTimeline(match) {
  const events = match?.playByPlay ?? []
  const timeline = []
  let prevLead = null

  for (let i = 0; i < events.length; i += 1) {
    const e = events[i]
    const home = e.score?.home ?? 0
    const away = e.score?.away ?? 0
    const margin = home - away
    const lead =
      margin > 0 ? 'home' : margin < 0 ? 'away' : 'tie'
    const leadChange = prevLead != null && lead !== 'tie' && lead !== prevLead

    timeline.push({
      eventIndex: i,
      seq: e.seq ?? i + 1,
      quarter: e.quarter,
      clock: e.clock,
      score: { home, away },
      margin: Math.abs(margin),
      lead,
      leadChange,
      points: e.points ?? 0,
      action: e.action,
    })

    if (lead !== 'tie') prevLead = lead
  }

  return timeline
}

/**
 * Snapshot de placar / totais de equipe no fim (espelho da sim, só leitura).
 */
export function buildFinalLiveStats(match) {
  return {
    score: {
      home: match?.homeScore ?? match?.placarFinal?.home ?? 0,
      away: match?.awayScore ?? match?.placarFinal?.away ?? 0,
    },
    teamTotals: {
      points: match?.pontos ?? null,
      rebounds: match?.rebotes ?? null,
      assists: match?.assistencias ?? null,
      steals: match?.roubos ?? null,
      blocks: match?.tocos ?? null,
      turnovers: match?.turnovers ?? null,
      fouls: match?.faltas ?? null,
    },
    possessionCount: match?.possessionCount ?? 0,
    overtime: Boolean(match?.overtime),
    mvp: match?.mvp
      ? {
          id: match.mvp.id,
          name: match.mvp.nome,
          teamShort: match.mvp.teamShort,
          points: match.mvp.points,
          rebounds: match.mvp.rebounds,
          assists: match.mvp.assists,
        }
      : null,
  }
}

export function liveStatsAt(timeline, eventIndex) {
  if (!timeline?.length) return null
  const idx = Math.max(0, Math.min(eventIndex, timeline.length - 1))
  return timeline[idx]
}
