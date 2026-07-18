import { GM_PERSONALITIES } from '../../data/gm/personalities'
import { playerDb } from '../../data/players'
import { getTeamById } from '../../data/teams'
import { ROSTER_SIZE_TARGET } from '../../data/gm/constants'
import { capPressure } from './cap'

export function resolvePlayer(gm, playerId) {
  const base =
    playerDb.getById(playerId) ??
    (gm.extraPlayers ?? []).find((p) => p.id === playerId) ??
    (gm.draftClass ?? []).find((p) => p.id === playerId) ??
    null

  if (!base) return null

  const ov = gm.playerOverrides?.[playerId]
  if (!ov) return base

  return {
    ...base,
    ...ov,
    fisico: { ...(base.fisico ?? {}), ...(ov.fisico ?? {}) },
    arremesso: { ...(base.arremesso ?? {}), ...(ov.arremesso ?? {}) },
    defesa: { ...(base.defesa ?? {}), ...(ov.defesa ?? {}) },
    qi: { ...(base.qi ?? {}), ...(ov.qi ?? {}) },
  }
}

/**
 * Analisa a situação da franquia para guiar o GM.
 */
export function analyzeFranchise(gm, teamId, seasonState = {}) {
  const team = getTeamById(teamId)
  const personalityId = gm.personalities?.[teamId] ?? 'competitiva'
  const personality =
    GM_PERSONALITIES[personalityId] ?? GM_PERSONALITIES.competitiva
  const rosterIds = gm.rosters?.[teamId] ?? []
  const roster = rosterIds.map((id) => resolvePlayer(gm, id)).filter(Boolean)

  const standing = seasonState.standings?.[teamId]
  const wins = standing?.wins ?? 0
  const losses = standing?.losses ?? 0
  const games = Math.max(1, wins + losses)
  const winPct = wins / games

  const avgOvr =
    roster.length > 0
      ? roster.reduce((s, p) => s + (p.overall ?? 0), 0) / roster.length
      : 0
  const avgAge =
    roster.length > 0
      ? roster.reduce((s, p) => s + (p.idade ?? 28), 0) / roster.length
      : 28
  const avgPot =
    roster.length > 0
      ? roster.reduce((s, p) => s + (p.potencial ?? 0), 0) / roster.length
      : 0

  const cap = capPressure(gm.contracts, teamId)
  const needs = detectNeeds(roster)

  let mode = 'compete'
  if (winPct < 0.35 || avgOvr < 72) mode = 'rebuild'
  else if (winPct >= 0.6 && avgOvr >= 78) mode = 'contend'
  else if (avgAge <= 24.5 && avgPot >= 82) mode = 'develop'
  else if (cap.overCap || cap.usagePct > 95) mode = 'cap_crunch'

  return {
    teamId,
    teamShort: team?.short ?? teamId,
    personalityId,
    personality,
    roster,
    rosterSize: roster.length,
    rosterGap: ROSTER_SIZE_TARGET - roster.length,
    avgOvr: Math.round(avgOvr * 10) / 10,
    avgAge: Math.round(avgAge * 10) / 10,
    avgPot: Math.round(avgPot * 10) / 10,
    wins,
    losses,
    winPct: Math.round(winPct * 1000) / 1000,
    cap,
    needs,
    mode,
    phase: seasonState.phase ?? 'regular',
  }
}

function detectNeeds(roster) {
  const counts = { PG: 0, SG: 0, SF: 0, PF: 0, C: 0 }
  for (const p of roster) {
    if (counts[p.posicao] != null) counts[p.posicao] += 1
  }
  return Object.entries(counts)
    .filter(([, n]) => n < 1)
    .map(([pos]) => pos)
}
