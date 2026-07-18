/**
 * Interesse de franquias em free agents (Franchise AI + Scouting).
 */

import { FA_INTEREST_TOP } from '../../data/freeAgency'
import { TEAMS, getTeamById } from '../../data/teams'
import { scoreFa } from '../franchise/decide'
import { resolveFranchiseObjective } from '../franchise/objective'
import { getReport } from '../scouting/state.js'

export function buildFranchiseInterest(gm, player, seasonState = {}, opts = {}) {
  if (!gm || !player) return []

  const limit = opts.limit ?? FA_INTEREST_TOP
  const playerTeamId = opts.playerTeamId ?? null
  const rows = []

  for (const team of TEAMS) {
    const resolved = resolveFranchiseObjective(gm, team.id, seasonState)
    const sit = {
      ...resolved.situation,
      objectiveId: resolved.objectiveId,
      objective: resolved.objective,
      weights: resolved.weights,
      personality: {
        ...resolved.situation.personality,
        weights: resolved.weights,
        label: resolved.label,
      },
    }
    const report = gm.scouting
      ? getReport(gm.scouting, team.id, player.id)
      : null
    const raw = scoreFa(sit, player, report)
    rows.push({
      teamId: team.id,
      teamShort: team.short,
      teamName: team.name,
      score: Math.round(raw * 10) / 10,
      needs: sit.needs ?? [],
      fitsNeed: (sit.needs ?? []).includes(player.posicao),
      mode: sit.mode ?? 'compete',
      objectiveId: resolved.objectiveId,
      isPlayerTeam: team.id === playerTeamId,
    })
  }

  rows.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.teamId.localeCompare(b.teamId)
  })

  const max = rows[0]?.score ?? 1
  const min = rows[rows.length - 1]?.score ?? 0
  const span = Math.max(1, max - min)

  return rows.slice(0, limit).map((row) => {
    const normalized = Math.round(((row.score - min) / span) * 100)
    const level =
      normalized >= 75 ? 'hot' : normalized >= 45 ? 'warm' : normalized >= 20 ? 'cold' : 'none'
    return {
      ...row,
      interest: normalized,
      level,
      blurb: buildInterestBlurb(row, level),
    }
  })
}

export function interestForTeam(interestRows, teamId) {
  return interestRows.find((r) => r.teamId === teamId) ?? null
}

function buildInterestBlurb(row, level) {
  const short = getTeamById(row.teamId)?.short ?? row.teamShort
  if (level === 'hot') {
    return row.fitsNeed
      ? `${short} prioriza a posição — favorito no mercado.`
      : `${short} está agressivo por talento de impacto.`
  }
  if (level === 'warm') {
    return `${short} monitora o nome; oferta possível.`
  }
  if (level === 'cold') {
    return `${short} com interesse limitado.`
  }
  return `${short} fora da corrida por agora.`
}
