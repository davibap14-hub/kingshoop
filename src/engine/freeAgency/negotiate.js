/**
 * Negociação de FA — obrigatoriamente via Contract Engine.
 * generateFranchiseOffer · negotiateOffer · contractFromOffer · summarizeOffer
 */

import {
  CONTRACT_OFFER_TYPES,
  CONTRACT_YEARS_MAX,
  CONTRACT_YEARS_MIN,
} from '../../data/contracts'
import { calcBalancedSalary, clampSalary } from '../balance'
import {
  contractFromOffer,
  generateFranchiseOffer,
  negotiateOffer,
  summarizeOffer,
  teamCanAffordOffer,
} from '../contracts'
import { resolveFranchiseObjective } from '../franchise/objective'
import { signFreeAgent } from '../gm/actions'
import { resolvePlayer } from '../gm/situation'
import {
  calcSalaryDemandFactor,
  calcRenewWillingness,
} from '../personality/contracts'

/**
 * Abre oferta da franquia do jogador para um FA (Contract Engine).
 */
export function createFaOffer(state, playerId, opts = {}) {
  const gm = state.gm
  const teamId = state.currentTeamId
  if (!gm || !teamId || !playerId) {
    return { ok: false, error: 'Estado inválido para oferta.' }
  }
  if (!(gm.freeAgents ?? []).includes(playerId)) {
    return { ok: false, error: 'Jogador não está na free agency.' }
  }
  if (gm.pendingFaOffer) {
    return {
      ok: false,
      error: 'Já existe uma oferta FA pendente. Resolva ou retire antes.',
      pending: summarizeOffer(gm.pendingFaOffer),
    }
  }

  const player = resolvePlayer(gm, playerId)
  if (!player) return { ok: false, error: 'Free agent não encontrado.' }

  const resolved = resolveFranchiseObjective(gm, teamId, state.season ?? {})
  const offer = generateFranchiseOffer({
    teamId,
    player,
    type: CONTRACT_OFFER_TYPES.ufa_offer,
    seasonNumber: state.currentSeason ?? 1,
    week: state.currentWeek ?? 1,
    franchiseObjective: resolved.objectiveId,
    gm,
    rng: opts.rng ?? Math.random,
  })

  if (!offer) {
    return {
      ok: false,
      error: 'Franquia sem espaço no teto para ofertar (Contract Engine).',
    }
  }

  const pending = {
    ...offer,
    channel: 'free_agency',
    askedSalary: calcAskedSalary(player, state.currentSeason ?? 1),
  }

  return {
    ok: true,
    gm: { ...gm, pendingFaOffer: pending },
    offer: summarizeOffer(pending),
    message: `Oferta UFA enviada a ${player.nome} via Contract Engine.`,
  }
}

/**
 * Negocia termos — Contract Engine negotiateOffer (FA pede / franquia responde).
 * `terms` = pacote que a franquia está disposta a colocar na mesa;
 * o FA confronta com seu pedido e a Engine devolve acordo ou contra-proposta.
 */
export function negotiateFaOffer(state, terms = {}) {
  const gm = state.gm
  const pending = gm?.pendingFaOffer
  if (!pending) {
    return { ok: false, error: 'Nenhuma oferta FA pendente.' }
  }

  const player = resolvePlayer(gm, pending.toPlayerId)
  if (!player) {
    return { ok: false, error: 'Free agent sumiu do mercado.' }
  }

  const teamId = pending.fromTeamId
  const resolved = resolveFranchiseObjective(gm, teamId, state.season ?? {})

  // Franquia atualiza a mesa com os termos desejados (ainda via Contract clamps)
  const revised = reviseTeamTerms(pending, terms, gm, teamId)
  if (!revised.ok) {
    return revised
  }

  // FA apresenta o pedido; Contract Engine negoceia
  const faAsk = buildFaAsk(player, revised.offer, state.currentSeason ?? 1)
  const result = negotiateOffer(revised.offer, faAsk, {
    player,
    relationships: null,
    gm,
    franchiseObjective: resolved.objectiveId,
  })

  if (!result.ok) {
    return {
      ok: false,
      error: result.error,
      gm,
      offer: summarizeOffer(result.offer ?? revised.offer),
    }
  }

  const nextOffer = {
    ...result.offer,
    channel: 'free_agency',
    askedSalary: faAsk.yearlySalary,
    status: result.agreement ? 'pending' : 'negotiating',
  }

  return {
    ok: true,
    agreement: Boolean(result.agreement),
    gm: { ...gm, pendingFaOffer: nextOffer },
    offer: summarizeOffer(nextOffer),
    message: result.agreement
      ? `${player.nome} topa os termos na mesa.`
      : `${player.nome} devolveu contra-proposta (Contract Engine).`,
  }
}

/**
 * Aceita a oferta pendente → contractFromOffer + signFreeAgent.
 */
export function acceptFaOffer(state) {
  const gm = state.gm
  const pending = gm?.pendingFaOffer
  if (!pending) {
    return { ok: false, error: 'Nenhuma oferta FA pendente.' }
  }

  const player = resolvePlayer(gm, pending.toPlayerId)
  if (!player) {
    return { ok: false, error: 'Free agent não encontrado.' }
  }

  if (!(gm.freeAgents ?? []).includes(player.id)) {
    return {
      ok: false,
      error: 'Jogador não está mais disponível.',
      gm: { ...gm, pendingFaOffer: null },
    }
  }

  const minAsk = calcAskedSalary(player, state.currentSeason ?? 1)
  const willingness = calcRenewWillingness(
    player,
    pending.objectiveId ?? 'playoffs',
    null,
  )
  const floor = clampSalary(minAsk * (0.88 - (1 - willingness) * 0.04))

  if ((pending.yearlySalary ?? 0) < floor) {
    // Ainda tenta uma rodada na Contract Engine com o pedido do FA
    const resolved = resolveFranchiseObjective(
      gm,
      pending.fromTeamId,
      state.season ?? {},
    )
    const faAsk = buildFaAsk(player, pending, state.currentSeason ?? 1)
    const result = negotiateOffer(pending, faAsk, {
      player,
      gm,
      franchiseObjective: resolved.objectiveId,
    })
    if (!result.agreement) {
      return {
        ok: false,
        refused: true,
        gm: {
          ...gm,
          pendingFaOffer: {
            ...result.offer,
            channel: 'free_agency',
            askedSalary: faAsk.yearlySalary,
            status: 'negotiating',
          },
        },
        offer: summarizeOffer(result.offer),
        error: `${player.nome} recusou — salário abaixo do pedido de mercado.`,
      }
    }
  }

  const rich = contractFromOffer(
    pending,
    null,
    state.currentSeason ?? 1,
  )

  const signed = signFreeAgent(gm, pending.fromTeamId, player.id, {
    yearlySalary: pending.yearlySalary,
    years: pending.years,
    seasonNumber: state.currentSeason ?? 1,
    reason: pending.reason ?? 'Free Agency · Contract Engine',
  })

  if (!signed.ok) {
    return {
      ok: false,
      error: 'Não foi possível assinar (elenco/teto).',
      gm,
    }
  }

  let nextGm = { ...signed.gm, pendingFaOffer: null }
  if (rich && nextGm.contracts[player.id]) {
    nextGm = {
      ...nextGm,
      contracts: {
        ...nextGm.contracts,
        [player.id]: {
          ...nextGm.contracts[player.id],
          yearsRemaining: rich.yearsRemaining ?? pending.years,
          yearlySalary: rich.yearlySalary ?? pending.yearlySalary,
          signingBonus: rich.signingBonus,
          options: rich.options,
          clauses: rich.clauses,
          signedAtSeason: rich.signedAtSeason,
        },
      },
    }
  }

  // Histórico da Contract Engine no career contractEngine (opcional append)
  const engine = state.contractEngine
    ? {
        ...state.contractEngine,
        offerHistory: [
          ...(state.contractEngine.offerHistory ?? []),
          { ...pending, status: 'accepted', resolvedAt: Date.now() },
        ].slice(-40),
        lastDecision: {
          type: 'fa_sign',
          playerId: player.id,
          teamId: pending.fromTeamId,
          at: Date.now(),
        },
      }
    : state.contractEngine

  return {
    ok: true,
    gm: nextGm,
    contractEngine: engine,
    decision: signed.decision,
    offer: summarizeOffer({ ...pending, status: 'accepted' }),
    message: `${player.nome} assina com ${pending.fromTeamShort} — Contract Engine.`,
  }
}

/**
 * Retira a oferta pendente.
 */
export function withdrawFaOffer(state) {
  const gm = state.gm
  if (!gm?.pendingFaOffer) {
    return { ok: false, error: 'Nenhuma oferta para retirar.' }
  }
  const name =
    resolvePlayer(gm, gm.pendingFaOffer.toPlayerId)?.nome ?? 'FA'
  return {
    ok: true,
    gm: { ...gm, pendingFaOffer: null },
    message: `Oferta a ${name} retirada.`,
  }
}

/** Pedido salarial de mercado (Contract / Balance / Personality). */
export function calcAskedSalary(player, seasonNumber = 1) {
  const demand = calcSalaryDemandFactor(player)
  const market = calcBalancedSalary(player, {
    seasonNumber,
    demandFactor: demand,
  })
  const pop = player.popularidade ?? 40
  let ask = market
  if (pop >= 70) ask = Math.round(ask * 1.1)
  else if (pop <= 25) ask = Math.round(ask * 0.94)
  return clampSalary(ask)
}

function buildFaAsk(player, offer, seasonNumber) {
  const ask = calcAskedSalary(player, seasonNumber)
  const willingness = calcRenewWillingness(
    player,
    offer.objectiveId ?? 'playoffs',
    null,
  )
  const years = clampInt(
    willingness > 0.55
      ? Math.max(offer.years ?? 2, 3)
      : offer.years ?? 2,
    CONTRACT_YEARS_MIN,
    CONTRACT_YEARS_MAX,
  )
  return {
    yearlySalary: ask,
    years,
    signingBonus: Math.round(ask * 0.08),
    tradeClause: offer.clauses?.tradeClause,
    playerOption: willingness > 0.6 ? true : offer.options?.playerOption,
    teamOption: offer.options?.teamOption,
  }
}

function reviseTeamTerms(offer, terms, gm, teamId) {
  const yearlySalary = clampSalary(
    terms.yearlySalary ?? offer.yearlySalary,
  )
  const years = clampInt(
    terms.years ?? offer.years,
    CONTRACT_YEARS_MIN,
    CONTRACT_YEARS_MAX,
  )
  const signingBonus = Math.max(
    0,
    Math.round(terms.signingBonus ?? offer.signingBonus ?? 0),
  )

  if (!teamCanAffordOffer(gm, teamId, yearlySalary)) {
    return {
      ok: false,
      error: 'Oferta estoura o salary cap (Contract Engine).',
    }
  }

  return {
    ok: true,
    offer: {
      ...offer,
      yearlySalary,
      years,
      signingBonus,
      clauses: {
        ...(offer.clauses ?? {}),
        tradeClause:
          terms.tradeClause ?? offer.clauses?.tradeClause ?? 'none',
      },
      options: {
        ...(offer.options ?? {}),
        playerOption:
          terms.playerOption ?? Boolean(offer.options?.playerOption),
        teamOption: terms.teamOption ?? Boolean(offer.options?.teamOption),
      },
      status: 'negotiating',
    },
  }
}

function clampInt(n, min, max) {
  return Math.max(min, Math.min(max, Math.round(Number(n) || min)))
}
