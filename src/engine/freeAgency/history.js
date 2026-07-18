/**
 * Histórico de um free agent a partir da History Engine + log do GM.
 */

export function buildFaHistory(playerId, leagueHistory = {}, gm = {}) {
  if (!playerId) return { career: null, seasons: [], moves: [] }

  const totals = leagueHistory.careerTotals?.[playerId] ?? null
  const seasons = []

  for (const entry of leagueHistory.leaders ?? []) {
    const hits = []
    for (const [cat, rows] of Object.entries(entry)) {
      if (cat === 'season' || !Array.isArray(rows)) continue
      const found = rows.find((r) => r.playerId === playerId || r.id === playerId)
      if (found) {
        hits.push({
          category: cat,
          rank: rows.indexOf(found) + 1,
          value: found.value ?? found.avg ?? found.total ?? null,
        })
      }
    }
    if (hits.length) {
      seasons.push({ season: entry.season, highlights: hits })
    }
  }

  const moves = []
  for (const d of gm.lastWeekDecisions ?? []) {
    if (d.playerId === playerId && (d.type === 'sign' || d.type === 'release' || d.type === 'renew')) {
      moves.push({
        type: d.type,
        teamId: d.teamId,
        reason: d.reason ?? null,
        yearlySalary: d.yearlySalary ?? null,
        at: d.at ?? null,
      })
    }
  }
  for (const d of [...(gm.log ?? [])].reverse()) {
    if (
      d.playerId === playerId &&
      (d.type === 'sign' || d.type === 'release' || d.type === 'renew') &&
      !moves.some((m) => m.at === d.at && m.type === d.type)
    ) {
      moves.push({
        type: d.type,
        teamId: d.teamId,
        reason: d.reason ?? null,
        yearlySalary: d.yearlySalary ?? null,
        at: d.at ?? null,
      })
    }
    if (moves.length >= 8) break
  }

  const records = (leagueHistory.records ?? []).filter(
    (r) => r.playerId === playerId || r.holderId === playerId,
  )

  return {
    career: totals
      ? {
          points: totals.points ?? 0,
          rebounds: totals.rebounds ?? 0,
          assists: totals.assists ?? 0,
          games: totals.games ?? totals.gp ?? 0,
        }
      : null,
    seasons: seasons.slice(-6).reverse(),
    moves: moves.slice(0, 8),
    records: records.slice(0, 4),
    empty: !totals && !seasons.length && !moves.length && !records.length,
  }
}
