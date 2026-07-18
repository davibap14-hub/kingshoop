import {
  DEFENSE_SCHEME_EFFECTS,
  DEFENSE_SCHEME_LABELS,
} from '../../data/defense/constants.js'

/**
 * Multiplicadores / scores derivados do esquema para a Simulation Engine.
 */
export function buildDefenseEffects(scheme, { coach = null, bias = null, threat = null } = {}) {
  const base = DEFENSE_SCHEME_EFFECTS[scheme] ?? DEFENSE_SCHEME_EFFECTS.individual
  const system = (coach?.defensiveSystem ?? 55) / 50 // ~1.0–1.9
  const pref = (bias?.[scheme] ?? 55) / 55

  const scale = (value, weight = 1) => {
    const centered = (value - 50) / 50
    return 1 + centered * 0.22 * weight * Math.min(1.35, (system + pref) / 2)
  }

  return {
    scheme,
    label: DEFENSE_SCHEME_LABELS[scheme] ?? scheme,
    raw: base,
    /** Multiplicadores (~0.85–1.25) */
    pressureMult: scale(base.pressure, 1.1),
    helpCommitMult: scale(base.helpCommit, 1.2),
    stealMult: scale(base.steal, 1.15),
    contestMult: scale(base.contest, 1.0),
    paintMult: scale(base.paint, 1.05),
    perimeterMult: scale(base.perimeter, 1.05),
    turnoverMult: scale(base.turnoverForce, 1.1),
    threeConcedeMult: scale(base.threeConcede, 0.9),
    fatigueMult: scale(base.fatigueCost, 0.8),
    /** Scores 0–100 para combineScore */
    pressureScore: base.pressure,
    helpScore: base.helpCommit,
    stealScore: base.steal,
    contestScore: base.contest,
    /** Flags */
    commitsHelpEarly: ['help_defense', 'double_team', 'trap', 'hedge'].includes(scheme),
    gamblesSteal: ['trap', 'full_court_press', 'double_team'].includes(scheme),
    protectsPaint: ['drop_coverage', 'zone', 'help_defense'].includes(scheme),
    stretchesFloor: ['switch', 'individual', 'ice'].includes(scheme),
    threat,
  }
}

/** Ajusta contest conforme tipo de arremesso × esquema. */
export function contestModifierForShot(effects, shotType) {
  if (!effects) return 1
  const isThree = shotType === 'three'
  const isPaint =
    shotType === 'layup' || shotType === 'alley_oop' || shotType === 'post'

  if (isThree) {
    return effects.contestMult / Math.max(0.85, effects.threeConcedeMult)
  }
  if (isPaint) {
    return effects.contestMult * effects.paintMult
  }
  return effects.contestMult * ((effects.perimeterMult + effects.paintMult) / 2)
}
