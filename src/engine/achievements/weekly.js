/**
 * Pipeline semanal da Achievement Engine.
 */

import { evaluateAchievements } from './evaluate.js'
import {
  updateAchievementCounters,
} from './metrics.js'
import { applyAchievementRewards } from './rewards.js'
import { createAchievementsState } from './state.js'

/**
 * Avalia conquistas após a semana (com careerStats atualizados).
 */
export function processWeeklyAchievements({
  achievements,
  state,
  effects = null,
} = {}) {
  const messages = []
  let nextAchievements = updateAchievementCounters(
    achievements ?? state?.achievements,
    state,
    effects,
  )

  const evaluated = evaluateAchievements(nextAchievements, {
    ...state,
    achievements: nextAchievements,
  }, effects)

  nextAchievements = evaluated.achievements
  const newlyUnlocked = evaluated.newlyUnlocked ?? []

  let nextState = {
    ...state,
    achievements: nextAchievements,
  }

  let rewards = {}
  if (newlyUnlocked.length) {
    const applied = applyAchievementRewards(nextState, newlyUnlocked)
    nextState = {
      ...applied.state,
      achievements: nextAchievements,
    }
    rewards = applied.totalRewards
    messages.push(...applied.messages)
    messages.push(
      `Achievement Engine: ${newlyUnlocked.length} conquista(s) desbloqueada(s).`,
    )
  }

  return {
    achievements: nextAchievements,
    state: nextState,
    messages,
    summary: {
      unlockedCount: nextAchievements.unlockedCount,
      newlyUnlocked: newlyUnlocked.map((d) => ({
        id: d.id,
        name: d.name,
        category: d.category,
        reward: d.reward,
      })),
      rewards,
      lastUnlocked: nextAchievements.lastUnlocked,
    },
  }
}

/**
 * Avalia após resolver história/evento (sem contadores de partida).
 */
export function processAchievementCheck(state) {
  return processWeeklyAchievements({
    achievements: createAchievementsState(state.achievements),
    state,
    effects: null,
  })
}
