import {
  CONTRACT_OFFER_LABELS,
  FREE_AGENCY_STATUS,
  TRADE_CLAUSE_LABELS,
} from '../../data/contracts'
import { getTeamById } from '../../data/teams'
import {
  createContractEngineState,
  migrateLegacyContract,
} from './state.js'

/**
 * Visão read-only para a Interface.
 */
export function getContractView(state = {}) {
  const contract = migrateLegacyContract(state.contract, {
    teamId: state.currentTeamId,
  })
  const engine = createContractEngineState(state.contractEngine)
  const pending =
    state.pendingContractOffer ?? engine.pendingOffer ?? null
  const team = contract.teamId ? getTeamById(contract.teamId) : null

  return {
    contract: {
      ...contract,
      teamShort: team?.short ?? null,
      teamName: team?.name ?? 'Free Agent',
      tradeClauseLabel:
        TRADE_CLAUSE_LABELS[contract.clauses?.tradeClause] ??
        TRADE_CLAUSE_LABELS.none,
      freeAgencyLabel: faLabel(contract.freeAgencyStatus),
      hasPlayerOption: Boolean(contract.options?.playerOption),
      hasTeamOption: Boolean(contract.options?.teamOption),
    },
    pendingOffer: pending ? summarizeOffer(pending) : null,
    history: (engine.offerHistory ?? [])
      .slice()
      .reverse()
      .slice(0, 8)
      .map(summarizeOffer),
    lastDecision: engine.lastDecision,
  }
}

export function summarizeOffer(offer) {
  if (!offer) return null
  return {
    id: offer.id,
    type: offer.type,
    typeLabel: CONTRACT_OFFER_LABELS[offer.type] ?? offer.type,
    fromTeamId: offer.fromTeamId,
    fromTeamShort: offer.fromTeamShort,
    fromTeamName: offer.fromTeamName,
    yearlySalary: offer.yearlySalary,
    years: offer.years,
    signingBonus: offer.signingBonus ?? 0,
    buyoutPayout: offer.buyoutPayout ?? null,
    options: offer.options,
    clauses: offer.clauses,
    tradeClauseLabel:
      TRADE_CLAUSE_LABELS[offer.clauses?.tradeClause] ??
      TRADE_CLAUSE_LABELS.none,
    reason: offer.reason,
    status: offer.status,
    negotiateRound: offer.negotiateRound ?? 0,
    maxNegotiateRounds: offer.maxNegotiateRounds ?? 0,
    decisions: availableDecisions(offer),
  }
}

function availableDecisions(offer) {
  if (
    offer.type === 'player_option' ||
    offer.type === 'team_option'
  ) {
    return [
      { id: 'accept', label: 'Exercer opção' },
      { id: 'refuse', label: 'Recusar opção' },
    ]
  }
  if (offer.type === 'buyout') {
    return [
      { id: 'accept', label: 'Aceitar buyout' },
      { id: 'negotiate', label: 'Negociar valor' },
      { id: 'refuse', label: 'Recusar' },
    ]
  }
  return [
    { id: 'accept', label: 'Aceitar' },
    { id: 'negotiate', label: 'Negociar' },
    { id: 'refuse', label: 'Recusar' },
  ]
}

function faLabel(status) {
  if (status === FREE_AGENCY_STATUS.rfa) return 'RFA'
  if (status === FREE_AGENCY_STATUS.ufa) return 'UFA'
  return 'Sob contrato'
}
