import {
  MARKET_VALUE_MAX,
  MARKET_VALUE_MIN,
  MARKET_VALUE_WEIGHTS,
  OBJECTIVE_TRADE_BIAS,
} from '../../data/trade/constants.js'
import { calcBalancedSalary } from '../balance'
import { resolvePlayer } from '../gm/situation.js'
import { calcTradeWillingness } from '../personality/contracts'
import { clamp } from '../utils/math'
import { calcPickMarketValue } from './picks.js'

/**
 * Valor de mercado absoluto do atleta (chips).
 * Overall · Idade · Potencial · Contrato · Personalidade · Posição (contexto).
 */
export function calcPlayerMarketValue(player, contract = null, opts = {}) {
  if (!player) return 0

  const w = MARKET_VALUE_WEIGHTS
  const overall = Number(player.overall) || 70
  const potential = Number(player.potencial) || overall
  const age = Number(player.idade) || 27

  let ageScore = 70
  if (age <= 22) ageScore = 78 + (22 - age) * 1.5
  else if (age <= 25) ageScore = 85
  else if (age <= 28) ageScore = 82
  else if (age <= 31) ageScore = 72 - (age - 28) * 4
  else ageScore = 55 - (age - 31) * 5

  const upside = Math.max(0, potential - overall)
  const potScore = potential + upside * (age <= 24 ? 0.8 : 0.35)

  const salary = contract?.yearlySalary ?? player.salario ?? 0
  const years = contract?.yearsRemaining ?? 1
  const fair = calcBalancedSalary(player, {
    seasonNumber: opts.seasonNumber ?? 1,
  })
  let contractScore = 70
  if (fair > 0) {
    const ratio = salary / fair
    if (ratio > 1.2) contractScore = 55 - (ratio - 1.2) * 40
    else if (ratio < 0.85) contractScore = 82 + (0.85 - ratio) * 25
    else contractScore = 72
    if (years >= 3 && ratio > 1.1) contractScore -= 8
    if (years <= 1 && overall >= 80) contractScore += 6
  }

  const pers = player.personalidade ?? {}
  const persAdj =
    ((pers.ambicao ?? 50) - 50) * 0.08 +
    ((pers.ego ?? 50) - 50) * 0.06 -
    ((pers.lealdade ?? 50) - 50) * 0.05

  let value =
    overall * w.overall * 1.15 +
    potScore * w.potential +
    ageScore * w.age +
    contractScore * w.contract +
    persAdj

  if (opts.buyerNeeds?.includes(player.posicao)) {
    value += 6
  }

  return clamp(Math.round(value), MARKET_VALUE_MIN, MARKET_VALUE_MAX)
}

/**
 * Valor contextual para uma franquia (objetivo + necessidade + cap).
 */
export function calcContextualAssetValue(asset, sit, seasonState = {}, opts = {}) {
  if (asset.type === 'pick') {
    let v = calcPickMarketValue(asset.pick, seasonState)
    const bias =
      OBJECTIVE_TRADE_BIAS[sit.objectiveId] ?? OBJECTIVE_TRADE_BIAS.playoffs
    v *= bias.pick
    return Math.round(v * 10) / 10
  }

  const player = asset.player
  const contract = asset.contract
  let v = calcPlayerMarketValue(player, contract, {
    seasonNumber: seasonState.seasonNumber ?? 1,
    buyerNeeds: sit.needs,
  })

  const bias =
    OBJECTIVE_TRADE_BIAS[sit.objectiveId] ?? OBJECTIVE_TRADE_BIAS.playoffs
  const age = player.idade ?? 27
  const overall = player.overall ?? 70

  if (age <= 24) v *= bias.youth
  if (overall >= 84) v *= bias.star

  const salary = contract?.yearlySalary ?? player.salario ?? 0
  if (sit.objectiveId === 'economy' || sit.cap?.usagePct >= 95) {
    v -= (salary / 12_000_000) * bias.salary
  }

  if (opts.asOutgoing) {
    const will = calcTradeWillingness(player, sit.objectiveId)
    v *= 0.85 + will * 0.3
  }

  return Math.round(v * 10) / 10
}

export function calcPackageValue(packageAssets, sit, seasonState, opts = {}) {
  let total = 0
  for (const asset of packageAssets) {
    total += calcContextualAssetValue(asset, sit, seasonState, opts)
  }
  return Math.round(total * 10) / 10
}

/**
 * Lista top valores de mercado de um elenco.
 */
export function listRosterMarketValues(gm, teamId, seasonState = {}) {
  const ids = gm.rosters?.[teamId] ?? []
  return ids
    .map((id) => {
      const player = resolvePlayer(gm, id)
      if (!player) return null
      const contract = gm.contracts?.[id] ?? null
      const value = calcPlayerMarketValue(player, contract, {
        seasonNumber: seasonState.seasonNumber ?? 1,
      })
      return {
        playerId: id,
        name: player.nome,
        posicao: player.posicao,
        overall: player.overall,
        idade: player.idade,
        potencial: player.potencial,
        salary: contract?.yearlySalary ?? player.salario ?? 0,
        yearsRemaining: contract?.yearsRemaining ?? null,
        marketValue: value,
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.marketValue - a.marketValue)
}
