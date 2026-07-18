import {
  MOMENTUM_EFFECT_KEYS,
  MOMENTUM_MOD_CAP,
  MOMENTUM_MOD_SLOPE,
  MOMENTUM_NEUTRAL,
} from '../../data/momentum/constants.js'
import { clampMomentum } from './state.js'

/**
 * Modificadores pequenos e progressivos a partir do valor 0–100.
 * Nunca alteram drasticamente — teto ±MOMENTUM_MOD_CAP.
 */
export function buildMomentumEffects(momentumValue) {
  const value = clampMomentum(momentumValue)
  const delta = value - MOMENTUM_NEUTRAL
  let mod = delta * MOMENTUM_MOD_SLOPE
  mod = Math.max(-MOMENTUM_MOD_CAP, Math.min(MOMENTUM_MOD_CAP, mod))

  // Agressividade reage um pouco mais a momentum alto; confiança idem
  const confidence = 1 + mod
  const decision = 1 + mod * 0.9
  const accuracy = 1 + mod * 0.95
  const aggressiveness = 1 + mod * 1.05

  return {
    value,
    mod,
    confidence,
    decision,
    accuracy,
    aggressiveness,
    // Score 0–100 para Decision Engine (sit.momentum)
    decisionScore: value,
  }
}

/**
 * Aplica modificadores leves aos atributos efetivos (só perfil de posse).
 */
export function applyMomentumToPlayer(player, effects) {
  if (!player || !effects) return player
  const conf = effects.confidence ?? 1
  const dec = effects.decision ?? 1
  const acc = effects.accuracy ?? 1
  const agg = effects.aggressiveness ?? 1

  const scale = (group, map) => {
    if (!player[group]) return player[group]
    const next = { ...player[group] }
    for (const [key, mult] of Object.entries(map)) {
      if (next[key] != null) {
        next[key] = Math.max(1, Math.round(Number(next[key]) * mult))
      }
    }
    return next
  }

  return {
    ...player,
    fisico: scale('fisico', {
      velocidade: (1 + (agg - 1) * 0.6 + (conf - 1) * 0.4),
      forca: agg,
    }),
    arremesso: scale('arremesso', {
      bandeja: acc,
      midRange: acc,
      tresPontos: acc,
      lanceLivre: Math.min(1.05, acc + 0.01),
    }),
    defesa: scale('defesa', {
      perimetro: (1 + (agg - 1) * 0.5 + (conf - 1) * 0.5),
      garrafao: agg,
      roubo: agg,
      toco: (1 + (agg - 1) * 0.7),
    }),
    qi: scale('qi', {
      passe: dec,
      visao: dec,
      tomadaDecisao: dec,
    }),
    // Personalidade efetiva leve (confiança)
    personalidade: player.personalidade
      ? {
          ...player.personalidade,
          confianca: Math.max(
            1,
            Math.min(
              99,
              Math.round((player.personalidade.confianca ?? 50) * conf),
            ),
          ),
          competitividade: Math.max(
            1,
            Math.min(
              99,
              Math.round(
                (player.personalidade.competitividade ?? 50) * agg,
              ),
            ),
          ),
        }
      : player.personalidade,
    momentumEffects: effects,
  }
}

export function withMomentumLineup(players, effects) {
  if (!effects) return players
  return (players ?? []).map((p) => applyMomentumToPlayer(p, effects))
}

export function listMomentumEffectRows(effects) {
  return MOMENTUM_EFFECT_KEYS.map((key) => ({
    key,
    mult: effects?.[key] ?? 1,
    pct: Math.round(((effects?.[key] ?? 1) - 1) * 1000) / 10,
  }))
}
