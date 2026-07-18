import { INJURY_SEVERITY, INJURY_TREATMENTS } from '../../data/injuries'
import { getInjuryAttributeModifiers } from './effects.js'
import { hydrateInjuryEngine } from './state.js'

/**
 * Visão read-only para a Interface.
 */
export function getInjuryView(state = {}) {
  const engine = hydrateInjuryEngine(
    state.injuryEngine,
    state.injury,
  )
  const profile = engine.profile
  const active = engine.active

  const severityMeta = active
    ? INJURY_SEVERITY[active.severity] ?? null
    : null
  const treatmentMeta = active
    ? INJURY_TREATMENTS[active.treatment] ?? null
    : null

  const history = [...(profile.history ?? [])]
    .reverse()
    .slice(0, 8)
    .map((h) => ({
      ...h,
      severityLabel: INJURY_SEVERITY[h.severity]?.label ?? h.severity,
    }))

  const reductions = getInjuryAttributeModifiers(active)
  const reductionList = Object.entries(reductions).map(([path, delta]) => ({
    path,
    label: path.replace(/\./g, ' · '),
    delta,
  }))

  return {
    healthy: !active,
    profile: {
      injuryRisk: profile.injuryRisk,
      condition: profile.condition,
      fatigue: profile.fatigue,
      minutesPerGame: profile.minutesPerGame,
      medicalStaff: profile.medicalStaff,
      historyCount: profile.history?.length ?? 0,
    },
    active: active
      ? {
          id: active.id,
          label: active.label,
          severity: active.severity,
          severityLabel: severityMeta?.label ?? active.severity,
          weeksRemaining: active.weeksRemaining,
          weeksEstimated: active.weeksEstimated,
          relapseChance: active.relapseChance,
          relapsePct: Math.round((active.relapseChance ?? 0) * 100),
          treatment: active.treatment,
          treatmentLabel:
            active.treatmentLabel ?? treatmentMeta?.label ?? '—',
          blocksTraining: active.blocksTraining,
          reductions: reductionList,
          source: active.source,
        }
      : null,
    history,
    recoveryFactors: {
      medicalStaff: profile.medicalStaff,
      condition: profile.condition,
      age: state.player?.idade ?? null,
      restHelps: true,
    },
  }
}
