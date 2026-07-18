import { RISK_WEIGHTS } from '../../data/injuries'
import { clamp } from '../utils/math'
import { clampFatigue, clampRisk, createInjuryProfile } from './state.js'

/**
 * Recalcula risco / fadiga / condição a partir do contexto semanal.
 * Tudo por pesos — sem RNG.
 */
export function recalcInjuryProfile(profile, context = {}) {
  const base = createInjuryProfile(profile)
  const age = Number(context.age) || 22
  const energy = Number(context.energy) ?? 70
  const minutes = Number(context.minutesPerGame) || base.minutesPerGame
  const resistencia = Number(context.resistencia) || 60
  const activityType = context.activityType ?? null
  const injured = Boolean(context.injured)

  let fatigue =
    context.fatigueOverride != null
      ? Number(context.fatigueOverride)
      : base.fatigue
  let condition = base.condition

  // Minutos altos elevam fadiga; resistência mitiga
  // (se Fatigue Engine já mandou override, só aplica micro-ajuste)
  if (context.fatigueOverride == null) {
    fatigue += Math.round((minutes - 24) * 0.45)
    fatigue -= Math.round((resistencia - 50) * 0.12)
  } else {
    fatigue += Math.round((minutes - 28) * 0.12)
  }

  if (activityType === 'train') {
    fatigue += 10
    condition -= 3
  } else if (activityType === 'rest' || activityType === 'recovery') {
    fatigue -= activityType === 'recovery' ? 16 : 12
    condition += activityType === 'recovery' ? 8 : 5
  } else if (activityType === 'media' || activityType === 'sponsor') {
    fatigue += 2
  } else if (activityType === 'bonding' || activityType === 'coach') {
    fatigue += 3
  }

  if (injured) {
    fatigue += 4
    condition -= 2
  }

  // Energia baixa = condição sofre
  if (energy < 30) condition -= 6
  else if (energy > 75) condition += 2

  // Idade reduz recuperação natural da condição
  if (age >= 32) condition -= 3
  else if (age <= 21) condition += 2

  fatigue = clampFatigue(fatigue)
  condition = clamp(Math.round(condition), 0, 100)

  const historyCount = (base.history ?? []).length
  const recentSevere = (base.history ?? []).filter(
    (h) => h.severity === 'severe',
  ).length

  const riskScore =
    RISK_WEIGHTS.baseRisk * 30 +
    RISK_WEIGHTS.fatigue * fatigue +
    RISK_WEIGHTS.condition * (100 - condition) +
    RISK_WEIGHTS.minutes * clamp((minutes / 40) * 100, 0, 100) +
    RISK_WEIGHTS.age * clamp((age - 22) * 6, 0, 100) +
    RISK_WEIGHTS.energy * (100 - energy) +
    RISK_WEIGHTS.history * clamp(historyCount * 4 + recentSevere * 10, 0, 100) +
    Number(context.fatigueInjuryBonus ?? 0) * 0.85

  const injuryRisk = clampRisk(
    riskScore /
      (RISK_WEIGHTS.baseRisk +
        RISK_WEIGHTS.fatigue +
        RISK_WEIGHTS.condition +
        RISK_WEIGHTS.minutes +
        RISK_WEIGHTS.age +
        RISK_WEIGHTS.energy +
        RISK_WEIGHTS.history) +
      Number(context.fatigueInjuryBonus ?? 0) * 0.15,
  )

  return {
    ...base,
    minutesPerGame: minutes,
    fatigue,
    condition,
    injuryRisk,
  }
}

/**
 * Score 0–100 de “segurança” vs risco (para weightedSelect).
 */
export function calcSafetyScore(profile, context = {}) {
  const p = createInjuryProfile(profile)
  const energy = Number(context.energy) ?? 70
  const medical = p.medicalStaff
  return clamp(
    Math.round(
      (100 - p.injuryRisk) * 0.55 +
        p.condition * 0.25 +
        energy * 0.1 +
        medical * 0.1,
    ),
    5,
    95,
  )
}
