/**
 * Power Ranking — derivado das standings da Season Engine.
 * Sem simulação nova; só ordenação determinística.
 */

import { getTeamById } from '../../data/teams'

export function buildPowerRankings(standings = {}, limit = 15) {
  const rows = Object.values(standings ?? {})
  if (!rows.length) return []

  const ranked = rows
    .map((row) => {
      const games = Math.max(1, (row.wins ?? 0) + (row.losses ?? 0))
      const winPct = (row.wins ?? 0) / games
      const diff = (row.pointsFor ?? 0) - (row.pointsAgainst ?? 0)
      const avgDiff = diff / games
      const score =
        winPct * 1000 +
        avgDiff * 12 +
        (row.wins ?? 0) * 2 +
        Math.max(0, row.streak ?? 0) * 3
      const team = getTeamById(row.teamId)
      return {
        teamId: row.teamId,
        teamShort: row.short ?? team?.short ?? row.teamId,
        teamName: row.name ?? team?.name ?? row.teamId,
        conference: row.conference ?? team?.conference ?? null,
        wins: row.wins ?? 0,
        losses: row.losses ?? 0,
        winPct: Math.round(winPct * 1000) / 1000,
        pointDiff: diff,
        streakLabel: row.streakLabel ?? '—',
        score: Math.round(score * 10) / 10,
      }
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if (b.winPct !== a.winPct) return b.winPct - a.winPct
      if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff
      return String(a.teamId).localeCompare(String(b.teamId))
    })
    .slice(0, limit)
    .map((row, i) => ({
      rank: i + 1,
      ...row,
      blurb: buildRankBlurb(row, i + 1),
    }))

  return ranked
}

function buildRankBlurb(row, rank) {
  if (rank === 1) {
    return `${row.teamShort} lidera o Power Ranking (${row.wins}-${row.losses}).`
  }
  if (row.streakLabel && row.streakLabel.includes('V') && Number(row.streakLabel) >= 3) {
    return `${row.teamShort} em sequência ${row.streakLabel}.`
  }
  if ((row.pointDiff ?? 0) >= 40) {
    return `${row.teamShort} com saldo forte (+${row.pointDiff}).`
  }
  return `${row.teamShort} · ${row.wins}-${row.losses} · diff ${row.pointDiff >= 0 ? '+' : ''}${row.pointDiff}`
}
