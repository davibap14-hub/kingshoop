import { CHEMISTRY_NEUTRAL } from '../../data/chemistry'
import { trait } from '../personality/traits'
import { clampChemistry, pairKey } from './state.js'

/**
 * Química inicial determinística entre dois jogadores (só pesos de personalidade).
 * Sem RNG.
 */
export function calcInitialPairChemistry(playerA, playerB) {
  if (!playerA || !playerB || playerA.id === playerB.id) {
    return CHEMISTRY_NEUTRAL
  }

  const leadA = trait(playerA, 'lideranca')
  const leadB = trait(playerB, 'lideranca')
  const loyA = trait(playerA, 'lealdade')
  const loyB = trait(playerB, 'lealdade')
  const egoA = trait(playerA, 'ego')
  const egoB = trait(playerB, 'ego')
  const temperA = trait(playerA, 'temperamento')
  const temperB = trait(playerB, 'temperamento')
  const discA = trait(playerA, 'disciplina')
  const discB = trait(playerB, 'disciplina')
  const compA = trait(playerA, 'competitividade')
  const compB = trait(playerB, 'competitividade')

  let score = CHEMISTRY_NEUTRAL

  // Liderança + lealdade elevam o vínculo
  score += ((leadA + leadB) / 2 - 50) * 0.35
  score += ((loyA + loyB) / 2 - 50) * 0.4

  // Choque de egos / temperamentos
  score -= Math.abs(egoA - egoB) * 0.35
  score -= Math.max(0, (egoA + egoB) / 2 - 65) * 0.45
  score -= Math.max(0, (temperA + temperB) / 2 - 60) * 0.4
  score -= Math.abs(temperA - temperB) * 0.15

  // Disciplina e competitividade alinhadas
  score += ((discA + discB) / 2 - 50) * 0.2
  score += (50 - Math.abs(compA - compB)) * 0.12

  // Mesmo arquétipo — afinidade tática; mesma posição — disputa de minutos
  if (playerA.arquetipo && playerA.arquetipo === playerB.arquetipo) {
    score += 6
  }
  if (playerA.posicao && playerA.posicao === playerB.posicao) {
    score -= 4
  }

  return clampChemistry(score)
}

/**
 * Garante pares inicializados para um elenco (determinístico).
 */
export function ensureRosterPairs(chemistryState, players = []) {
  let next = {
    ...chemistryState,
    pairs: { ...(chemistryState?.pairs ?? {}) },
  }

  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const a = players[i]
      const b = players[j]
      const key = pairKey(a.id, b.id)
      if (!key || next.pairs[key] != null) continue
      next.pairs[key] = calcInitialPairChemistry(a, b)
    }
  }

  return next
}
