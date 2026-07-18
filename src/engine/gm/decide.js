import { MAX_DECISIONS_PER_TEAM_WEEK, SALARY_CAP } from '../../data/gm/constants'
import { TEAMS } from '../../data/teams'
import {
  calcRenewWillingness,
  calcSalaryDemandFactor,
  calcTradeWillingness,
  personalityContractScore,
} from '../personality/contracts'
import { runDraft as runDraftEngine } from '../draft/run'
import {
  releasePlayer,
  renewContract,
  signFreeAgent,
  tradePlayers,
} from './actions'
import { canAfford } from './cap'
import { analyzeFranchise, resolvePlayer } from './situation'

/**
 * Uma rodada de decisões automáticas para um time,
 * baseada em personalidade + situação da franquia.
 */
export function decideForTeam(gm, teamId, seasonState, rng = Math.random) {
  const sit = analyzeFranchise(gm, teamId, seasonState)
  const w = sit.personality.weights
  const decisions = []
  let state = gm

  const tryPush = (result) => {
    if (!result.ok || !result.decision) return false
    state = result.gm
    decisions.push(result.decision)
    return true
  }

  // 1) Cap crunch / financeira → dispensar salários altos de baixo impacto
  if (
    decisions.length < MAX_DECISIONS_PER_TEAM_WEEK &&
    (sit.mode === 'cap_crunch' ||
      (sit.personalityId === 'financeira' && sit.cap.usagePct > 92) ||
      (w.capSpace > 1.2 && sit.cap.space < 5_000_000))
  ) {
    const expensive = [...sit.roster]
      .filter((p) => (state.contracts[p.id]?.yearlySalary ?? 0) > 8_000_000)
      .sort(
        (a, b) =>
          (state.contracts[b.id]?.yearlySalary ?? 0) / Math.max(1, b.overall) -
          (state.contracts[a.id]?.yearlySalary ?? 0) / Math.max(1, a.overall),
      )
    if (expensive[0] && sit.rosterSize > 5) {
      tryPush(
        releasePlayer(
          state,
          teamId,
          expensive[0].id,
          `${sit.personality.label}: aliviar teto`,
        ),
      )
    }
  }

  // 2) Reconstrução / jovem → dispensar veteranos caros
  if (
    decisions.length < MAX_DECISIONS_PER_TEAM_WEEK &&
    (sit.mode === 'rebuild' || sit.personalityId === 'reconstrucao' || sit.personalityId === 'jovem') &&
    w.youth > 1.1
  ) {
    const vet = [...sit.roster]
      .filter((p) => p.idade >= 31 && (state.contracts[p.id]?.yearlySalary ?? 0) > 6_000_000)
      .sort((a, b) => b.idade - a.idade)[0]
    if (vet && sit.rosterSize > 5) {
      tryPush(
        releasePlayer(
          state,
          teamId,
          vet.id,
          `${sit.personality.label}: abrir espaço para jovens`,
        ),
      )
    }
  }

  // 3) Contratação de FA alinhada à personalidade (franquia + jogador)
  if (
    decisions.length < MAX_DECISIONS_PER_TEAM_WEEK &&
    sit.rosterGap > 0 &&
    sit.cap.space > 2_000_000
  ) {
    const fa = rankFreeAgents(state, sit, rng)
    const pick = fa[0]
    const demandSalary = Math.round(
      (pick?.salario ?? 2_000_000) * calcSalaryDemandFactor(pick),
    )
    if (pick && canAfford(state.contracts, teamId, demandSalary)) {
      tryPush(
        signFreeAgent(state, teamId, pick.id, {
          yearlySalary: demandSalary,
          reason: `${sit.personality.label}: ${explainSign(sit, pick)}`,
        }),
      )
    }
  }

  // 4) Renovação de contratos curtos (lealdade / ambição do jogador)
  if (decisions.length < MAX_DECISIONS_PER_TEAM_WEEK && w.renewStars > 0.6) {
    const expiring = sit.roster
      .map((p) => ({ p, c: state.contracts[p.id] }))
      .filter(({ c }) => c && c.yearsRemaining <= 1)
      .sort((a, b) => scoreKeep(sit, b.p) - scoreKeep(sit, a.p))

    const target = expiring[0]
    const renewChance =
      w.renewStars *
      0.7 *
      calcRenewWillingness(target?.p, sit.mode ?? sit.personalityId)
    if (target && scoreKeep(sit, target.p) > 0.55 && rng() < renewChance) {
      tryPush(
        renewContract(state, teamId, target.p.id, {
          cap: SALARY_CAP,
          salaryBump: 1.05 * calcSalaryDemandFactor(target.p),
          reason: `${sit.personality.label}: renovar peça-chave`,
        }),
      )
    }
  }

  // 5) Troca — disposição do jogador (lealdade / ambição / temperamento)
  if (
    decisions.length < MAX_DECISIONS_PER_TEAM_WEEK &&
    w.tradeAggression > 0.8 &&
    rng() < w.tradeAggression * 0.45
  ) {
    const trade = findTrade(state, sit, seasonState, rng)
    if (trade) {
      tryPush(
        tradePlayers(
          state,
          teamId,
          trade.giveId,
          trade.partnerId,
          trade.getId,
          `${sit.personality.label}: ${trade.reason}`,
        ),
      )
    }
  }

  return { gm: state, decisions, situation: sit }
}

function scoreKeep(sit, player) {
  const w = sit.personality.weights
  let score = (player.overall ?? 70) / 100
  score += ((player.potencial ?? 70) / 100) * w.potential * 0.35
  if (player.idade <= 25) score += 0.15 * w.youth
  if (player.idade >= 32) score -= 0.12 * w.youth
  if (sit.mode === 'contend') score += (player.overall / 100) * w.winNow * 0.25
  score += personalityContractScore(player, sit)
  return score
}

function scoreFa(sit, player) {
  const w = sit.personality.weights
  let score = 0
  score += (player.overall ?? 70) * w.winNow
  score += (player.potencial ?? 70) * w.potential * 0.8
  if (player.idade <= 24) score += 25 * w.youth
  if (player.idade >= 30) score -= 15 * w.youth
  if (sit.needs.includes(player.posicao)) score += 20
  if (sit.personalityId === 'financeira') {
    score -=
      ((player.salario ?? 0) * calcSalaryDemandFactor(player)) / 1_000_000
  }
  if (sit.mode === 'contend' || sit.personalityId === 'contender') {
    score += (player.overall ?? 0) * w.starHunting * 0.4
  }
  score += personalityContractScore(player, sit) * 40
  return score
}

function rankFreeAgents(gm, sit) {
  return (gm.freeAgents ?? [])
    .map((id) => resolvePlayer(gm, id))
    .filter(Boolean)
    .sort((a, b) => scoreFa(sit, b) - scoreFa(sit, a))
}

function explainSign(sit, player) {
  if (sit.needs.includes(player.posicao)) return `preenche ${player.posicao}`
  if (player.idade <= 24) return 'aposta em jovem'
  if (player.overall >= 82) return 'adiciona talento'
  return 'reforço de elenco'
}

function findTrade(gm, sit, seasonState, rng) {
  const partners = TEAMS.map((t) => t.id).filter((id) => id !== sit.teamId)
  const partnerId = partners[Math.floor(rng() * partners.length)]
  const partnerSit = analyzeFranchise(gm, partnerId, seasonState)

  const mode = sit.mode ?? sit.personalityId
  const give = [...sit.roster]
    .map((p) => ({
      p,
      score:
        scoreKeep(sit, p) -
        calcTradeWillingness(p, mode) * 0.35,
    }))
    .sort((a, b) => a.score - b.score)[0]?.p

  const get = [...partnerSit.roster].sort(
    (a, b) => scoreKeep(sit, b) - scoreKeep(sit, a),
  )[0]

  if (!give || !get) return null
  if (Math.abs((give.overall ?? 0) - (get.overall ?? 0)) > 12) return null

  // Jogador muito leal resiste a ser embalado
  if (calcTradeWillingness(give, mode) < 0.28 && rng() < 0.7) return null

  // Contender não troca estrela; reconstrução não busca veterano caro
  if (sit.personalityId === 'contender' && give.overall >= 84) return null
  if (sit.personalityId === 'reconstrucao' && get.idade >= 30) return null
  if (
    sit.personalityId === 'financeira' &&
    (get.salario ?? 0) * calcSalaryDemandFactor(get) >
      (give.salario ?? 0) * 1.15
  ) {
    return null
  }

  return {
    giveId: give.id,
    getId: get.id,
    partnerId,
    reason: `troca com ${partnerSit.teamShort}`,
  }
}

/** @deprecated use Draft Engine `runDraft` — ponte de compatibilidade */
export function runDraft(gm, seasonState, rng = Math.random) {
  return runDraftEngine(gm, seasonState, rng)
}
