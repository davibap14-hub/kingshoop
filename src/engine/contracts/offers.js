import {
  BUYOUT_PAYOUT_PCT,
  CONTRACT_OFFER_TYPES,
  CONTRACT_YEARS_MAX,
  CONTRACT_YEARS_MIN,
  MAX_NEGOTIATE_ROUNDS,
  OPTION_SALARY_MULT,
  SIGNING_BONUS_MAX_PCT,
  SIGNING_BONUS_MIN_PCT,
  TRADE_CLAUSE,
} from '../../data/contracts'
import { SALARY_CAP } from '../../data/gm/constants'
import { getTeamById } from '../../data/teams'
import {
  calcBalancedRenewBump,
  calcBalancedSalary,
  clampSalary,
} from '../balance'
import { canAfford, teamPayroll } from '../gm/cap'
import {
  calcSalaryDemandFactor,
  calcRenewWillingness,
} from '../personality/contracts'
import { calculateRelationshipEffects } from '../relationships'
import { createPlayerContract } from './state.js'

let offerSeq = 0

function nextOfferId(prefix = 'offer') {
  offerSeq += 1
  return `${prefix}_${Date.now()}_${offerSeq}`
}

/**
 * Gera proposta automática de uma franquia.
 * Considera: overall, potencial, idade, popularidade, personalidade,
 * objetivos da franquia e salary cap.
 */
export function generateFranchiseOffer({
  teamId,
  player,
  contract = null,
  type = CONTRACT_OFFER_TYPES.offer,
  seasonNumber = 1,
  week = 1,
  relationships = null,
  franchiseObjective = null,
  gm = null,
  rng = Math.random,
} = {}) {
  if (!teamId || !player) return null

  const demand = calcSalaryDemandFactor(player, relationships)
  const relEffects = relationships
    ? calculateRelationshipEffects(relationships)
    : null

  let market = calcBalancedSalary(player, {
    seasonNumber,
    demandFactor: demand,
  })

  // Objetivos da franquia ajustam agressividade salarial
  const objId = franchiseObjective?.id ?? franchiseObjective ?? 'playoffs'
  market = applyObjectiveSalaryBias(market, objId, player)

  // Popularidade
  const pop =
    player.popularidade ??
    (relationships
      ? Math.round(
          ((relationships.fans ?? 40) + (relationships.press ?? 40)) / 2,
        )
      : 40)
  if (pop >= 70) market = Math.round(market * 1.08)
  else if (pop <= 25) market = Math.round(market * 0.92)

  // Renovação / extensão partem do salário atual
  if (
    (type === CONTRACT_OFFER_TYPES.renewal ||
      type === CONTRACT_OFFER_TYPES.extension) &&
    contract?.yearlySalary
  ) {
    const bump = calcBalancedRenewBump(player, demand)
    market = Math.round(contract.yearlySalary * bump)
  }

  // Cap check — reduz oferta se não couber
  if (gm?.contracts) {
    let yearsTry = pickYears(type, player, objId, rng)
    let salary = clampSalary(market)
    while (
      yearsTry >= CONTRACT_YEARS_MIN &&
      !canAfford(gm.contracts, teamId, salary, SALARY_CAP)
    ) {
      salary = clampSalary(salary * 0.92)
      if (salary <= 900_000) break
    }
    if (!canAfford(gm.contracts, teamId, salary, SALARY_CAP)) {
      return null
    }
    market = salary
  }

  const years = pickYears(type, player, objId, rng)
  const yearlySalary = clampSalary(market)
  const signingBonus = Math.round(
    yearlySalary *
      (SIGNING_BONUS_MIN_PCT +
        rng() * (SIGNING_BONUS_MAX_PCT - SIGNING_BONUS_MIN_PCT)),
  )

  const willingness = calcRenewWillingness(
    player,
    objId,
    relationships,
  )

  const options = pickOptions(type, player, objId, willingness, rng)
  const clauses = pickClauses(type, player, willingness, relEffects, rng)

  const team = getTeamById(teamId)

  return {
    id: nextOfferId(type),
    type,
    fromTeamId: teamId,
    fromTeamShort: team?.short ?? teamId,
    fromTeamName: team?.name ?? teamId,
    toPlayerId: player.id ?? 'career_player',
    yearlySalary,
    years,
    signingBonus,
    options,
    clauses,
    status: 'pending',
    negotiateRound: 0,
    maxNegotiateRounds: MAX_NEGOTIATE_ROUNDS,
    reason: buildOfferReason(type, objId, team),
    seasonNumber,
    week,
    createdAt: Date.now(),
    marketValue: yearlySalary,
    objectiveId: objId,
  }
}

/**
 * Player Option / Team Option para o último ano.
 */
export function generateOptionOffer({
  contract,
  player: _player,
  kind, // 'player_option' | 'team_option'
  seasonNumber,
  week,
}) {
  if (!contract?.teamId) return null
  const type =
    kind === 'team_option'
      ? CONTRACT_OFFER_TYPES.team_option
      : CONTRACT_OFFER_TYPES.player_option

  const yearlySalary = clampSalary(
    Math.round((contract.yearlySalary ?? 1_500_000) * OPTION_SALARY_MULT),
  )

  return {
    id: nextOfferId(type),
    type,
    fromTeamId: contract.teamId,
    fromTeamShort: getTeamById(contract.teamId)?.short ?? contract.teamId,
    fromTeamName: getTeamById(contract.teamId)?.name ?? contract.teamId,
    toPlayerId: contract.playerId ?? 'career_player',
    yearlySalary,
    years: 1,
    signingBonus: 0,
    options: { playerOption: false, teamOption: false },
    clauses: { ...(contract.clauses ?? { tradeClause: TRADE_CLAUSE.none }) },
    status: 'pending',
    negotiateRound: 0,
    maxNegotiateRounds: 0,
    reason:
      kind === 'team_option'
        ? 'A franquia decide se exerce a Team Option.'
        : 'Você decide se exerce a Player Option.',
    seasonNumber,
    week,
    createdAt: Date.now(),
    marketValue: yearlySalary,
  }
}

/**
 * Proposta de buyout.
 */
export function generateBuyoutOffer({
  contract,
  player,
  seasonNumber,
  week,
  reason = 'Franquia oferece espaço no teto',
}) {
  if (!contract?.teamId || !(contract.yearsRemaining > 0)) return null

  const remaining =
    (contract.yearlySalary ?? 0) * (contract.yearsRemaining ?? 1)
  const payout = Math.round(remaining * BUYOUT_PAYOUT_PCT)

  return {
    id: nextOfferId('buyout'),
    type: CONTRACT_OFFER_TYPES.buyout,
    fromTeamId: contract.teamId,
    fromTeamShort: getTeamById(contract.teamId)?.short ?? contract.teamId,
    fromTeamName: getTeamById(contract.teamId)?.name ?? contract.teamId,
    toPlayerId: contract.playerId ?? player?.id ?? 'career_player',
    yearlySalary: 0,
    years: 0,
    signingBonus: 0,
    buyoutPayout: payout,
    options: { playerOption: false, teamOption: false },
    clauses: { tradeClause: TRADE_CLAUSE.none },
    status: 'pending',
    negotiateRound: 0,
    maxNegotiateRounds: 1,
    reason,
    seasonNumber,
    week,
    createdAt: Date.now(),
    marketValue: payout,
  }
}

/**
 * Aplica oferta aceita → contrato do jogador.
 */
export function contractFromOffer(offer, previous = null, seasonNumber = 1) {
  if (!offer || offer.type === CONTRACT_OFFER_TYPES.buyout) {
    return null
  }

  return createPlayerContract({
    playerId: offer.toPlayerId,
    teamId: offer.fromTeamId,
    yearlySalary: offer.yearlySalary,
    yearsRemaining: offer.years,
    yearsTotal: offer.years,
    signingBonus: offer.signingBonus ?? 0,
    seasonsWithTeam:
      previous?.teamId === offer.fromTeamId
        ? (previous.seasonsWithTeam ?? 0) + 1
        : 1,
    seasonsInLeague: (previous?.seasonsInLeague ?? 0) + (previous ? 0 : 0),
    birdRights: true,
    options: {
      playerOption: Boolean(offer.options?.playerOption),
      teamOption: Boolean(offer.options?.teamOption),
      playerOptionPending: false,
      teamOptionPending: false,
    },
    clauses: {
      tradeClause: offer.clauses?.tradeClause ?? TRADE_CLAUSE.none,
    },
    signedAtSeason: seasonNumber,
    freeAgencyStatus: 'none',
  })
}

function applyObjectiveSalaryBias(salary, objId, player) {
  const overall = player?.overall ?? 70
  switch (objId) {
    case 'title':
    case 'titulo':
      return Math.round(salary * (overall >= 80 ? 1.12 : 1.05))
    case 'playoffs':
      return Math.round(salary * 1.03)
    case 'development':
    case 'desenvolvimento':
      return Math.round(salary * (player?.idade <= 23 ? 1.06 : 0.95))
    case 'tank':
      return Math.round(salary * 0.88)
    case 'economy':
    case 'economia':
      return Math.round(salary * 0.9)
    default:
      return salary
  }
}

function pickYears(type, player, objId, rng) {
  if (
    type === CONTRACT_OFFER_TYPES.player_option ||
    type === CONTRACT_OFFER_TYPES.team_option
  ) {
    return 1
  }
  let base = 2 + Math.floor(rng() * 2) // 2–3
  if ((player?.overall ?? 70) >= 85) base += 1
  if (objId === 'title' || objId === 'titulo') base += 1
  if (objId === 'tank' || objId === 'economy') base = Math.min(base, 2)
  if (type === CONTRACT_OFFER_TYPES.extension) base = Math.max(2, base)
  return Math.max(CONTRACT_YEARS_MIN, Math.min(CONTRACT_YEARS_MAX, base))
}

function pickOptions(type, player, objId, willingness, rng) {
  if (
    type === CONTRACT_OFFER_TYPES.buyout ||
    type === CONTRACT_OFFER_TYPES.player_option ||
    type === CONTRACT_OFFER_TYPES.team_option
  ) {
    return { playerOption: false, teamOption: false }
  }

  const star = (player?.overall ?? 70) >= 82
  const playerOption =
    star && willingness > 0.55 && rng() < 0.45
  const teamOption =
    !playerOption &&
    (objId === 'development' || objId === 'tank' || rng() < 0.35)

  return { playerOption, teamOption }
}

function pickClauses(type, player, willingness, relEffects, rng) {
  if (type === CONTRACT_OFFER_TYPES.buyout) {
    return { tradeClause: TRADE_CLAUSE.none }
  }

  const star = (player?.overall ?? 70) >= 84
  const agentAligned = relEffects?.flags?.agentAligned
  let tradeClause = TRADE_CLAUSE.none

  if (star && (willingness > 0.6 || agentAligned) && rng() < 0.4) {
    tradeClause = TRADE_CLAUSE.full
  } else if (star && rng() < 0.35) {
    tradeClause = TRADE_CLAUSE.limited
  }

  return { tradeClause }
}

function buildOfferReason(type, objId, team) {
  const name = team?.short ?? 'Franquia'
  switch (type) {
    case CONTRACT_OFFER_TYPES.renewal:
      return `${name} quer renovar (objetivo: ${objId}).`
    case CONTRACT_OFFER_TYPES.extension:
      return `${name} oferece extensão antecipada.`
    case CONTRACT_OFFER_TYPES.rfa_offer:
      return `${name} apresenta oferta qualificatória / RFA.`
    case CONTRACT_OFFER_TYPES.ufa_offer:
      return `${name} disputa você como UFA.`
    case CONTRACT_OFFER_TYPES.buyout:
      return `${name} propõe buyout.`
    default:
      return `${name} faz uma proposta de contrato.`
  }
}

export function teamCanAffordOffer(gm, teamId, yearlySalary) {
  if (!gm?.contracts) return true
  const payroll = teamPayroll(gm.contracts, teamId)
  return payroll + yearlySalary <= SALARY_CAP
}
