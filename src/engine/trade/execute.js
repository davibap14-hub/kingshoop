import { resolvePlayer } from '../gm/situation.js'
import { getTeamPicks, transferPicks } from './picks.js'
import {
  buildPlayerAsset,
  packagePickIds,
  packagePlayerIds,
  validateTrade,
} from './rules.js'

function cloneGm(gm) {
  return {
    ...gm,
    rosters: Object.fromEntries(
      Object.entries(gm.rosters ?? {}).map(([k, v]) => [k, [...v]]),
    ),
    freeAgents: [...(gm.freeAgents ?? [])],
    contracts: { ...(gm.contracts ?? {}) },
    draftClass: [...(gm.draftClass ?? [])],
    draftOrder: [...(gm.draftOrder ?? [])],
    draftPicks: (gm.draftPicks ?? []).map((p) => ({ ...p })),
    extraPlayers: [...(gm.extraPlayers ?? [])],
    playerOverrides: { ...(gm.playerOverrides ?? {}) },
    log: [...(gm.log ?? [])],
    lastTrades: [...(gm.lastTrades ?? [])],
  }
}

function labelAssets(assets) {
  const names = []
  for (const a of assets) {
    if (a.type === 'player') names.push(a.player?.nome ?? a.playerId)
    else {
      const p = a.pick
      names.push(
        `Pick R${p.round} Y+${p.seasonOffset} (${String(p.originalTeamId).toUpperCase()})`,
      )
    }
  }
  return names.join(', ')
}

/**
 * Executa troca multi-jogador + escolhas de draft.
 */
export function executeTrade(gm, proposal, opts = {}) {
  const {
    teamA,
    teamB,
    assetsA = [],
    assetsB = [],
    reason = 'Troca',
    sitA = null,
    sitB = null,
    seasonState = {},
  } = proposal

  let validation = opts.validation ?? null
  if (sitA && sitB) {
    validation = validateTrade(
      gm,
      { teamA, teamB, assetsA, assetsB },
      sitA,
      sitB,
      seasonState,
    )
    if (!validation.ok) {
      return { ok: false, gm, decision: null, reasons: validation.reasons }
    }
  }

  const next = cloneGm(gm)
  const playersA = packagePlayerIds(assetsA)
  const playersB = packagePlayerIds(assetsB)
  const picksA = packagePickIds(assetsA)
  const picksB = packagePickIds(assetsB)

  let rosterA = (next.rosters[teamA] ?? []).filter((id) => !playersA.includes(id))
  let rosterB = (next.rosters[teamB] ?? []).filter((id) => !playersB.includes(id))
  rosterA = [...rosterA, ...playersB]
  rosterB = [...rosterB, ...playersA]
  next.rosters[teamA] = rosterA
  next.rosters[teamB] = rosterB

  for (const id of playersA) {
    if (next.contracts[id]) {
      next.contracts[id] = { ...next.contracts[id], teamId: teamB }
    }
  }
  for (const id of playersB) {
    if (next.contracts[id]) {
      next.contracts[id] = { ...next.contracts[id], teamId: teamA }
    }
  }

  next.draftPicks = transferPicks(next.draftPicks, picksA, teamB)
  next.draftPicks = transferPicks(next.draftPicks, picksB, teamA)

  const sentLabel = labelAssets(assetsA)
  const recvLabel = labelAssets(assetsB)
  const firstOut = assetsA.find((a) => a.type === 'player')
  const firstIn = assetsB.find((a) => a.type === 'player')

  const decision = {
    type: 'trade',
    teamId: teamA,
    partnerId: teamB,
    playerId: firstOut?.playerId ?? picksA[0] ?? null,
    playerName: firstOut?.player?.nome ?? sentLabel,
    acquiredId: firstIn?.playerId ?? picksB[0] ?? null,
    acquiredName: firstIn?.player?.nome ?? recvLabel,
    sent: {
      players: playersA.map((id) => ({
        id,
        name: resolvePlayer(next, id)?.nome ?? id,
      })),
      picks: picksA,
    },
    received: {
      players: playersB.map((id) => ({
        id,
        name: resolvePlayer(next, id)?.nome ?? id,
      })),
      picks: picksB,
    },
    assetsSummary: `${sentLabel} ⇄ ${recvLabel}`,
    reason,
    fairness: validation?.fairness ?? null,
    surplusA: validation?.surplusA ?? null,
    surplusB: validation?.surplusB ?? null,
    at: Date.now(),
  }

  next.lastTrades = [...(next.lastTrades ?? []), decision].slice(-24)

  return { ok: true, gm: next, decision, reasons: [] }
}

/**
 * Compat — troca 1×1 legada (sem revalidar objetivos; caller valida).
 */
export function tradePlayers(
  gm,
  teamA,
  playerA,
  teamB,
  playerB,
  reason = 'Troca',
) {
  const a = buildPlayerAsset(gm, playerA)
  const b = buildPlayerAsset(gm, playerB)
  if (!a || !b) return { ok: false, gm, decision: null }

  // Soft ownership check only
  if (
    !(gm.rosters?.[teamA] ?? []).includes(playerA) ||
    !(gm.rosters?.[teamB] ?? []).includes(playerB)
  ) {
    return { ok: false, gm, decision: null }
  }

  return executeTrade(gm, {
    teamA,
    teamB,
    assetsA: [a],
    assetsB: [b],
    reason,
  })
}

export { getTeamPicks }
