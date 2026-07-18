import { RELATIONSHIP_NEUTRAL } from '../../data/relationships'
import { applyActivityToRelationships } from './activity.js'
import { calculateRelationshipEffects } from './effects.js'
import { getRelationshipStatus } from './core.js'
import {
  createRelationshipsState,
  syncStatusFromRelationships,
} from './state.js'

/**
 * Pipeline semanal da Relationship Engine.
 */
export function processWeeklyRelationships({
  relationships,
  status,
  activity,
  chemDelta = 0,
  popularityGain = 0,
  trainingSuccess = false,
  injured = false,
  week = null,
  seasonNumber = null,
} = {}) {
  const messages = []
  let next = createRelationshipsState(relationships)

  const activityResult = applyActivityToRelationships(next, activity, {
    chemDelta,
    popularityGain,
    trainingSuccess,
    injured,
  })
  next = activityResult.relationships

  for (const entry of activityResult.log) {
    const sign = entry.delta > 0 ? '+' : ''
    messages.push(
      `Relação ${entry.key}: ${sign}${entry.delta} → ${entry.value}.`,
    )
  }

  // Decay leve em direção ao neutro (anti-inflação)
  next = applyWeeklyDecay(next)

  const effects = calculateRelationshipEffects(next, { week, seasonNumber })
  const syncedStatus = syncStatusFromRelationships(status ?? {}, next)
  const overview = getRelationshipStatus(next)

  if (effects.motivationAura) {
    messages.push(
      effects.motivationAura > 0
        ? `Relacionamentos: aura de motivação +${effects.motivationAura}.`
        : `Relacionamentos: tensão mental ${effects.motivationAura}.`,
    )
  }

  return {
    relationships: next,
    status: syncedStatus,
    effects,
    overview,
    applied: activityResult.applied,
    messages,
    summary: {
      average: overview.average,
      playingTimeShare: effects.playingTimeShare,
      minutesModifier: effects.minutesModifier,
      chemistryBonus: effects.chemistryBonus,
      xpMultiplier: effects.xpMultiplier,
      trainingMultiplier: effects.trainingMultiplier,
      flags: effects.flags,
      applied: activityResult.applied,
    },
  }
}

function applyWeeklyDecay(relationships) {
  const next = { ...relationships }
  for (const [key, value] of Object.entries(next)) {
    // Puxa 1 ponto em direção ao neutro quando muito afastado (anti-inflação)
    if (Math.abs(value - RELATIONSHIP_NEUTRAL) < 10) continue
    next[key] = value + (value > RELATIONSHIP_NEUTRAL ? -1 : 1)
  }
  return next
}
