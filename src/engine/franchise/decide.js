import { MAX_DECISIONS_PER_TEAM_WEEK, SALARY_CAP } from '../../data/gm/constants'
import {
  balanceDemandFactor,
  calcBalancedRenewBump,
  calcBalancedSalary,
} from '../balance'
import {
  calcRenewWillingness,
  calcSalaryDemandFactor,
  personalityContractScore,
} from '../personality/contracts'
import {
  releasePlayer,
  renewContract,
  signFreeAgent,
} from '../gm/actions'
import { canAfford } from '../gm/cap'
import { resolvePlayer } from '../gm/situation'
import { getReport } from '../scouting/state.js'
import { getScoutedView } from '../scouting/report.js'
import { dynastyFaScoreBonus } from '../dynasty/effects.js'
import { findBestNegotiatedTrade, executeTrade } from '../trade'
import { resolveFranchiseObjective } from './objective'

/**
 * Franchise AI — decisões determinísticas por score.
 * Nunca usa RNG para escolher ações.
 */
export function decideForFranchise(gm, teamId, seasonState = {}) {
  const resolved = resolveFranchiseObjective(gm, teamId, seasonState)
  const sit = {
    ...resolved.situation,
    objectiveId: resolved.objectiveId,
    objective: resolved.objective,
    objectiveReason: resolved.reason,
    weights: resolved.weights,
    dynastyBias: resolved.dynastyBias ?? null,
    // compat com código que lê personality.weights
    personality: {
      ...resolved.situation.personality,
      weights: resolved.weights,
      label: resolved.label,
    },
  }

  const candidates = buildActionCandidates(gm, sit, seasonState)
  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.key.localeCompare(b.key)
  })

  const decisions = []
  let state = gm
  const usedTypes = new Set()

  for (const action of candidates) {
    if (decisions.length >= MAX_DECISIONS_PER_TEAM_WEEK) break
    // evita duas ações do mesmo tipo na mesma semana (foco)
    if (usedTypes.has(action.type)) continue
    if (action.score < action.minScore) continue

    const result = action.execute(state)
    if (!result?.ok || !result.decision) continue

    state = result.gm
    decisions.push({
      ...result.decision,
      objectiveId: sit.objectiveId,
      objectiveLabel: sit.objective.label,
      aiScore: Math.round(action.score * 10) / 10,
    })
    usedTypes.add(action.type)
  }

  return {
    gm: state,
    decisions,
    situation: sit,
    objective: {
      id: sit.objectiveId,
      label: sit.objective.label,
      reason: sit.objectiveReason,
    },
  }
}

function buildActionCandidates(gm, sit, seasonState) {
  const w = sit.weights
  const teamId = sit.teamId
  const candidates = []

  // —— Release: cap / economia ——
  const expensive = [...sit.roster]
    .filter((p) => (gm.contracts[p.id]?.yearlySalary ?? 0) > 7_500_000)
    .map((p) => {
      const sal = gm.contracts[p.id]?.yearlySalary ?? 0
      const value = sal / Math.max(1, p.overall)
      const score =
        value / 120_000 +
        w.capSpace * 12 +
        (sit.cap.usagePct - 85) * 0.35 -
        (p.overall ?? 70) * 0.08 +
        (sit.objectiveId === 'economy' ? 10 : 0) +
        (sit.objectiveId === 'tank' && p.idade >= 30 ? 6 : 0)
      return { p, score }
    })
    .sort((a, b) => b.score - a.score)

  if (expensive[0] && sit.rosterSize > 5) {
    const { p, score } = expensive[0]
    candidates.push({
      type: 'release',
      key: `release-cap-${p.id}`,
      score,
      minScore: sit.cap.usagePct >= 90 || sit.objectiveId === 'economy' ? 8 : 18,
      execute: (state) =>
        releasePlayer(
          state,
          teamId,
          p.id,
          `${sit.objective.label}: aliviar teto`,
        ),
    })
  }

  // —— Release: veterano (tank / development) ——
  const vet = [...sit.roster]
    .filter(
      (p) =>
        p.idade >= 30 &&
        (gm.contracts[p.id]?.yearlySalary ?? 0) > 5_500_000,
    )
    .map((p) => ({
      p,
      score:
        w.releaseVeterans * 14 +
        (p.idade - 29) * 2.5 +
        (sit.objectiveId === 'tank' ? 10 : 0) +
        (sit.objectiveId === 'development' ? 8 : 0) -
        (p.overall ?? 70) * 0.05,
    }))
    .sort((a, b) => b.score - a.score)[0]

  if (vet && sit.rosterSize > 5) {
    candidates.push({
      type: 'release',
      key: `release-vet-${vet.p.id}`,
      score: vet.score,
      minScore: 12,
      execute: (state) =>
        releasePlayer(
          state,
          teamId,
          vet.p.id,
          `${sit.objective.label}: abrir espaço para jovens`,
        ),
    })
  }

  // —— Sign FA ——
  if (sit.rosterGap > 0 && sit.cap.space > 1_500_000) {
    const faRanked = rankFreeAgents(gm, sit)
    const pick = faRanked[0]
    if (pick) {
      const demandSalary = calcBalancedSalary(pick, {
        seasonNumber: seasonState.seasonNumber ?? 1,
        demandFactor: balanceDemandFactor(calcSalaryDemandFactor(pick)),
      })
      const faReport = gm.scouting
        ? getReport(gm.scouting, teamId, pick.id)
        : null
      const fit = scoreFa(sit, pick, faReport)
      const score =
        fit * 0.08 +
        w.signFloor * 10 +
        (sit.needs.includes(pick.posicao) ? 14 : 0) +
        (sit.rosterGap >= 2 ? 8 : 0) -
        (sit.objectiveId === 'economy' ? demandSalary / 2_500_000 : 0)

      candidates.push({
        type: 'sign',
        key: `sign-${pick.id}`,
        score,
        minScore: 10,
        execute: (state) => {
          if (!canAfford(state.contracts, teamId, demandSalary)) {
            return { ok: false, gm: state, decision: null }
          }
          return signFreeAgent(state, teamId, pick.id, {
            yearlySalary: demandSalary,
            seasonNumber: seasonState.seasonNumber ?? 1,
            reason: `${sit.objective.label}: ${explainSign(sit, pick)}`,
          })
        },
      })
    }
  }

  // —— Renew ——
  const expiring = sit.roster
    .map((p) => ({ p, c: gm.contracts[p.id] }))
    .filter(({ c }) => c && c.yearsRemaining <= 1)
    .map(({ p }) => {
      const keep = scoreKeep(sit, p)
      const willingness = calcRenewWillingness(p, sit.objectiveId)
      const score =
        keep * 40 +
        w.renewStars * 12 +
        willingness * 18 -
        (sit.objectiveId === 'tank' && p.idade >= 29 ? 15 : 0) -
        (sit.objectiveId === 'economy'
          ? calcSalaryDemandFactor(p) * 8
          : 0)
      return { p, score, keep }
    })
    .sort((a, b) => b.score - a.score)

  if (expiring[0]) {
    const target = expiring[0]
    candidates.push({
      type: 'renew',
      key: `renew-${target.p.id}`,
      score: target.score,
      minScore: 28,
      execute: (state) =>
        renewContract(state, teamId, target.p.id, {
          cap: SALARY_CAP,
          salaryBump: calcBalancedRenewBump(
            target.p,
            calcSalaryDemandFactor(target.p),
          ),
          reason: `${sit.objective.label}: renovar peça-chave`,
        }),
    })
  }

  // —— Trade Engine — pacotes multi-jogador + picks (anti-irreal) ——
  const trade = findBestNegotiatedTrade(gm, sit, seasonState)
  if (trade) {
    const keyAssets = [
      ...trade.proposal.assetsA.map(
        (a) => a.playerId ?? a.pickId ?? 'x',
      ),
      ...trade.proposal.assetsB.map(
        (a) => a.playerId ?? a.pickId ?? 'x',
      ),
    ].join('-')
    candidates.push({
      type: 'trade',
      key: `trade-${trade.partnerId}-${keyAssets}`,
      score: trade.score,
      minScore: 16 + (1.2 - w.tradeAggression) * 10,
      execute: (state) =>
        executeTrade(state, trade.proposal, {
          validation: trade.validation,
        }),
    })
  }

  return candidates
}

export function scoreKeep(sit, player) {
  const w = sit.weights ?? sit.personality?.weights ?? {}
  let score = (player.overall ?? 70) / 100
  score += ((player.potencial ?? 70) / 100) * (w.potential ?? 1) * 0.35
  if (player.idade <= 25) score += 0.15 * (w.youth ?? 1)
  if (player.idade >= 32) score -= 0.12 * (w.youth ?? 1)

  if (sit.objectiveId === 'title' || sit.objectiveId === 'playoffs') {
    score += ((player.overall ?? 70) / 100) * (w.winNow ?? 1) * 0.3
  }
  if (sit.objectiveId === 'tank' || sit.objectiveId === 'development') {
    score += ((player.potencial ?? 70) - (player.overall ?? 70)) / 80
    if (player.idade >= 30) score -= 0.2
  }
  if (sit.objectiveId === 'economy') {
    const sal = player.salario ?? 0
    score -= sal / 80_000_000
  }

  score += personalityContractScore(player, {
    ...sit,
    personalityId: sit.personalityId,
    mode: sit.objectiveId,
  })
  return score
}

/**
 * Score de FA — Franchise AI usa visão scoutada (investimento ↑ → precisão ↑).
 */
export function scoreFa(sit, player, report = null) {
  const view = getScoutedView(player, report)
  const w = sit.weights ?? sit.personality?.weights ?? {}
  const confidence = (view?.confidence ?? 10) / 100
  const overall = view?.overall ?? player.overall ?? 70
  const potencial = view?.potencial ?? player.potencial ?? 70

  let score = 0
  score += overall * (w.winNow ?? 1)
  score += potencial * (w.potential ?? 1) * 0.85 * (0.5 + confidence * 0.5)
  if (player.idade <= 24) score += 26 * (w.youth ?? 1)
  if (player.idade >= 30) score -= 16 * (w.youth ?? 1)
  if (sit.needs?.includes(player.posicao)) score += 24

  if (sit.objectiveId === 'economy') {
    score -= ((player.salario ?? 0) * calcSalaryDemandFactor(player)) / 900_000
  }
  if (sit.objectiveId === 'title') {
    score += overall * (w.starHunting ?? 1) * 0.45
  }
  if (sit.objectiveId === 'tank' || sit.objectiveId === 'development') {
    score += Math.max(0, potencial - overall) * 1.4 * (0.55 + confidence * 0.45)
  }

  // Personalidade scoutada vs fallback
  if (view?.personalidade) {
    score += personalityContractScore(
      { ...player, personalidade: view.personalidade },
      sit,
    ) * 40
  } else {
    score += personalityContractScore(player, sit) * 28
  }

  for (const s of view?.strengths ?? []) {
    score += Math.max(0, (s.value ?? 50) - 72) * 0.2 * confidence
  }
  for (const wk of view?.weaknesses ?? []) {
    score -= Math.max(0, 42 - (wk.value ?? 50)) * 0.18 * confidence
  }

  score -= (1 - confidence) * 10

  // Dynasty Engine — franquias lendárias atraem estrelas
  if (sit.dynastyBias?.active) {
    score += dynastyFaScoreBonus(
      {
        active: { [sit.teamId]: sit.dynastyBias },
        franchiseReputation: {
          [sit.teamId]: sit.dynastyBias.reputation ?? 50,
        },
      },
      sit.teamId,
      overall,
    )
  }

  return score
}

function rankFreeAgents(gm, sit) {
  const scouting = gm.scouting ?? null
  return (gm.freeAgents ?? [])
    .map((id) => resolvePlayer(gm, id))
    .filter(Boolean)
    .sort((a, b) => {
      const reportA = scouting ? getReport(scouting, sit.teamId, a.id) : null
      const reportB = scouting ? getReport(scouting, sit.teamId, b.id) : null
      const diff = scoreFa(sit, b, reportB) - scoreFa(sit, a, reportA)
      if (diff !== 0) return diff
      return String(a.id).localeCompare(String(b.id))
    })
}

function explainSign(sit, player) {
  if (sit.needs.includes(player.posicao)) return `preenche ${player.posicao}`
  if (sit.objectiveId === 'development' || player.idade <= 24) {
    return 'aposta em jovem'
  }
  if (sit.objectiveId === 'title' && player.overall >= 82) {
    return 'peça de título'
  }
  if (player.overall >= 82) return 'adiciona talento'
  return 'reforço de elenco'
}

/** @deprecated use Trade Engine `findBestNegotiatedTrade` */
export { findBestNegotiatedTrade as findBestTrade } from '../trade'
