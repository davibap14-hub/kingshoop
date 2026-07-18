import { PRACTICE_FOCI } from '../../data/coaches'
import { clamp } from '../utils/math'
import { normalizeCoach } from './state.js'

/**
 * Efeitos do coach sobre minutos, treinos, XP, motivação e jogadas.
 */
export function buildCoachEffects(coach, decision = null) {
  const c = normalizeCoach(coach ?? {})
  const focusId = decision?.practiceFocus?.focusId ?? null
  const minutes =
    decision?.playingTime?.minutes ??
    Math.round(22 + (c.rotation - 50) * 0.12 + (c.youthTrust - 50) * 0.08)

  const trainingMultiplier = clamp(
    1 +
      (c.development - 50) * 0.0035 +
      (c.motivation - 50) * 0.0015 +
      (focusId === 'development' ? 0.06 : 0) +
      (focusId === 'conditioning' ? 0.03 : 0),
    0.8,
    1.28,
  )

  const xpMultiplier = clamp(
    1 +
      (c.development - 50) * 0.003 +
      (c.youthTrust - 50) * 0.0015 +
      (focusId === 'development' ? 0.05 : 0),
    0.82,
    1.25,
  )

  const motivationAura = Math.round(
    (c.motivation - 50) * 0.12 + (focusId === 'morale' ? 2 : 0),
  )

  // Multiplicador de rigor em treinos (mais ganho, mais custo de energia)
  const rigorTrainingBonus = clamp((c.rigor - 50) * 0.002, -0.08, 0.1)

  return {
    coachId: c.id,
    coachName: c.name,
    preferredStyleId: c.preferredStyleId,
    styleId: decision?.style?.styleId ?? c.preferredStyleId,
    setBias: decision?.setBias ?? c.setBias ?? {},
    playingTimeShare: clamp(minutes, 12, 38),
    minutesModifier: clamp(minutes / 28, 0.55, 1.35),
    trainingMultiplier,
    xpMultiplier,
    motivationAura,
    rigorTrainingBonus,
    practiceFocus: focusId
      ? PRACTICE_FOCI[focusId] ?? { id: focusId, label: focusId }
      : null,
    relationDelta: decision?.relationDelta ?? 0,
    offensiveSystem: c.offensiveSystem,
    defensiveSystem: c.defensiveSystem,
    rotation: c.rotation,
    youthTrust: c.youthTrust,
    rigor: c.rigor,
    motivation: c.motivation,
    development: c.development,
  }
}

/**
 * Combina efeitos de relacionamento + coach para minutos/treino/XP.
 */
export function mergeCoachIntoRelationshipEffects(relEffects, coachEffects) {
  if (!coachEffects) return relEffects
  const base = relEffects ?? {}

  const minutesModifier = clamp(
    ((base.minutesModifier ?? 1) + (coachEffects.minutesModifier ?? 1)) / 2,
    0.55,
    1.35,
  )

  return {
    ...base,
    minutesModifier,
    playingTimeShare: clamp(
      Math.round(
        ((base.playingTimeShare ?? 28) + (coachEffects.playingTimeShare ?? 28)) /
          2,
      ),
      12,
      38,
    ),
    trainingMultiplier: clamp(
      (base.trainingMultiplier ?? 1) *
        (0.55 + (coachEffects.trainingMultiplier ?? 1) * 0.45),
      0.7,
      1.35,
    ),
    xpMultiplier: clamp(
      (base.xpMultiplier ?? 1) *
        (0.55 + (coachEffects.xpMultiplier ?? 1) * 0.45),
      0.75,
      1.3,
    ),
    motivationAura:
      (base.motivationAura ?? 0) + (coachEffects.motivationAura ?? 0),
    coachEffects,
  }
}
