import {
  AGE_RECOVERY_MULT,
  MEDICAL_RECOVERY_FACTOR,
  RECOVERY_BASE,
} from '../../data/fatigue/constants.js'
import { clampFatigueValue } from './state.js'

function ageRecoveryMult(age) {
  const a = Number(age) || 22
  for (const row of AGE_RECOVERY_MULT) {
    if (a <= row.maxAge) return row.mult
  }
  return 0.55
}

/**
 * Recuperação semanal: descanso × staff médico × idade.
 * Retorna deltas negativos (reduzem fadiga) ou positivos (aumentam carga).
 */
export function calcWeeklyRecovery({
  activityType = 'rest',
  age = 22,
  medicalStaff = 55,
  energy = 70,
  effects = null,
} = {}) {
  const base = RECOVERY_BASE[activityType] ?? RECOVERY_BASE.default
  const ageMult = ageRecoveryMult(age)
  const medicalMult = 0.85 + (Number(medicalStaff) || 55) * MEDICAL_RECOVERY_FACTOR
  const energyMult = energy >= 75 ? 1.1 : energy < 35 ? 0.75 : 1
  // Jogador já fatigado recupera pior (exceto rest/recovery focados)
  const fatigueRecoveryMult =
    activityType === 'rest' || activityType === 'recovery'
      ? 1
      : effects?.recovery ?? 1

  let delta = base * ageMult * medicalMult * energyMult
  if (base < 0) {
    // carga: fadiga piora a recuperação do esforço
    delta *= 2 - Math.min(1.15, fatigueRecoveryMult)
  } else {
    delta *= fatigueRecoveryMult
  }

  return {
    weeklyDelta: Math.round(delta * 10) / 10,
    ageMult,
    medicalMult,
    energyMult,
  }
}

/** Aplica recuperação a um componente (reduz se delta>0 de rest). */
export function applyRecoveryToComponents(state, recovery) {
  const weeklyDelta = recovery.weeklyDelta
  // Rest reduz weekly/travel/b2b/overload; season cai lento
  if (weeklyDelta > 0) {
    return {
      ...state,
      weekly: clampFatigueValue(state.weekly - weeklyDelta),
      travel: clampFatigueValue(state.travel - weeklyDelta * 0.55),
      backToBack: clampFatigueValue(state.backToBack - weeklyDelta * 0.45),
      overload: clampFatigueValue(state.overload - weeklyDelta * 0.35),
      game: clampFatigueValue(state.game - weeklyDelta * 0.8),
      season: clampFatigueValue(state.season - weeklyDelta * 0.12),
      consecutiveMinutes: clampFatigueValue(
        state.consecutiveMinutes - weeklyDelta * 0.25,
      ),
    }
  }

  // Carga: weekly sobe; season acumula um pouco
  const load = Math.abs(weeklyDelta)
  return {
    ...state,
    weekly: clampFatigueValue(state.weekly + load),
    season: clampFatigueValue(state.season + load * 0.35),
    game: clampFatigueValue(state.game * 0.35), // reseta parcialmente entre jogos
  }
}
