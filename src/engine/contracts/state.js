import {
  FREE_AGENCY_STATUS,
  TRADE_CLAUSE,
  UFA_MIN_SEASONS,
} from '../../data/contracts'
import { WEEKS_PER_SEASON } from '../../data/constants/career'
import { clampSalary } from '../balance'

/**
 * Contrato enriquecido do jogador de carreira.
 */
export function createPlayerContract(overrides = {}) {
  const yearlySalary = clampSalary(overrides.yearlySalary ?? 1_500_000)
  const yearsRemaining = overrides.yearsRemaining ?? 3
  const yearsTotal = overrides.yearsTotal ?? yearsRemaining

  return {
    playerId: overrides.playerId ?? 'career_player',
    teamId: overrides.teamId ?? null,
    yearlySalary,
    weeklySalary:
      overrides.weeklySalary ?? Math.round(yearlySalary / WEEKS_PER_SEASON),
    yearsRemaining,
    yearsTotal,
    signingBonus: overrides.signingBonus ?? 0,
    seasonsWithTeam: overrides.seasonsWithTeam ?? 0,
    seasonsInLeague: overrides.seasonsInLeague ?? 0,
    birdRights: overrides.birdRights ?? true,
    freeAgencyStatus: overrides.freeAgencyStatus ?? FREE_AGENCY_STATUS.none,
    options: {
      playerOption: Boolean(overrides.options?.playerOption),
      teamOption: Boolean(overrides.options?.teamOption),
      playerOptionPending: Boolean(overrides.options?.playerOptionPending),
      teamOptionPending: Boolean(overrides.options?.teamOptionPending),
    },
    clauses: {
      tradeClause: overrides.clauses?.tradeClause ?? TRADE_CLAUSE.none,
    },
    signedAtSeason: overrides.signedAtSeason ?? 1,
  }
}

/**
 * Estado auxiliar da Contract Engine.
 */
export function createContractEngineState(overrides = {}) {
  return {
    pendingOffer: overrides.pendingOffer ?? null,
    offerHistory: overrides.offerHistory ?? [],
    lastDecision: overrides.lastDecision ?? null,
    lastNegotiation: overrides.lastNegotiation ?? null,
    marketWeekProcessed: overrides.marketWeekProcessed ?? null,
  }
}

/**
 * Migra contrato legado { teamId, yearsRemaining, yearlySalary, weeklySalary }.
 */
export function migrateLegacyContract(contract, extras = {}) {
  if (!contract) {
    return createPlayerContract({
      teamId: extras.teamId,
      yearlySalary: extras.yearlySalary,
      seasonsInLeague: extras.seasonsInLeague ?? 0,
    })
  }
  return createPlayerContract({
    ...contract,
    seasonsWithTeam: contract.seasonsWithTeam ?? 1,
    seasonsInLeague: contract.seasonsInLeague ?? extras.seasonsInLeague ?? 1,
    birdRights: contract.birdRights ?? true,
  })
}

/**
 * Classifica RFA / UFA ao expirar o contrato.
 */
export function resolveFreeAgencyStatus(contract, player = {}) {
  const seasons = contract?.seasonsInLeague ?? 0
  const age = player?.idade ?? 24
  const bird = contract?.birdRights !== false

  if (seasons >= UFA_MIN_SEASONS || age >= 25 && seasons >= 3) {
    return FREE_AGENCY_STATUS.ufa
  }
  if (bird || seasons >= 1) {
    return FREE_AGENCY_STATUS.rfa
  }
  return FREE_AGENCY_STATUS.ufa
}

export function withWeeklySalary(contract) {
  const yearly = clampSalary(contract.yearlySalary)
  return {
    ...contract,
    yearlySalary: yearly,
    weeklySalary: Math.round(yearly / WEEKS_PER_SEASON),
  }
}
