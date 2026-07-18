import {
  DEFAULT_CONDITION,
  DEFAULT_FATIGUE,
  DEFAULT_MEDICAL_STAFF,
  FATIGUE_MAX,
  FATIGUE_MIN,
  CONDITION_MAX,
  CONDITION_MIN,
  MAX_INJURY_HISTORY,
  RISK_MAX,
  RISK_MIN,
} from '../../data/injuries'
import { clamp } from '../utils/math'

export function clampCondition(value) {
  return clamp(Math.round(Number(value) || 0), CONDITION_MIN, CONDITION_MAX)
}

export function clampFatigue(value) {
  return clamp(Math.round(Number(value) || 0), FATIGUE_MIN, FATIGUE_MAX)
}

export function clampRisk(value) {
  return clamp(Math.round(Number(value) || 0), RISK_MIN, RISK_MAX)
}

/**
 * Perfil físico / risco do jogador de carreira.
 */
export function createInjuryProfile(overrides = {}) {
  return {
    injuryRisk: clampRisk(overrides.injuryRisk ?? 28),
    condition: clampCondition(overrides.condition ?? DEFAULT_CONDITION),
    minutesPerGame: clamp(
      Math.round(Number(overrides.minutesPerGame) || 24),
      0,
      48,
    ),
    fatigue: clampFatigue(overrides.fatigue ?? DEFAULT_FATIGUE),
    medicalStaff: clamp(
      Math.round(Number(overrides.medicalStaff) || DEFAULT_MEDICAL_STAFF),
      20,
      95,
    ),
    history: Array.isArray(overrides.history)
      ? overrides.history.slice(-MAX_INJURY_HISTORY)
      : [],
  }
}

/**
 * Estado da Injury Engine.
 * `active` espelha a lesão atual; `profile` guarda risco/condição/fadiga/histórico.
 */
export function createInjuryEngineState(overrides = {}) {
  return {
    profile: createInjuryProfile(overrides.profile ?? overrides),
    active: overrides.active ?? null,
    lastUpdate: overrides.lastUpdate ?? null,
  }
}

/**
 * Migra `state.injury` legado → Injury Engine.
 */
export function hydrateInjuryEngine(injuryEngine, legacyInjury = null) {
  const base = createInjuryEngineState(injuryEngine ?? {})
  if (base.active) return base
  if (!legacyInjury) return base

  return {
    ...base,
    active: normalizeLegacyInjury(legacyInjury),
  }
}

export function normalizeLegacyInjury(injury) {
  if (!injury) return null
  const severity =
    injury.severity === 'mild'
      ? 'light'
      : injury.severity === 'light' ||
          injury.severity === 'moderate' ||
          injury.severity === 'severe'
        ? injury.severity
        : 'moderate'

  return {
    id: injury.id ?? `legacy_${injury.label ?? 'injury'}`,
    typeId: injury.typeId ?? injury.id ?? 'unknown',
    label: injury.label ?? 'Lesão',
    severity,
    weeksEstimated: injury.weeksEstimated ?? injury.weeksRemaining ?? 1,
    weeksRemaining: injury.weeksRemaining ?? 1,
    relapseChance: injury.relapseChance ?? 0.12,
    attributeReductions: injury.attributeReductions ?? {},
    treatment: injury.treatment ?? 'physio',
    treatmentLabel: injury.treatmentLabel ?? 'Fisioterapia',
    blocksTraining: injury.blocksTraining !== false,
    occurredOnWeek: injury.occurredOnWeek ?? null,
    occurredOnSeason: injury.occurredOnSeason ?? null,
    source: injury.source ?? 'legacy',
  }
}

/** Snapshot compatível com UI/gates antigos (`state.injury`). */
export function toLegacyInjury(active) {
  if (!active) return null
  return {
    id: active.typeId ?? active.id,
    typeId: active.typeId,
    label: active.label,
    severity: active.severity === 'light' ? 'mild' : active.severity,
    weeksRemaining: active.weeksRemaining,
    weeksEstimated: active.weeksEstimated,
    blocksTraining: active.blocksTraining,
    occurredOnWeek: active.occurredOnWeek,
    relapseChance: active.relapseChance,
    attributeReductions: active.attributeReductions,
    treatment: active.treatment,
    treatmentLabel: active.treatmentLabel,
  }
}

export function appendInjuryHistory(profile, entry) {
  const history = [...(profile.history ?? []), entry].slice(-MAX_INJURY_HISTORY)
  return { ...profile, history }
}
