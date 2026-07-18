import { calculateRelationshipEffects } from './effects.js'
import { getRelationshipStatus } from './core.js'
import { createRelationshipsState } from './state.js'

/**
 * Visão read-only para a Interface.
 */
export function getRelationshipView(state = {}) {
  const relationships = createRelationshipsState(state.relationships)
  const status = getRelationshipStatus(relationships)
  const effects = calculateRelationshipEffects(relationships, {
    week: state.currentWeek,
    seasonNumber: state.currentSeason,
  })

  return {
    relationships,
    entries: Object.values(status.entries),
    average: status.average,
    effects: {
      playingTimeShare: effects.playingTimeShare,
      minutesModifier: effects.minutesModifier,
      chemistryBonus: effects.chemistryBonus,
      xpMultiplier: effects.xpMultiplier,
      trainingMultiplier: effects.trainingMultiplier,
      sponsorshipChanceBonus: effects.sponsorshipChanceBonus,
      renewWillingnessBonus: effects.renewWillingnessBonus,
      flags: effects.flags,
    },
  }
}
