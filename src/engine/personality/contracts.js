import { balanceDemandFactor } from '../balance'
import { calculateRelationshipEffects } from '../relationships'
import { trait } from './traits'

/**
 * Fator de demanda salarial (1.0 = neutro).
 * Ego e ambição elevam; lealdade reduz.
 * Clamp final vem do Balance Engine; agente/GM vêm do Relationship Engine.
 */
export function calcSalaryDemandFactor(player, relationships = null) {
  if (!player) return 1

  const ego = trait(player, 'ego')
  const ambicao = trait(player, 'ambicao')
  const lealdade = trait(player, 'lealdade')
  const confianca = trait(player, 'confianca')

  let factor =
    1 +
    (ego - 50) * 0.0035 +
    (ambicao - 50) * 0.003 +
    (confianca - 50) * 0.0015 -
    (lealdade - 50) * 0.0025

  if (relationships) {
    const effects = calculateRelationshipEffects(relationships)
    factor *= effects.contractDemandFactor
  }

  return balanceDemandFactor(factor)
}

/**
 * Probabilidade relativa de aceitar renovação (0–1 scale boost).
 */
export function calcRenewWillingness(
  player,
  franchiseMode = 'balanced',
  relationships = null,
) {
  if (!player) return 0.5

  const lealdade = trait(player, 'lealdade')
  const ambicao = trait(player, 'ambicao')
  const ego = trait(player, 'ego')
  const competitividade = trait(player, 'competitividade')

  let score =
    0.45 +
    (lealdade - 50) * 0.006 -
    (ambicao - 50) * 0.004 -
    (ego - 55) * 0.003

  if (franchiseMode === 'contend' || franchiseMode === 'contender') {
    score += (competitividade - 50) * 0.004 + (ambicao - 50) * 0.002
  }
  if (franchiseMode === 'rebuild' || franchiseMode === 'reconstrucao') {
    score -= (ambicao - 50) * 0.005
    score += (lealdade - 50) * 0.003
  }

  if (relationships) {
    const effects = calculateRelationshipEffects(relationships)
    score += effects.renewWillingnessBonus
  }

  return Math.max(0.15, Math.min(0.95, score))
}

/**
 * Disposição a ser trocado / pedir saída (maior = mais fácil trocar).
 */
export function calcTradeWillingness(player, franchiseMode = 'balanced') {
  if (!player) return 0.5

  const lealdade = trait(player, 'lealdade')
  const ambicao = trait(player, 'ambicao')
  const temperamento = trait(player, 'temperamento')
  const ego = trait(player, 'ego')
  const competitividade = trait(player, 'competitividade')

  let score =
    0.4 -
    (lealdade - 50) * 0.007 +
    (ambicao - 50) * 0.005 +
    (temperamento - 50) * 0.003 +
    (ego - 55) * 0.002

  if (franchiseMode === 'rebuild' || franchiseMode === 'reconstrucao') {
    score += (ambicao - 45) * 0.004 + (competitividade - 50) * 0.003
  }
  if (franchiseMode === 'contend' || franchiseMode === 'contender') {
    score -= (competitividade - 50) * 0.003
  }

  return Math.max(0.1, Math.min(0.95, score))
}

/**
 * Ajuste de score GM para manter / contratar jogador.
 */
export function personalityContractScore(player, sit = {}) {
  const mode = sit.mode ?? sit.personalityId ?? 'balanced'
  const renew = calcRenewWillingness(player, mode)
  const demand = calcSalaryDemandFactor(player)
  const loyalty = trait(player, 'lealdade')
  const leadership = trait(player, 'lideranca')

  // Preferir líderes leais; penalizar demanda salarial alta em times financeiros
  let score = (renew - 0.5) * 0.35 + (leadership - 50) / 200 + (loyalty - 50) / 250
  if (sit.personalityId === 'financeira') {
    score -= (demand - 1) * 0.5
  }
  if (sit.mode === 'contend' || sit.personalityId === 'contender') {
    score += (trait(player, 'competitividade') - 50) / 180
  }
  return score
}
