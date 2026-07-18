import {
  FATIGUE_COMPOSITE_WEIGHTS,
  FATIGUE_COMPONENT_KEYS,
  PERFORMANCE_CURVE,
  PERFORMANCE_FLOOR,
} from '../../data/fatigue/constants.js'
import { clampFatigueValue, createFatigueState } from './state.js'

function penaltyFactor(composite) {
  const { start, full } = PERFORMANCE_CURVE
  if (composite <= start) return 0
  if (composite >= full) return 1
  return (composite - start) / (full - start)
}

/**
 * Score composto 0–100 a partir dos componentes.
 */
export function calcCompositeFatigue(state) {
  const s = createFatigueState(state)
  let total = 0
  let weightSum = 0
  for (const key of FATIGUE_COMPONENT_KEYS) {
    const w = FATIGUE_COMPOSITE_WEIGHTS[key] ?? 0
    total += clampFatigueValue(s[key]) * w
    weightSum += w
  }
  return clampFatigueValue(total / Math.max(0.01, weightSum))
}

/**
 * Efeitos da fadiga em performance / risco / treino / recuperação.
 */
export function buildFatigueEffects(state) {
  const s = createFatigueState(state)
  const composite = calcCompositeFatigue(s)
  const p = penaltyFactor(composite)

  const lerp = (floor) => 1 - p * (1 - floor)

  const effects = {
    composite,
    speed: lerp(PERFORMANCE_FLOOR.speed),
    accuracy: lerp(PERFORMANCE_FLOOR.accuracy),
    defense: lerp(PERFORMANCE_FLOOR.defense),
    decision: lerp(PERFORMANCE_FLOOR.decision),
    training: lerp(PERFORMANCE_FLOOR.training),
    recovery: lerp(PERFORMANCE_FLOOR.recovery),
    /** Aditivo 0–35 no risco de lesão */
    injuryChanceBonus: Math.round(p * 35),
    /** Score de sim (side.fatigue) */
    simFatigue: clampFatigueValue(
      composite * 0.55 + s.game * 0.25 + s.travel * 0.1 + s.backToBack * 0.1,
    ),
    highFatigue: composite >= 62,
    overloaded: s.overload >= 55 || composite >= 78,
  }

  return {
    ...s,
    composite,
    effects,
  }
}

/**
 * Aplica multiplicadores de fadiga aos atributos efetivos do jogador (sim).
 * Não muta o registro persistido — só o perfil de posse.
 */
export function applyFatigueToPlayer(player, effects) {
  if (!player || !effects) return player
  const speed = effects.speed ?? 1
  const accuracy = effects.accuracy ?? 1
  const defense = effects.defense ?? 1
  const decision = effects.decision ?? 1

  const scaleGroup = (group, map) => {
    if (!player[group]) return player[group]
    const next = { ...player[group] }
    for (const [key, mult] of Object.entries(map)) {
      if (next[key] != null) {
        next[key] = Math.max(
          1,
          Math.round(Number(next[key]) * mult),
        )
      }
    }
    return next
  }

  return {
    ...player,
    fisico: scaleGroup('fisico', {
      velocidade: speed,
      resistencia: Math.min(1, speed + 0.08),
      impulsao: (speed + accuracy) / 2,
    }),
    arremesso: scaleGroup('arremesso', {
      bandeja: accuracy,
      midRange: accuracy,
      tresPontos: accuracy,
      lanceLivre: Math.min(1, accuracy + 0.05),
    }),
    defesa: scaleGroup('defesa', {
      perimetro: defense,
      garrafao: defense,
      roubo: defense,
      toco: defense,
    }),
    qi: scaleGroup('qi', {
      passe: decision,
      visao: decision,
      tomadaDecisao: decision,
    }),
    fatigueEffects: effects,
  }
}
