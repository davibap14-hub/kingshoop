import {
  CONTRACT_YEARS_MAX,
  CONTRACT_YEARS_MIN,
  MAX_NEGOTIATE_ROUNDS,
  TRADE_CLAUSE,
} from '../../data/contracts'
import { SALARY_CAP } from '../../data/gm/constants'
import { clampSalary } from '../balance'
import { canAfford } from '../gm/cap'
import { calcRenewWillingness } from '../personality/contracts'
import { calculateRelationshipEffects } from '../relationships'

/**
 * Jogador propõe termos; franquia responde com contra-proposta ou acordo.
 *
 * @param {object} offer — oferta pendente
 * @param {object} terms — { yearlySalary?, years?, signingBonus?, tradeClause?, playerOption?, teamOption? }
 * @param {object} context — { player, relationships, gm, franchiseObjective }
 */
export function negotiateOffer(offer, terms = {}, context = {}) {
  if (!offer || offer.status !== 'pending' && offer.status !== 'negotiating') {
    return {
      ok: false,
      error: 'Nenhuma oferta negociável.',
      offer: null,
      agreement: false,
    }
  }

  if ((offer.negotiateRound ?? 0) >= (offer.maxNegotiateRounds ?? MAX_NEGOTIATE_ROUNDS)) {
    return {
      ok: false,
      error: 'Limite de rodadas de negociação atingido.',
      offer,
      agreement: false,
    }
  }

  if (offer.type === 'buyout') {
    return negotiateBuyout(offer, terms, context)
  }

  if (
    offer.type === 'player_option' ||
    offer.type === 'team_option'
  ) {
    return {
      ok: false,
      error: 'Opções não são negociáveis — aceite ou recuse.',
      offer,
      agreement: false,
    }
  }

  const player = context.player
  const relationships = context.relationships
  const objId =
    context.franchiseObjective?.id ??
    offer.objectiveId ??
    'playoffs'

  const willingness = calcRenewWillingness(player, objId, relationships)
  const relEffects = relationships
    ? calculateRelationshipEffects(relationships)
    : null
  const agentBoost = relEffects?.flags?.agentAligned ? 0.08 : 0

  const askedSalary = clampSalary(
    terms.yearlySalary ?? offer.yearlySalary,
  )
  const askedYears = clampInt(
    terms.years ?? offer.years,
    CONTRACT_YEARS_MIN,
    CONTRACT_YEARS_MAX,
  )
  const askedBonus = Math.max(
    0,
    Math.round(terms.signingBonus ?? offer.signingBonus ?? 0),
  )
  const askedTrade =
    terms.tradeClause ?? offer.clauses?.tradeClause ?? TRADE_CLAUSE.none
  const askedPO = terms.playerOption ?? offer.options?.playerOption
  const askedTO = terms.teamOption ?? offer.options?.teamOption

  const market = offer.marketValue ?? offer.yearlySalary
  const salaryRoom = market * (1.08 + willingness * 0.12 + agentBoost)
  const salaryFloor = market * (0.88 - (1 - willingness) * 0.05)

  let counterSalary = askedSalary
  let agreement = true

  if (askedSalary > salaryRoom) {
    counterSalary = clampSalary(salaryRoom)
    agreement = false
  } else if (askedSalary < salaryFloor) {
    // franquia topa, mas não sobe além do pedido
    counterSalary = askedSalary
  }

  // Cap
  if (
    context.gm?.contracts &&
    !canAfford(
      context.gm.contracts,
      offer.fromTeamId,
      counterSalary,
      SALARY_CAP,
    )
  ) {
    counterSalary = clampSalary(counterSalary * 0.9)
    agreement = false
  }

  let counterYears = askedYears
  if (askedYears > offer.years + 1 && willingness < 0.7) {
    counterYears = offer.years + 1
    agreement = false
  }

  let counterBonus = askedBonus
  const maxBonus = Math.round(counterSalary * 0.15)
  if (askedBonus > maxBonus) {
    counterBonus = maxBonus
    agreement = false
  }

  let counterTrade = askedTrade
  if (
    askedTrade === TRADE_CLAUSE.full &&
    willingness < 0.65 &&
    (player?.overall ?? 70) < 86
  ) {
    counterTrade = TRADE_CLAUSE.limited
    agreement = false
  }

  let counterPO = askedPO
  let counterTO = askedTO
  if (askedPO && willingness < 0.55) {
    counterPO = false
    counterTO = true
    agreement = false
  }

  const round = (offer.negotiateRound ?? 0) + 1
  const nextOffer = {
    ...offer,
    status: agreement ? 'pending' : 'negotiating',
    yearlySalary: counterSalary,
    years: counterYears,
    signingBonus: counterBonus,
    options: {
      playerOption: Boolean(counterPO),
      teamOption: Boolean(counterTO),
    },
    clauses: {
      tradeClause: counterTrade,
    },
    negotiateRound: round,
    lastPlayerTerms: {
      yearlySalary: askedSalary,
      years: askedYears,
      signingBonus: askedBonus,
      tradeClause: askedTrade,
      playerOption: askedPO,
      teamOption: askedTO,
    },
  }

  // Se na última rodada ainda não fechou, franquia dá última proposta
  if (!agreement && round >= (offer.maxNegotiateRounds ?? MAX_NEGOTIATE_ROUNDS)) {
    nextOffer.status = 'pending'
  }

  return {
    ok: true,
    error: null,
    offer: nextOffer,
    agreement,
    messages: [
      agreement
        ? 'Franquia topa os termos negociados.'
        : `Contra-proposta: $${counterSalary.toLocaleString('en-US')}/ano · ${counterYears} ano(s).`,
    ],
  }
}

function negotiateBuyout(offer, terms, context) {
  const asked = Math.round(terms.buyoutPayout ?? offer.buyoutPayout ?? 0)
  const base = offer.buyoutPayout ?? 0
  const willingness = calcRenewWillingness(
    context.player,
    offer.objectiveId ?? 'economy',
    context.relationships,
  )
  const ceiling = Math.round(base * (1.15 + willingness * 0.1))
  const round = (offer.negotiateRound ?? 0) + 1

  if (asked <= ceiling) {
    return {
      ok: true,
      error: null,
      offer: {
        ...offer,
        buyoutPayout: asked,
        status: 'pending',
        negotiateRound: round,
      },
      agreement: true,
      messages: [`Buyout acordado: $${asked.toLocaleString('en-US')}.`],
    }
  }

  const counter = ceiling
  return {
    ok: true,
    error: null,
    offer: {
      ...offer,
      buyoutPayout: counter,
      status: 'negotiating',
      negotiateRound: round,
    },
    agreement: false,
    messages: [
      `Franquia oferece no máximo $${counter.toLocaleString('en-US')} no buyout.`,
    ],
  }
}

function clampInt(n, min, max) {
  return Math.max(min, Math.min(max, Math.round(Number(n) || min)))
}
