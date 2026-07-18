import {
  MIN_TRADE_AGGRESSION,
  TRADE_SEARCH_GET_PLAYERS,
  TRADE_SEARCH_GIVE_PLAYERS,
  TRADE_SEARCH_PARTNERS,
} from '../../data/trade/constants.js'
import { TEAMS } from '../../data/teams'
import { resolveFranchiseObjective } from '../franchise/objective.js'
import { analyzeFranchise } from '../gm/situation.js'
import { calcTradeWillingness } from '../personality/contracts.js'
import { executeTrade } from './execute.js'
import { calcPickMarketValue, getTeamPicks } from './picks.js'
import {
  buildPickAsset,
  buildPlayerAsset,
  validateTrade,
} from './rules.js'
import { calcContextualAssetValue } from './value.js'

/**
 * Negocia automaticamente a melhor troca realista para a franquia.
 * Determinístico — sem RNG.
 */
export function findBestNegotiatedTrade(gm, sit, seasonState = {}) {
  const w = sit.weights ?? {}
  if ((w.tradeAggression ?? 1) < MIN_TRADE_AGGRESSION) return null

  const partners = rankPartners(gm, sit, seasonState)
  let best = null

  for (const partner of partners) {
    const partnerResolved = resolveFranchiseObjective(
      gm,
      partner.id,
      seasonState,
    )
    const sitB = {
      ...partnerResolved.situation,
      objectiveId: partnerResolved.objectiveId,
      objective: partnerResolved.objective,
      weights: partnerResolved.weights,
      personality: {
        ...partnerResolved.situation.personality,
        weights: partnerResolved.weights,
        label: partnerResolved.label,
      },
    }

    const candidates = generatePackageCandidates(gm, sit, sitB, seasonState)
    for (const proposal of candidates) {
      const check = validateTrade(gm, proposal, sit, sitB, seasonState)
      if (!check.ok) continue

      const score =
        check.surplusA * 1.35 +
        check.surplusB * 0.55 +
        (w.tradeAggression ?? 1) * 8 +
        needBonus(sit, proposal.assetsB) -
        needLoss(sit, proposal.assetsA)

      if (!best || score > best.score) {
        best = {
          proposal: {
            ...proposal,
            sitA: sit,
            sitB,
            seasonState,
            reason: `${sit.objective?.label ?? sit.objectiveId}: pacote com ${sitB.teamShort}`,
          },
          validation: check,
          score,
          partnerId: partner.id,
        }
      }
    }
  }

  return best
}

function rankPartners(gm, sit, seasonState) {
  return TEAMS.filter((t) => t.id !== sit.teamId)
    .map((t) => {
      const other = analyzeFranchise(gm, t.id, seasonState)
      let score = 0
      score +=
        other.needs.filter((n) => sit.roster.some((p) => p.posicao === n))
          .length * 5
      score +=
        sit.needs.filter((n) => other.roster.some((p) => p.posicao === n))
          .length * 6
      if (sit.objectiveId === 'tank' && other.avgOvr > sit.avgOvr) score += 4
      if (sit.objectiveId === 'title' && other.mode === 'rebuild') score += 5
      score += (t.id.charCodeAt(0) % 5) * 0.01
      return { id: t.id, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, TRADE_SEARCH_PARTNERS)
}

function generatePackageCandidates(gm, sitA, sitB, seasonState) {
  const givePlayers = rankOutgoing(gm, sitA, seasonState).slice(
    0,
    TRADE_SEARCH_GIVE_PLAYERS,
  )
  const getPlayers = rankIncoming(gm, sitA, sitB, seasonState).slice(
    0,
    TRADE_SEARCH_GET_PLAYERS,
  )
  const givePicks = rankPicks(gm, sitA.teamId, seasonState).slice(0, 2)
  const getPicks = rankPicks(gm, sitB.teamId, seasonState).slice(0, 2)

  const out = []

  for (const g of givePlayers) {
    for (const t of getPlayers) {
      pushCandidate(out, gm, sitA.teamId, sitB.teamId, [g], [t], [], [])
    }
  }

  for (let i = 0; i < givePlayers.length; i++) {
    for (let j = i + 1; j < givePlayers.length; j++) {
      for (const t of getPlayers.slice(0, 2)) {
        pushCandidate(
          out,
          gm,
          sitA.teamId,
          sitB.teamId,
          [givePlayers[i], givePlayers[j]],
          [t],
          [],
          [],
        )
      }
    }
  }

  for (const g of givePlayers.slice(0, 2)) {
    for (let i = 0; i < getPlayers.length; i++) {
      for (let j = i + 1; j < getPlayers.length; j++) {
        pushCandidate(
          out,
          gm,
          sitA.teamId,
          sitB.teamId,
          [g],
          [getPlayers[i], getPlayers[j]],
          [],
          [],
        )
      }
    }
  }

  for (const g of givePlayers.slice(0, 3)) {
    for (const t of getPlayers.slice(0, 3)) {
      for (const pk of givePicks) {
        pushCandidate(out, gm, sitA.teamId, sitB.teamId, [g], [t], [pk], [])
      }
      for (const pk of getPicks) {
        pushCandidate(out, gm, sitA.teamId, sitB.teamId, [g], [t], [], [pk])
      }
    }
  }

  for (const g of givePlayers.slice(0, 2)) {
    for (const pk of getPicks) {
      pushCandidate(out, gm, sitA.teamId, sitB.teamId, [g], [], [], [pk])
    }
    if (getPicks.length >= 2) {
      pushCandidate(
        out,
        gm,
        sitA.teamId,
        sitB.teamId,
        [g],
        [],
        [],
        [getPicks[0], getPicks[1]],
      )
    }
  }

  for (const t of getPlayers.slice(0, 2)) {
    for (const pk of givePicks) {
      pushCandidate(out, gm, sitA.teamId, sitB.teamId, [], [t], [pk], [])
    }
  }

  return out
}

function pushCandidate(
  out,
  gm,
  teamA,
  teamB,
  playerIdsA,
  playerIdsB,
  picksA,
  picksB,
) {
  const assetsA = [
    ...playerIdsA.map((id) => buildPlayerAsset(gm, id)).filter(Boolean),
    ...picksA.map((p) => buildPickAsset(p)).filter(Boolean),
  ]
  const assetsB = [
    ...playerIdsB.map((id) => buildPlayerAsset(gm, id)).filter(Boolean),
    ...picksB.map((p) => buildPickAsset(p)).filter(Boolean),
  ]
  if (!assetsA.length || !assetsB.length) return
  out.push({ teamA, teamB, assetsA, assetsB })
}

function rankOutgoing(gm, sit, seasonState) {
  return [...sit.roster]
    .map((p) => {
      const asset = buildPlayerAsset(gm, p.id)
      const keep = calcContextualAssetValue(asset, sit, seasonState)
      const will = calcTradeWillingness(p, sit.objectiveId)
      return { id: p.id, score: keep - will * 12 }
    })
    .sort((a, b) => a.score - b.score)
    .map((x) => x.id)
}

function rankIncoming(gm, sitA, sitB, seasonState) {
  return [...sitB.roster]
    .map((p) => {
      const asset = buildPlayerAsset(gm, p.id)
      const value = calcContextualAssetValue(asset, sitA, seasonState)
      return {
        id: p.id,
        score: value + (sitA.needs.includes(p.posicao) ? 8 : 0),
      }
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.id)
}

function rankPicks(gm, teamId, seasonState) {
  return getTeamPicks(gm.draftPicks, teamId)
    .map((p) => ({
      ...p,
      value: calcPickMarketValue(p, seasonState),
    }))
    .sort((a, b) => a.value - b.value)
}

function needBonus(sit, assetsIn) {
  let n = 0
  for (const a of assetsIn) {
    if (a.type === 'player' && sit.needs.includes(a.player.posicao)) n += 10
  }
  return n
}

function needLoss(sit, assetsOut) {
  let n = 0
  for (const a of assetsOut) {
    if (a.type === 'player' && sit.needs.includes(a.player.posicao)) n += 6
  }
  return n
}

export function negotiateAndExecute(gm, sit, seasonState = {}) {
  const best = findBestNegotiatedTrade(gm, sit, seasonState)
  if (!best) return { ok: false, gm, decision: null }

  return executeTrade(gm, best.proposal, { validation: best.validation })
}

export function previewTradeFairness(gm, proposal, sitA, sitB, seasonState) {
  return validateTrade(gm, proposal, sitA, sitB, seasonState)
}
