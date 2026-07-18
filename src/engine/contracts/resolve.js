import {
  CONTRACT_DECISIONS,
  CONTRACT_OFFER_TYPES,
  FREE_AGENCY_STATUS,
  MAX_OFFER_HISTORY,
} from '../../data/contracts'
import { negotiateOffer } from './negotiate.js'
import { contractFromOffer } from './offers.js'
import {
  createContractEngineState,
  createPlayerContract,
  resolveFreeAgencyStatus,
  withWeeklySalary,
} from './state.js'

/**
 * Resolve decisão do jogador sobre a oferta pendente.
 * decision: accept | negotiate | refuse | exercise | decline_option
 */
export function resolveContractDecision(
  state,
  decision,
  terms = {},
  opts = {},
) {
  const engine = createContractEngineState(state.contractEngine)
  const offer = engine.pendingOffer ?? state.pendingContractOffer

  if (!offer) {
    return {
      ok: false,
      error: 'Nenhuma oferta de contrato pendente.',
      nextState: null,
      effects: null,
    }
  }

  if (decision === CONTRACT_DECISIONS.negotiate) {
    return handleNegotiate(state, engine, offer, terms)
  }

  if (
    decision === CONTRACT_DECISIONS.refuse ||
    decision === CONTRACT_DECISIONS.decline_option
  ) {
    return handleRefuse(state, engine, offer, decision)
  }

  if (
    decision === CONTRACT_DECISIONS.accept ||
    decision === CONTRACT_DECISIONS.exercise
  ) {
    return handleAccept(state, engine, offer, opts)
  }

  return {
    ok: false,
    error: `Decisão inválida: ${decision}`,
    nextState: null,
    effects: null,
  }
}

function handleNegotiate(state, engine, offer, terms) {
  const result = negotiateOffer(offer, terms, {
    player: state.player,
    relationships: state.relationships,
    gm: state.gm,
    franchiseObjective: state.gm?.objectives?.[offer.fromTeamId],
  })

  if (!result.ok) {
    return {
      ok: false,
      error: result.error,
      nextState: null,
      effects: null,
    }
  }

  const nextEngine = {
    ...engine,
    pendingOffer: result.offer,
    lastNegotiation: {
      at: Date.now(),
      agreement: result.agreement,
      terms,
      offerId: offer.id,
    },
  }

  const effects = {
    decision: CONTRACT_DECISIONS.negotiate,
    offer: result.offer,
    agreement: result.agreement,
    messages: result.messages,
  }

  return {
    ok: true,
    error: null,
    effects,
    nextState: {
      ...state,
      pendingContractOffer: result.offer,
      contractEngine: nextEngine,
      lastEvent: result.messages[0],
    },
  }
}

function handleRefuse(state, engine, offer, decision) {
  const messages = [
    decision === CONTRACT_DECISIONS.decline_option
      ? 'Opção recusada.'
      : `Oferta recusada: ${offer.fromTeamShort ?? offer.fromTeamId}.`,
  ]

  let contract = state.contract
  let currentTeamId = state.currentTeamId
  let statusPatch = {}

  // Recusar team option → vira FA
  if (offer.type === CONTRACT_OFFER_TYPES.team_option) {
    const fa = resolveFreeAgencyStatus(contract, state.player)
    contract = withWeeklySalary({
      ...createPlayerContract({
        ...contract,
        teamId: null,
        yearsRemaining: 0,
        yearlySalary: contract?.yearlySalary ?? 0,
        freeAgencyStatus: fa,
      }),
    })
    currentTeamId = null
    messages.push(
      fa === FREE_AGENCY_STATUS.rfa
        ? 'Você é Restricted Free Agent.'
        : 'Você é Unrestricted Free Agent.',
    )
  }

  // Recusar player option → permanece em FA path se era último ano
  if (offer.type === CONTRACT_OFFER_TYPES.player_option) {
    const fa = resolveFreeAgencyStatus(contract, state.player)
    contract = withWeeklySalary({
      ...createPlayerContract({
        ...contract,
        teamId: null,
        yearsRemaining: 0,
        freeAgencyStatus: fa,
      }),
    })
    currentTeamId = null
    messages.push('Player Option não exercida — free agency.')
  }

  // Recusar buyout — mantém contrato
  // Recusar oferta de FA — continua FA

  const history = appendOfferHistory(engine.offerHistory, {
    ...offer,
    status: 'refused',
    resolvedAt: Date.now(),
  })

  const effects = {
    decision: CONTRACT_DECISIONS.refuse,
    offer,
    messages,
    deltas: statusPatch,
  }

  return {
    ok: true,
    error: null,
    effects,
    nextState: {
      ...state,
      contract,
      currentTeamId: currentTeamId ?? state.currentTeamId,
      pendingContractOffer: null,
      contractEngine: {
        ...engine,
        pendingOffer: null,
        offerHistory: history,
        lastDecision: effects,
      },
      lastEvent: messages[messages.length - 1],
    },
  }
}

function handleAccept(state, engine, offer, opts = {}) {
  const seasonNumber = opts.seasonNumber ?? state.currentSeason ?? 1
  const messages = []
  let contract = state.contract
  let currentTeamId = state.currentTeamId
  let status = { ...state.status }
  let finance = state.finance ? { ...state.finance } : state.finance

  if (offer.type === CONTRACT_OFFER_TYPES.buyout) {
    const payout = offer.buyoutPayout ?? 0
    status = {
      ...status,
      dinheiro: (status.dinheiro ?? 0) + payout,
    }
    contract = withWeeklySalary(
      createPlayerContract({
        ...contract,
        teamId: null,
        yearsRemaining: 0,
        yearlySalary: 0,
        weeklySalary: 0,
        freeAgencyStatus: resolveFreeAgencyStatus(contract, state.player),
        options: {
          playerOption: false,
          teamOption: false,
          playerOptionPending: false,
          teamOptionPending: false,
        },
      }),
    )
    currentTeamId = null
    messages.push(
      `Buyout aceito: +$${payout.toLocaleString('en-US')}. Você é free agent.`,
    )
  } else {
    const previous = state.contract
    contract = contractFromOffer(offer, previous, seasonNumber)
    // preservar seasonsInLeague
    contract = {
      ...contract,
      seasonsInLeague: previous?.seasonsInLeague ?? contract.seasonsInLeague,
      seasonsWithTeam:
        previous?.teamId === offer.fromTeamId
          ? (previous.seasonsWithTeam ?? 0)
          : 0,
    }
    contract = withWeeklySalary(contract)
    currentTeamId = offer.fromTeamId

    if (offer.signingBonus) {
      status = {
        ...status,
        dinheiro: (status.dinheiro ?? 0) + offer.signingBonus,
      }
      messages.push(
        `Bônus de assinatura: +$${offer.signingBonus.toLocaleString('en-US')}.`,
      )
    }

    const label =
      offer.type === CONTRACT_OFFER_TYPES.player_option
        ? 'Player Option exercida'
        : offer.type === CONTRACT_OFFER_TYPES.team_option
          ? 'Team Option exercida pela franquia'
          : `Contrato assinado com ${offer.fromTeamShort}`

    messages.push(
      `${label}: $${contract.yearlySalary.toLocaleString('en-US')}/ano · ${contract.yearsRemaining} ano(s).`,
    )

    if (contract.clauses?.tradeClause && contract.clauses.tradeClause !== 'none') {
      messages.push(`Cláusula: ${contract.clauses.tradeClause}.`)
    }
    if (contract.options?.playerOption) {
      messages.push('Inclui Player Option.')
    }
    if (contract.options?.teamOption) {
      messages.push('Inclui Team Option.')
    }
  }

  const history = appendOfferHistory(engine.offerHistory, {
    ...offer,
    status: 'accepted',
    resolvedAt: Date.now(),
  })

  const effects = {
    decision: CONTRACT_DECISIONS.accept,
    offer,
    contract,
    messages,
    deltas: {
      dinheiro:
        (status.dinheiro ?? 0) - (state.status?.dinheiro ?? 0),
    },
  }

  return {
    ok: true,
    error: null,
    effects,
    nextState: {
      ...state,
      contract,
      currentTeamId,
      status,
      finance,
      pendingContractOffer: null,
      contractEngine: {
        ...engine,
        pendingOffer: null,
        offerHistory: history,
        lastDecision: effects,
      },
      lastEvent: messages[messages.length - 1],
    },
  }
}

function appendOfferHistory(history = [], entry) {
  const next = [...history, entry]
  if (next.length <= MAX_OFFER_HISTORY) return next
  return next.slice(next.length - MAX_OFFER_HISTORY)
}

/**
 * Tick anual do contrato de carreira (season roll).
 */
export function tickCareerContract(contract, player, seasonRolled) {
  if (!seasonRolled || !contract) {
    return { contract, messages: [], expired: false, optionPending: null }
  }

  const messages = []
  let next = {
    ...contract,
    seasonsInLeague: (contract.seasonsInLeague ?? 0) + 1,
    seasonsWithTeam: contract.teamId
      ? (contract.seasonsWithTeam ?? 0) + 1
      : 0,
  }

  const yearsRemaining = Math.max(0, (next.yearsRemaining ?? 1) - 1)
  next = { ...next, yearsRemaining }

  // Ativar pendência de opções no último ano (após tick = 0 ou ao entrar no último)
  if (yearsRemaining === 1) {
    if (next.options?.playerOption) {
      next = {
        ...next,
        options: { ...next.options, playerOptionPending: true },
      }
    }
    if (next.options?.teamOption) {
      next = {
        ...next,
        options: { ...next.options, teamOptionPending: true },
      }
    }
  }

  if (yearsRemaining === 0) {
    const fa = resolveFreeAgencyStatus(next, player)
    next = {
      ...next,
      teamId: next.teamId, // mantém bird team até assinar
      freeAgencyStatus: fa,
      weeklySalary: 0,
    }
    messages.push(
      fa === FREE_AGENCY_STATUS.rfa
        ? 'Contrato expirou — você é Restricted Free Agent (RFA).'
        : 'Contrato expirou — você é Unrestricted Free Agent (UFA).',
    )
    return { contract: next, messages, expired: true, optionPending: null }
  }

  messages.push(`Contrato: ${yearsRemaining} ano(s) restante(s).`)
  return {
    contract: withWeeklySalary(next),
    messages,
    expired: false,
    optionPending:
      next.options?.playerOptionPending || next.options?.teamOptionPending
        ? next
        : null,
  }
}
