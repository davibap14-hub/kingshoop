/**
 * Aplica recompensas de conquistas desbloqueadas.
 */

import {
  applyStatusDeltas,
  syncLegacyCareerVariables,
} from '../career/state'
import { applyXpGain } from '../progression/xp'
import {
  applyEventToRelationships,
  calculateRelationshipEffects,
  syncStatusFromRelationships,
} from '../relationships'

/**
 * @param {object} state
 * @param {object[]} unlockedDefs — defs do catálogo
 */
export function applyAchievementRewards(state, unlockedDefs = []) {
  if (!unlockedDefs.length) {
    return { state, messages: [], totalRewards: {} }
  }

  let status = { ...state.status }
  let progression = state.progression
  let relationships = state.relationships
  const messages = []
  const totalRewards = {}

  for (const def of unlockedDefs) {
    const reward = { ...(def.reward ?? {}) }
    const xp = reward.xp ?? 0
    delete reward.xp

    if (Object.keys(reward).length) {
      status = applyStatusDeltas(status, reward)
      const relResult = applyEventToRelationships(relationships, reward, {
        reason: `achievement:${def.id}`,
      })
      relationships = relResult.relationships
      status = syncStatusFromRelationships(status, relationships)

      for (const [k, v] of Object.entries(reward)) {
        if (!v) continue
        totalRewards[k] = (totalRewards[k] ?? 0) + v
      }
    }

    if (xp > 0) {
      const xpResult = applyXpGain(progression, xp)
      progression = xpResult.progression
      totalRewards.xp = (totalRewards.xp ?? 0) + xp
      messages.push(...(xpResult.messages ?? []))
    }

    messages.push(`Conquista: ${def.name}`)
  }

  const relationshipEffects = calculateRelationshipEffects(relationships)
  const careerVariables = syncLegacyCareerVariables(status)

  return {
    state: {
      ...state,
      status,
      careerVariables,
      progression,
      relationships,
      relationshipEffects,
      playingTimeShare: relationshipEffects.playingTimeShare,
    },
    messages,
    totalRewards,
  }
}
