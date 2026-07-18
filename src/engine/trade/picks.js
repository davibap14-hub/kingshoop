import {
  PICK_BASE_VALUE,
  PICK_STANDINGS_SWING,
  TRADEABLE_PICK_OFFSETS,
  TRADEABLE_PICK_ROUNDS,
} from '../../data/trade/constants.js'
import { TEAMS } from '../../data/teams'
import { clamp } from '../utils/math'

/**
 * ID estável de escolha de draft negociável.
 */
export function pickAssetId(originalTeamId, seasonOffset, round) {
  return `pick_${originalTeamId}_y${seasonOffset}_r${round}`
}

export function createPickAsset(
  originalTeamId,
  seasonOffset,
  round,
  ownerTeamId = null,
) {
  return {
    id: pickAssetId(originalTeamId, seasonOffset, round),
    originalTeamId,
    ownerTeamId: ownerTeamId ?? originalTeamId,
    seasonOffset,
    round,
  }
}

/**
 * Gera ledger inicial (rounds × offsets) para todas as franquias.
 */
export function buildInitialDraftPicks(teams = TEAMS) {
  const picks = []
  for (const team of teams) {
    for (const offset of TRADEABLE_PICK_OFFSETS) {
      for (const round of TRADEABLE_PICK_ROUNDS) {
        picks.push(createPickAsset(team.id, offset, round))
      }
    }
  }
  return picks
}

/**
 * Hidrata / completa picks faltantes sem apagar trocas já feitas.
 */
export function hydrateDraftPicks(existing, teams = TEAMS) {
  const map = new Map()
  for (const p of existing ?? []) {
    if (p?.id && p.originalTeamId != null && p.round != null) {
      map.set(p.id, {
        id: p.id,
        originalTeamId: p.originalTeamId,
        ownerTeamId: p.ownerTeamId ?? p.originalTeamId,
        seasonOffset: p.seasonOffset ?? 0,
        round: p.round,
      })
    }
  }

  for (const team of teams) {
    for (const offset of TRADEABLE_PICK_OFFSETS) {
      for (const round of TRADEABLE_PICK_ROUNDS) {
        const id = pickAssetId(team.id, offset, round)
        if (!map.has(id)) {
          map.set(id, createPickAsset(team.id, offset, round))
        }
      }
    }
  }

  return [...map.values()].sort((a, b) => a.id.localeCompare(b.id))
}

/**
 * Após draft / nova temporada:
 * - descarta picks do draft que acabou (offset 0)
 * - Y+1 vira Y+0 mantendo dono
 * - cria novo Y+1 para cada franquia (dono = original)
 */
export function rollDraftPicksAfterSeason(picks, teams = TEAMS) {
  const ownership = new Map()
  for (const p of picks ?? []) {
    if ((p.seasonOffset ?? 0) === 1) {
      ownership.set(`${p.originalTeamId}_r${p.round}`, p.ownerTeamId)
    }
  }

  const next = []
  for (const team of teams) {
    for (const round of TRADEABLE_PICK_ROUNDS) {
      const owner = ownership.get(`${team.id}_r${round}`) ?? team.id
      next.push(createPickAsset(team.id, 0, round, owner))
      next.push(createPickAsset(team.id, 1, round, team.id))
    }
  }
  return next
}

export function getTeamPicks(picks, teamId) {
  return (picks ?? []).filter((p) => p.ownerTeamId === teamId)
}

export function findPick(picks, pickId) {
  return (picks ?? []).find((p) => p.id === pickId) ?? null
}

/**
 * Valor de mercado da escolha (chips).
 */
export function calcPickMarketValue(pick, seasonState = {}) {
  if (!pick) return 0
  const round = pick.round ?? 1
  const offset = pick.seasonOffset ?? 0
  const base = PICK_BASE_VALUE[round]?.[offset] ?? (round === 1 ? 40 : 18)

  const standing = seasonState.standings?.[pick.originalTeamId]
  const wins = standing?.wins ?? 0
  const losses = standing?.losses ?? 0
  const games = Math.max(1, wins + losses)
  const winPct = wins / games
  const standingsBoost = (0.5 - winPct) * 2 * PICK_STANDINGS_SWING

  return clamp(Math.round(base + standingsBoost), 8, 95)
}

/**
 * Resolve quem escolhe em um slot natural do draft.
 */
export function resolvePickOwner(
  picks,
  originalTeamId,
  round,
  seasonOffset = 0,
) {
  const asset = (picks ?? []).find(
    (p) =>
      p.originalTeamId === originalTeamId &&
      p.round === round &&
      (p.seasonOffset ?? 0) === seasonOffset,
  )
  return asset?.ownerTeamId ?? originalTeamId
}

export function transferPicks(picks, pickIds, toTeamId) {
  const idSet = new Set(pickIds)
  return (picks ?? []).map((p) =>
    idSet.has(p.id) ? { ...p, ownerTeamId: toTeamId } : p,
  )
}
