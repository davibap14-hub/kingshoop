import { ATTRIBUTE_GROUPS } from '../../data/players/schema'
import { calcGroupRating, calcOverall } from '../../data/players/utils'
import {
  EVOLUTION_GROUPS,
  POINT_STAT_GAIN,
} from '../../data/progression/constants'
import { getEffectiveAttrCap } from '../balance'
import { clamp } from '../utils/math'

/**
 * Teto do grupo — Balance Engine (arquétipo ∩ potencial ∩ hard).
 */
export function getGroupCap(archetypeId, groupKey, player = null) {
  if (player) return getEffectiveAttrCap(player, archetypeId, groupKey)
  return getEffectiveAttrCap({ potencial: 90 }, archetypeId, groupKey)
}

/**
 * Média atual do grupo no jogador detalhado.
 */
export function getGroupAverage(player, groupKey) {
  if (groupKey === 'qi') return calcGroupRating(player.qi)
  return calcGroupRating(player[groupKey])
}

/**
 * Verifica se o grupo ainda pode evoluir sob o teto do arquétipo.
 */
export function canEvolveGroup(player, archetypeId, groupKey) {
  if (!EVOLUTION_GROUPS.includes(groupKey)) return false
  const cap = getGroupCap(archetypeId, groupKey, player)
  const avg = getGroupAverage(player, groupKey)
  // Gradual: bloqueia quando média já está no teto
  if (avg >= cap) return false

  const group = player[groupKey === 'qi' ? 'qi' : groupKey]
  const keys = ATTRIBUTE_GROUPS[groupKey]?.keys ?? []
  // Precisa existir ao menos um attr abaixo do hard cap
  return keys.some((k) => (group?.[k] ?? 0) < cap)
}

/**
 * Lista grupos disponíveis para gastar pontos.
 */
export function listEvolvableGroups(player, archetypeId) {
  return EVOLUTION_GROUPS.map((groupKey) => {
    const cap = getGroupCap(archetypeId, groupKey, player)
    const average = getGroupAverage(player, groupKey)
    const available = canEvolveGroup(player, archetypeId, groupKey)
    return {
      id: groupKey,
      label: ATTRIBUTE_GROUPS[groupKey]?.label ?? groupKey,
      average,
      cap,
      available,
      room: Math.max(0, cap - average),
    }
  })
}

/**
 * Aplica 1 ponto de evolução de forma GRADUAL.
 * Sobe +1 no atributo mais baixo do grupo (respeitando cap do arquétipo).
 */
export function applyEvolutionPoint(player, archetypeId, groupKey, rng = Math.random) {
  if (!canEvolveGroup(player, archetypeId, groupKey)) {
    return {
      ok: false,
      error: `Grupo ${groupKey} já está no limite do arquétipo.`,
      player,
      changed: null,
    }
  }

  const cap = getGroupCap(archetypeId, groupKey, player)
  const attrKey = groupKey === 'qi' ? 'qi' : groupKey
  const keys = ATTRIBUTE_GROUPS[groupKey].keys
  const group = { ...player[attrKey] }

  // Candidatos abaixo do cap
  const candidates = keys.filter((k) => (group[k] ?? 0) < cap)
  if (!candidates.length) {
    return {
      ok: false,
      error: 'Nenhum atributo disponível abaixo do teto.',
      player,
      changed: null,
    }
  }

  // Gradual: prioriza o mais baixo; empate → sorteio leve
  candidates.sort((a, b) => (group[a] ?? 0) - (group[b] ?? 0))
  const lowest = group[candidates[0]] ?? 0
  const tied = candidates.filter((k) => (group[k] ?? 0) === lowest)
  const pick = tied[Math.floor(rng() * tied.length)]

  const previous = group[pick] ?? 0
  const next = clamp(previous + POINT_STAT_GAIN, 0, cap)
  group[pick] = next

  // Garante que a média do grupo não ultrapasse o cap
  // (caso edge com attrs já altos)
  let nextPlayer = {
    ...player,
    [attrKey]: group,
  }

  const newAvg = getGroupAverage(nextPlayer, groupKey)
  if (newAvg > cap) {
    // reverte se média estourou (não deveria com +1 no mais baixo)
    group[pick] = previous
    nextPlayer = { ...player, [attrKey]: group }
    return {
      ok: false,
      error: 'Evolução bloqueada pelo teto médio do arquétipo.',
      player,
      changed: null,
    }
  }

  nextPlayer = {
    ...nextPlayer,
    overall: calcOverall(nextPlayer),
  }

  return {
    ok: true,
    error: null,
    player: nextPlayer,
    changed: {
      group: groupKey,
      attribute: pick,
      label: ATTRIBUTE_GROUPS[groupKey].labels[pick],
      previous,
      next,
      groupAverage: getGroupAverage(nextPlayer, groupKey),
      cap,
    },
  }
}

/**
 * Gasta um ponto do estado de progressão.
 */
export function spendEvolutionPoint(state, groupKey, opts = {}) {
  const rng = opts.rng ?? Math.random
  const progression = state.progression
  if (!progression || (progression.evolutionPoints ?? 0) <= 0) {
    return {
      ok: false,
      error: 'Sem pontos de evolução disponíveis.',
      nextState: null,
      effects: null,
    }
  }

  const result = applyEvolutionPoint(
    state.player,
    state.archetypeId,
    groupKey,
    rng,
  )

  if (!result.ok) {
    return {
      ok: false,
      error: result.error,
      nextState: null,
      effects: null,
    }
  }

  const nextProgression = {
    ...progression,
    evolutionPoints: progression.evolutionPoints - 1,
  }

  const messages = [
    `Evolução: ${result.changed.label} ${result.changed.previous} → ${result.changed.next}.`,
    `${ATTRIBUTE_GROUPS[groupKey].label} médio: ${result.changed.groupAverage}/${result.changed.cap}.`,
  ]

  return {
    ok: true,
    error: null,
    effects: {
      group: groupKey,
      changed: result.changed,
      evolutionPointsLeft: nextProgression.evolutionPoints,
      messages,
    },
    nextState: {
      ...state,
      player: result.player,
      progression: nextProgression,
      lastEvent: messages[0],
    },
  }
}
