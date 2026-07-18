/**
 * Visão read-only da Achievement Engine.
 */

import {
  ACHIEVEMENTS,
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_CATEGORY_IDS,
  ACHIEVEMENT_COUNT,
  ACHIEVEMENT_STATUS_LABEL,
} from '../../data/achievements'
import { getAchievementProgress } from './evaluate.js'
import { createAchievementsState } from './state.js'

export function getAchievementsView(state = {}) {
  const ach = createAchievementsState(state.achievements)
  const items = ACHIEVEMENTS.map((def) =>
    getAchievementProgress(ach, def.id),
  )

  const byCategory = {}
  for (const id of ACHIEVEMENT_CATEGORY_IDS) {
    const list = items.filter((a) => a.category === id)
    byCategory[id] = {
      id,
      label: ACHIEVEMENT_CATEGORIES[id].label,
      total: list.length,
      unlocked: list.filter((a) => a.status === 'unlocked').length,
      items: list,
    }
  }

  const unlocked = items.filter((a) => a.status === 'unlocked')
  const inProgress = items
    .filter((a) => a.status === 'in_progress')
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 12)

  return {
    total: ACHIEVEMENT_COUNT,
    unlockedCount: unlocked.length,
    percent: Math.round((unlocked.length / ACHIEVEMENT_COUNT) * 100),
    byCategory,
    categories: ACHIEVEMENT_CATEGORY_IDS.map((id) => ({
      id,
      label: ACHIEVEMENT_CATEGORIES[id].label,
      total: byCategory[id].total,
      unlocked: byCategory[id].unlocked,
    })),
    recent: ach.lastUnlocked ?? [],
    inProgress,
    statusLabels: ACHIEVEMENT_STATUS_LABEL,
    tip: '200+ conquistas · progresso persistido no Save Engine.',
  }
}
