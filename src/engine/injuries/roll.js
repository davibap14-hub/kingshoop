import {
  INJURY_BY_ID,
  INJURY_CATALOG,
  INJURY_SEVERITY,
  INJURY_TREATMENTS,
  RISK_WEIGHTS,
} from '../../data/injuries'
import { pickWeighted } from '../utils/math'
import { calcSafetyScore } from './risk.js'
import { createInjuryProfile } from './state.js'

function weeksFromRange([min, max], rng) {
  return min + Math.floor(rng() * (max - min + 1))
}

/**
 * Escolhe tipo de lesão por pesos (fadiga / risco / severidade).
 * Não é sorteio uniforme.
 */
export function pickInjuryType(profile, context = {}, rng = Math.random) {
  const p = createInjuryProfile(profile)
  const load = Number(context.activityLoad) || 0

  const entries = INJURY_CATALOG.map((type) => {
    const sev = INJURY_SEVERITY[type.severity] ?? INJURY_SEVERITY.moderate
    let weight = type.weight ?? 1

    // Fadiga alta favorece lesões musculares / graves
    if (p.fatigue >= 70 && type.severity !== 'light') weight *= 1.4
    if (p.fatigue >= 85 && type.severity === 'severe') weight *= 1.5
    if (p.condition < 40 && type.severity === 'severe') weight *= 1.35
    if (p.injuryRisk < 35 && type.severity === 'severe') weight *= 0.45
    if (load >= 26 && type.id === 'fatigue_collapse') weight *= 1.8
    if ((context.historyCount ?? 0) >= 3 && type.severity === 'severe') {
      weight *= 1.25
    }

    weight *= sev.riskWeight
    return { ...type, weight }
  })

  return pickWeighted(entries, 'weight', rng)
}

/**
 * Cria instância completa de lesão a partir do catálogo.
 */
export function createInjuryInstance(type, context = {}, rng = Math.random) {
  const catalog = typeof type === 'string' ? INJURY_BY_ID[type] : type
  if (!catalog) return null

  const sev = INJURY_SEVERITY[catalog.severity] ?? INJURY_SEVERITY.moderate
  const treatmentId = catalog.treatment ?? 'physio'
  const treatment = INJURY_TREATMENTS[treatmentId] ?? INJURY_TREATMENTS.physio
  const weeks = weeksFromRange(catalog.weeks ?? sev.baseWeeks, rng)
  const relapseChance =
    (catalog.relapseChance ?? sev.relapseChance) * (treatment.relapseModifier ?? 1)

  return {
    id: `inj_${catalog.id}_${context.week ?? 0}_${Math.floor(rng() * 1e6)}`,
    typeId: catalog.id,
    label: catalog.label,
    severity: catalog.severity,
    weeksEstimated: weeks,
    weeksRemaining: weeks,
    relapseChance: Math.round(relapseChance * 1000) / 1000,
    attributeReductions: { ...(catalog.attributeReductions ?? {}) },
    treatment: treatment.id,
    treatmentLabel: treatment.label,
    blocksTraining: catalog.blocksTraining !== false,
    occurredOnWeek: context.week ?? null,
    occurredOnSeason: context.seasonNumber ?? null,
    source: context.source ?? 'training',
  }
}

/**
 * Decide se ocorre lesão via pesos (risco vs segurança), não coin-flip cego.
 * @returns {object|null} instância de lesão
 */
export function rollInjuryEvent({
  profile,
  status = {},
  activity = null,
  week = null,
  seasonNumber = null,
  alreadyInjured = false,
  rng = Math.random,
} = {}) {
  if (alreadyInjured) return null
  if (activity && activity.type !== 'train' && activity.type !== 'game') {
    return null
  }

  const p = createInjuryProfile(profile)
  const energy = status.energia ?? 70
  const activityLoad = activity?.energyCost ?? 20

  const riskScore =
    p.injuryRisk * RISK_WEIGHTS.baseRisk +
    p.fatigue * RISK_WEIGHTS.fatigue * 0.5 +
    (100 - (p.condition ?? 50)) * RISK_WEIGHTS.condition * 0.4 +
    activityLoad * RISK_WEIGHTS.activityLoad * 2

  const safetyScore = calcSafetyScore(p, { energy }) * 1.15

  // weightedSelect discreto entre "injure" e "safe"
  const total = Math.max(0.001, riskScore + safetyScore)
  const injureWeight = riskScore / total
  // Exige peso de risco significativo — evita lesões em perfil saudável
  if (injureWeight < 0.28) return null
  if (rng() > injureWeight * 0.55) return null

  const type = pickInjuryType(
    p,
    {
      activityLoad,
      historyCount: p.history?.length ?? 0,
    },
    rng,
  )

  return createInjuryInstance(
    type,
    { week, seasonNumber, source: activity?.type === 'game' ? 'game' : 'training' },
    rng,
  )
}
