import { TRADE_CLAUSE } from '../../data/contracts/constants'
import { ROSTER_SIZE_MAX, ROSTER_SIZE_MIN } from '../../data/gm/constants'
import {
  MAX_PICKS_PER_SIDE,
  MAX_PLAYERS_PER_SIDE,
  MAX_VALUE_RATIO,
  MIN_PARTNER_SURPLUS,
  SALARY_MATCH_CUSHION,
  SALARY_MATCH_RATIO,
} from '../../data/trade/constants.js'
import { resolvePlayer } from '../gm/situation.js'
import { calcTradeWillingness } from '../personality/contracts.js'
import { calcPackageValue } from './value.js'

/**
 * Monta asset tipado a partir de ids.
 */
export function buildPlayerAsset(gm, playerId) {
  const player = resolvePlayer(gm, playerId)
  if (!player) return null
  return {
    type: 'player',
    playerId,
    player,
    contract: gm.contracts?.[playerId] ?? null,
  }
}

export function buildPickAsset(pick) {
  if (!pick) return null
  return { type: 'pick', pickId: pick.id, pick }
}

export function packageSalary(assets) {
  return (assets ?? [])
    .filter((a) => a.type === 'player')
    .reduce(
      (s, a) => s + (a.contract?.yearlySalary ?? a.player?.salario ?? 0),
      0,
    )
}

export function packagePlayerIds(assets) {
  return (assets ?? [])
    .filter((a) => a.type === 'player')
    .map((a) => a.playerId)
}

export function packagePickIds(assets) {
  return (assets ?? []).filter((a) => a.type === 'pick').map((a) => a.pickId)
}

function hasFullNtc(asset) {
  if (asset.type !== 'player') return false
  const clause =
    asset.player?.clauses?.tradeClause ??
    asset.contract?.clauses?.tradeClause ??
    TRADE_CLAUSE.none
  return clause === TRADE_CLAUSE.full
}

/**
 * Valida se a troca é realista — nunca aprova trocas irreais.
 */
export function validateTrade(gm, proposal, sitA, sitB, seasonState = {}) {
  const reasons = []
  const { teamA, teamB, assetsA, assetsB } = proposal

  if (!teamA || !teamB || teamA === teamB) {
    return { ok: false, reasons: ['Times inválidos'] }
  }

  const playersA = packagePlayerIds(assetsA)
  const playersB = packagePlayerIds(assetsB)
  const picksA = packagePickIds(assetsA)
  const picksB = packagePickIds(assetsB)

  if (
    playersA.length + picksA.length === 0 ||
    playersB.length + picksB.length === 0
  ) {
    reasons.push('Cada lado precisa enviar ao menos um ativo')
  }
  if (
    playersA.length > MAX_PLAYERS_PER_SIDE ||
    playersB.length > MAX_PLAYERS_PER_SIDE
  ) {
    reasons.push('Excesso de jogadores no pacote')
  }
  if (picksA.length > MAX_PICKS_PER_SIDE || picksB.length > MAX_PICKS_PER_SIDE) {
    reasons.push('Excesso de escolhas no pacote')
  }

  for (const id of playersA) {
    if (!(gm.rosters?.[teamA] ?? []).includes(id)) {
      reasons.push(`Jogador ${id} não está no elenco A`)
    }
  }
  for (const id of playersB) {
    if (!(gm.rosters?.[teamB] ?? []).includes(id)) {
      reasons.push(`Jogador ${id} não está no elenco B`)
    }
  }

  for (const asset of assetsA) {
    if (asset.type === 'pick' && asset.pick?.ownerTeamId !== teamA) {
      reasons.push(`Pick ${asset.pickId} não pertence a ${teamA}`)
    }
    if (hasFullNtc(asset)) {
      reasons.push(`NTC bloqueia ${asset.player?.nome ?? asset.playerId}`)
    }
  }
  for (const asset of assetsB) {
    if (asset.type === 'pick' && asset.pick?.ownerTeamId !== teamB) {
      reasons.push(`Pick ${asset.pickId} não pertence a ${teamB}`)
    }
    if (hasFullNtc(asset)) {
      reasons.push(`NTC bloqueia ${asset.player?.nome ?? asset.playerId}`)
    }
  }

  const sizeA =
    (gm.rosters?.[teamA]?.length ?? 0) - playersA.length + playersB.length
  const sizeB =
    (gm.rosters?.[teamB]?.length ?? 0) - playersB.length + playersA.length
  if (sizeA < ROSTER_SIZE_MIN || sizeA > ROSTER_SIZE_MAX) {
    reasons.push('Elenco A ficaria fora dos limites')
  }
  if (sizeB < ROSTER_SIZE_MIN || sizeB > ROSTER_SIZE_MAX) {
    reasons.push('Elenco B ficaria fora dos limites')
  }

  const salOutA = packageSalary(assetsA)
  const salInA = packageSalary(assetsB)
  const salOutB = packageSalary(assetsB)
  const salInB = packageSalary(assetsA)

  if (salInA > salOutA * SALARY_MATCH_RATIO + SALARY_MATCH_CUSHION) {
    reasons.push('Salários não batem para o time A (cap matching)')
  }
  if (salInB > salOutB * SALARY_MATCH_RATIO + SALARY_MATCH_CUSHION) {
    reasons.push('Salários não batem para o time B (cap matching)')
  }

  if (sitA.cap?.overCap && salInA > salOutA) {
    reasons.push('Time A acima do teto não pode aumentar payroll')
  }
  if (sitB.cap?.overCap && salInB > salOutB) {
    reasons.push('Time B acima do teto não pode aumentar payroll')
  }

  for (const asset of assetsA) {
    if (asset.type !== 'player') continue
    const will = calcTradeWillingness(asset.player, sitA.objectiveId)
    if (will < 0.22 && (asset.player.overall ?? 0) >= 82) {
      reasons.push(`${asset.player.nome} recusa saída (lealdade)`)
    }
  }
  for (const asset of assetsB) {
    if (asset.type !== 'player') continue
    const will = calcTradeWillingness(asset.player, sitB.objectiveId)
    if (will < 0.22 && (asset.player.overall ?? 0) >= 82) {
      reasons.push(`${asset.player.nome} recusa saída (lealdade)`)
    }
  }

  if (sitA.objectiveId === 'title') {
    const givingStar = assetsA.some(
      (a) => a.type === 'player' && (a.player.overall ?? 0) >= 86,
    )
    const gettingStar = assetsB.some(
      (a) => a.type === 'player' && (a.player.overall ?? 0) >= 84,
    )
    if (givingStar && !gettingStar) {
      reasons.push('Contender não envia estrela sem retorno equivalente')
    }
  }
  if (sitB.objectiveId === 'title') {
    const givingStar = assetsB.some(
      (a) => a.type === 'player' && (a.player.overall ?? 0) >= 86,
    )
    const gettingStar = assetsA.some(
      (a) => a.type === 'player' && (a.player.overall ?? 0) >= 84,
    )
    if (givingStar && !gettingStar) {
      reasons.push('Parceiro contender não envia estrela sem retorno')
    }
  }

  const valueGiveA = calcPackageValue(assetsA, sitA, seasonState, {
    asOutgoing: true,
  })
  const valueGetA = calcPackageValue(assetsB, sitA, seasonState)
  const valueGiveB = calcPackageValue(assetsB, sitB, seasonState, {
    asOutgoing: true,
  })
  const valueGetB = calcPackageValue(assetsA, sitB, seasonState)

  const surplusA = valueGetA - valueGiveA
  const surplusB = valueGetB - valueGiveB

  const ratioA =
    Math.max(valueGetA, valueGiveA, 1) / Math.max(Math.min(valueGetA, valueGiveA), 1)
  const ratioB =
    Math.max(valueGetB, valueGiveB, 1) / Math.max(Math.min(valueGetB, valueGiveB), 1)

  if (ratioA > MAX_VALUE_RATIO || ratioB > MAX_VALUE_RATIO) {
    reasons.push('Desequilíbrio de valor irreal')
  }
  if (surplusB < MIN_PARTNER_SURPLUS) {
    reasons.push('Parceiro rejeita — surplus insuficiente')
  }
  if (surplusA < MIN_PARTNER_SURPLUS - 2) {
    reasons.push('Proponente rejeita — surplus insuficiente')
  }

  if (reasons.length) {
    return {
      ok: false,
      reasons,
      surplusA,
      surplusB,
      valueGiveA,
      valueGetA,
      valueGiveB,
      valueGetB,
    }
  }

  return {
    ok: true,
    reasons: [],
    surplusA,
    surplusB,
    valueGiveA,
    valueGetA,
    valueGiveB,
    valueGetB,
    fairness: Math.round(Math.max(ratioA, ratioB) * 100) / 100,
  }
}
