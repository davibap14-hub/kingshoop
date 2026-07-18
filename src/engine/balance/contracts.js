import {
  CONTRACT_AGE_BONUS_PER_YEAR_UNDER_PEAK,
  CONTRACT_AGE_PEAK,
  CONTRACT_AGE_PENALTY_PER_YEAR,
  CONTRACT_BASE_SALARY,
  CONTRACT_DEMAND_MAX,
  CONTRACT_DEMAND_MIN,
  CONTRACT_INFLATION_PER_SEASON,
  CONTRACT_MAX_SALARY,
  CONTRACT_MIN_SALARY,
  CONTRACT_OVERALL_BASELINE,
  CONTRACT_PER_OVERALL,
  CONTRACT_POTENTIAL_PER_POINT,
  CONTRACT_RENEW_BASE_BUMP,
  CONTRACT_RENEW_MAX_BUMP,
  ROOKIE_CONTRACT_SCALE,
  ROOKIE_MAX_AGE,
} from '../../data/balance'
import { calcOverall } from '../../data/players/utils'
import { clamp } from '../utils/math'

/**
 * Limita o fator de demanda salarial da Personality Engine.
 */
export function balanceDemandFactor(factor = 1) {
  return clamp(factor, CONTRACT_DEMAND_MIN, CONTRACT_DEMAND_MAX)
}

/**
 * Inflação acumulada da liga por temporada.
 */
export function calcLeagueInflation(seasonNumber = 1) {
  const seasons = Math.max(0, (seasonNumber ?? 1) - 1)
  return (1 + CONTRACT_INFLATION_PER_SEASON) ** seasons
}

/**
 * Salário anual equilibrado (overall, potencial, idade, rookie, inflação, demanda).
 */
export function calcBalancedSalary(player, opts = {}) {
  const overall = player?.overall ?? calcOverall(player) ?? 70
  const potential = player?.potencial ?? overall
  const age = player?.idade ?? 24
  const seasonNumber = opts.seasonNumber ?? 1
  const demand = balanceDemandFactor(opts.demandFactor ?? 1)

  let salary = CONTRACT_BASE_SALARY
  salary += Math.max(0, overall - CONTRACT_OVERALL_BASELINE) * CONTRACT_PER_OVERALL
  salary += Math.max(0, potential - overall) * CONTRACT_POTENTIAL_PER_POINT

  const ageDelta = age - CONTRACT_AGE_PEAK
  if (ageDelta > 0) {
    salary *= 1 - ageDelta * CONTRACT_AGE_PENALTY_PER_YEAR
  } else {
    salary *= 1 + Math.abs(ageDelta) * CONTRACT_AGE_BONUS_PER_YEAR_UNDER_PEAK
  }

  if (age <= ROOKIE_MAX_AGE || player?.isProspect) {
    salary *= ROOKIE_CONTRACT_SCALE
  }

  salary *= calcLeagueInflation(seasonNumber)
  salary *= demand

  return clamp(
    Math.round(salary),
    CONTRACT_MIN_SALARY,
    CONTRACT_MAX_SALARY,
  )
}

/**
 * Multiplicador de renovação equilibrado.
 */
export function calcBalancedRenewBump(player, demandFactor = 1) {
  const demand = balanceDemandFactor(demandFactor)
  const age = player?.idade ?? 27
  let bump = CONTRACT_RENEW_BASE_BUMP * demand

  if (age >= CONTRACT_AGE_PEAK + 4) {
    bump *= 0.92
  } else if (age <= ROOKIE_MAX_AGE) {
    bump *= 1.04
  }

  return clamp(bump, 1.0, CONTRACT_RENEW_MAX_BUMP)
}

/**
 * Ajusta salário bruto (ex.: draft) para os limites de balance.
 */
export function clampSalary(salary) {
  return clamp(
    Math.round(salary ?? CONTRACT_MIN_SALARY),
    CONTRACT_MIN_SALARY,
    CONTRACT_MAX_SALARY,
  )
}
