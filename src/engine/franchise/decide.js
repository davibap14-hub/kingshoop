import { MAX_DECISIONS_PER_TEAM_WEEK, SALARY_CAP } from '../../data/gm/constants'
import { TEAMS } from '../../data/teams'
import {
  balanceDemandFactor,
  calcBalancedRenewBump,
  calcBalancedSalary,
} from '../balance'
import {
  calcRenewWillingness,
  calcSalaryDemandFactor,
  calcTradeWillingness,
  personalityContractScore,
} from '../personality/contracts'
import {
  releasePlayer,
  renewContract,
  signFreeAgent,
  tradePlayers,
} from '../gm/actions'
import { canAfford } from '../gm/cap'
import { analyzeFranchise, resolvePlayer } from '../gm/situation'
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
      const fit = scoreFa(sit, pick)
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

  // —— Trade (melhor par determinístico) ——
  const trade = findBestTrade(gm, sit, seasonState)
  if (trade) {
    candidates.push({
      type: 'trade',
      key: `trade-${trade.giveId}-${trade.getId}`,
      score: trade.score,
      minScore: 16 + (1.2 - w.tradeAggression) * 10,
      execute: (state) =>
        tradePlayers(
          state,
          teamId,
          trade.giveId,
          trade.partnerId,
          trade.getId,
          `${sit.objective.label}: ${trade.reason}`,
        ),
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

export function scoreFa(sit, player) {
  const w = sit.weights ?? sit.personality?.weights ?? {}
  let score = 0
  score += (player.overall ?? 70) * (w.winNow ?? 1)
  score += (player.potencial ?? 70) * (w.potential ?? 1) * 0.85
  if (player.idade <= 24) score += 26 * (w.youth ?? 1)
  if (player.idade >= 30) score -= 16 * (w.youth ?? 1)
  if (sit.needs?.includes(player.posicao)) score += 24

  if (sit.objectiveId === 'economy') {
    score -= ((player.salario ?? 0) * calcSalaryDemandFactor(player)) / 900_000
  }
  if (sit.objectiveId === 'title') {
    score += (player.overall ?? 0) * (w.starHunting ?? 1) * 0.45
  }
  if (sit.objectiveId === 'tank' || sit.objectiveId === 'development') {
    score += Math.max(0, (player.potencial ?? 70) - (player.overall ?? 70)) * 1.4
  }

  score += personalityContractScore(player, sit) * 40
  return score
}

function rankFreeAgents(gm, sit) {
  return (gm.freeAgents ?? [])
    .map((id) => resolvePlayer(gm, id))
    .filter(Boolean)
    .sort((a, b) => {
      const diff = scoreFa(sit, b) - scoreFa(sit, a)
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

/**
 * Avalia todos os parceiros e pares — escolhe o melhor score.
 * Sem aleatoriedade.
 */
export function findBestTrade(gm, sit, seasonState) {
  const w = sit.weights
  if ((w.tradeAggression ?? 1) < 0.7) return null

  let best = null

  for (const partner of TEAMS) {
    if (partner.id === sit.teamId) continue
    const partnerSit = analyzeFranchise(gm, partner.id, seasonState)

    const giveCandidates = [...sit.roster]
      .map((p) => ({
        p,
        score:
          scoreKeep(sit, p) -
          calcTradeWillingness(p, sit.objectiveId) * 0.4,
      }))
      .sort((a, b) => a.score - b.score)

    const getCandidates = [...partnerSit.roster]
      .map((p) => ({
        p,
        score: scoreKeep(sit, p),
      }))
      .sort((a, b) => b.score - a.score)

    for (const give of giveCandidates.slice(0, 3)) {
      for (const get of getCandidates.slice(0, 3)) {
        const tradeScore = evaluateTradePair(sit, give.p, get.p, partnerSit)
        if (tradeScore == null) continue
        if (!best || tradeScore > best.score) {
          best = {
            giveId: give.p.id,
            getId: get.p.id,
            partnerId: partner.id,
            score: tradeScore,
            reason: `troca com ${partnerSit.teamShort} (${sit.objective.label})`,
          }
        }
      }
    }
  }

  return best
}

function evaluateTradePair(sit, give, get, partnerSit) {
  if (!give || !get) return null
  if (Math.abs((give.overall ?? 0) - (get.overall ?? 0)) > 12) return null

  const willingness = calcTradeWillingness(give, sit.objectiveId)
  if (willingness < 0.3) return null

  if (sit.objectiveId === 'title' && give.overall >= 84) return null
  if (
    (sit.objectiveId === 'tank' || sit.objectiveId === 'development') &&
    get.idade >= 31
  ) {
    return null
  }
  if (sit.objectiveId === 'economy') {
    const getCost =
      (get.salario ?? 0) * calcSalaryDemandFactor(get)
    const giveCost = give.salario ?? 0
    if (getCost > giveCost * 1.12) return null
  }

  // Título não manda estrela; tank prefere enviar veterano e receber jovem
  let score = 10 * (sit.weights.tradeAggression ?? 1)
  score += (scoreKeep(sit, get) - scoreKeep(sit, give)) * 35
  score += willingness * 8

  if (sit.needs.includes(get.posicao)) score += 12
  if (sit.objectiveId === 'tank' && get.idade <= 23) score += 10
  if (sit.objectiveId === 'title' && get.overall >= give.overall) score += 8
  if (partnerSit.avgOvr < sit.avgOvr && sit.objectiveId === 'title') score += 3

  // desempate estável
  score += (get.id.charCodeAt(get.id.length - 1) % 7) * 0.01

  return score
}
