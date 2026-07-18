import {
  INJURY_SEVERITY,
  INJURY_TREATMENTS,
  RECOVERY_WEIGHTS,
} from '../../data/injuries'
import { clamp } from '../utils/math'
import { createInjuryInstance } from './roll.js'
import {
  appendInjuryHistory,
  clampCondition,
  clampFatigue,
  createInjuryProfile,
  createInjuryEngineState,
} from './state.js'

/**
 * Calcula progresso de recuperação (semanas a subtrair) por pesos.
 * Equipe médica · Descanso · Idade · Condição física · Tratamento.
 */
export function calcRecoveryWeeks(active, profile, context = {}) {
  if (!active) return 0

  const p = createInjuryProfile(profile)
  const age = Number(context.age) || 22
  const rested = Boolean(context.rested)
  const accelerated = Boolean(context.accelerated)
  const treatment =
    INJURY_TREATMENTS[active.treatment] ?? INJURY_TREATMENTS.physio
  const sev = INJURY_SEVERITY[active.severity] ?? INJURY_SEVERITY.moderate

  const medicalScore = p.medicalStaff
  const restScore = rested ? 85 : accelerated ? 70 : 40
  const ageScore = clamp(100 - Math.max(0, age - 24) * 4, 20, 100)
  const conditionScore = p.condition
  const treatmentScore = 50 + (treatment.recoveryBonus ?? 0)
  const severityScore =
    active.severity === 'light' ? 80 : active.severity === 'severe' ? 35 : 55

  const w = RECOVERY_WEIGHTS
  const combined =
    (medicalScore * w.medicalStaff +
      restScore * w.rest +
      ageScore * w.age +
      conditionScore * w.condition +
      treatmentScore * w.treatment +
      severityScore * w.severity) /
    (w.medicalStaff + w.rest + w.age + w.condition + w.treatment + w.severity)

  // Mapeia score → semanas de progresso
  let weeks = 1
  if (combined >= 72) weeks = 2
  else if (combined >= 48) weeks = 1
  else if (combined >= 32) weeks = 1
  else weeks = 0 // estagnação (equipe fraca / idade / grave)

  if (accelerated && weeks < 2 && combined >= 55) weeks = 2
  if (sev.id === 'severe' && weeks > 1 && combined < 65) weeks = 1

  return {
    weeks,
    recoveryScore: Math.round(combined),
    factors: {
      medicalStaff: medicalScore,
      rest: restScore,
      age: ageScore,
      condition: conditionScore,
      treatment: treatmentScore,
      severity: severityScore,
    },
  }
}

/**
 * Aplica um tick de recuperação. Pode curar ou provocar recaída.
 */
export function tickInjuryRecovery({
  injuryEngine,
  age = 22,
  rested = false,
  accelerated = false,
  week = null,
  seasonNumber = null,
  rng = Math.random,
} = {}) {
  const state = createInjuryEngineState(injuryEngine)
  const active = state.active
  const messages = []

  if (!active) {
    return {
      injuryEngine: state,
      healed: false,
      relapsed: false,
      messages,
      recovery: null,
    }
  }

  const recovery = calcRecoveryWeeks(active, state.profile, {
    age,
    rested,
    accelerated,
  })

  const weeksRemaining = active.weeksRemaining - recovery.weeks

  if (weeksRemaining > 0) {
    const nextActive = { ...active, weeksRemaining }
    messages.push(
      `Lesão (${INJURY_SEVERITY[active.severity]?.label ?? active.severity}): ${active.label} — ${weeksRemaining} sem. · tratamento: ${active.treatmentLabel} (score ${recovery.recoveryScore}).`,
    )
    return {
      injuryEngine: {
        ...state,
        active: nextActive,
        lastUpdate: Date.now(),
      },
      healed: false,
      relapsed: false,
      messages,
      recovery,
    }
  }

  // Cura — checa recaída por pesos (chance × fraqueza da recuperação)
  const relapseWeight = (active.relapseChance ?? 0.1) * 100
  const holdWeight = recovery.recoveryScore * 0.9 + state.profile.medicalStaff * 0.25
  const total = relapseWeight + holdWeight
  const relapseRoll = rng() * total
  const relapsed = relapseRoll < relapseWeight * 0.65 && relapseWeight >= 8

  const historyEntry = {
    id: active.id,
    typeId: active.typeId,
    label: active.label,
    severity: active.severity,
    weeksOut: active.weeksEstimated,
    occurredWeek: active.occurredOnWeek,
    occurredSeason: active.occurredOnSeason,
    treatment: active.treatment,
    relapsed,
  }

  let profile = appendInjuryHistory(state.profile, historyEntry)
  profile = {
    ...profile,
    condition: clampCondition(profile.condition + (relapsed ? -4 : 6)),
    fatigue: clampFatigue(profile.fatigue - (relapsed ? 0 : 8)),
  }

  if (relapsed) {
    const lightType =
      active.severity === 'severe'
        ? active.typeId
        : active.typeId
    const relapseInjury = createInjuryInstance(
      lightType,
      {
        week,
        seasonNumber,
        source: 'relapse',
      },
      rng,
    )
    // Recaída: metade do tempo, mesma redução
    if (relapseInjury) {
      relapseInjury.weeksEstimated = Math.max(
        1,
        Math.ceil((active.weeksEstimated ?? 2) / 2),
      )
      relapseInjury.weeksRemaining = relapseInjury.weeksEstimated
      relapseInjury.label = `${active.label} (recaída)`
      relapseInjury.relapseChance = Math.min(
        0.4,
        (active.relapseChance ?? 0.1) * 1.2,
      )
    }
    messages.push(
      `Recaída: ${active.label} — retorno parcial cancelado (${relapseInjury?.weeksRemaining ?? 1} sem.).`,
    )
    return {
      injuryEngine: {
        ...state,
        profile,
        active: relapseInjury,
        lastUpdate: Date.now(),
      },
      healed: false,
      relapsed: true,
      messages,
      recovery,
    }
  }

  messages.push(
    `Recuperado: ${active.label} (${active.treatmentLabel}). Condição física melhorou.`,
  )

  return {
    injuryEngine: {
      ...state,
      profile,
      active: null,
      lastUpdate: Date.now(),
    },
    healed: true,
    relapsed: false,
    messages,
    recovery,
  }
}
