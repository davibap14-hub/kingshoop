/**
 * Avaliação de conquistas — progresso + desbloqueio.
 */

import {
  ACHIEVEMENTS,
  ACHIEVEMENT_STATUS,
  ACHIEVEMENTS_BY_ID,
} from '../../data/achievements'
import { createAchievementsState } from './state.js'
import { buildAchievementMetrics } from './metrics.js'

/**
 * Avalia todo o catálogo contra as métricas atuais.
 * Não aplica recompensas — só atualiza progress/unlocked.
 */
export function evaluateAchievements(achievements, state, effects = null) {
  const prev = createAchievementsState(achievements)
  const metrics = buildAchievementMetrics(
    { ...state, achievements: prev },
    effects,
  )

  const progress = { ...prev.progress }
  const unlocked = { ...prev.unlocked }
  const newly = []

  const week = state.currentWeek ?? 1
  const season = state.currentSeason ?? 1
  const now = Date.now()

  for (const def of ACHIEVEMENTS) {
    if (unlocked[def.id]) {
      progress[def.id] = def.target
      continue
    }

    const value = Number(metrics[def.metric] ?? 0)
    const current = Math.min(Math.max(0, value), def.target)
    progress[def.id] = current

    if (current >= def.target) {
      unlocked[def.id] = {
        at: now,
        season,
        week,
        reward: def.reward ?? {},
      }
      newly.push(def)
    }
  }

  // Segunda passagem: conquistas que dependem de achievementsUnlocked
  let unlockedCount = Object.keys(unlocked).length
  for (const def of ACHIEVEMENTS) {
    if (def.metric !== 'achievementsUnlocked') continue
    if (unlocked[def.id]) continue
    progress[def.id] = Math.min(unlockedCount, def.target)
    if (unlockedCount >= def.target) {
      unlocked[def.id] = {
        at: now,
        season,
        week,
        reward: def.reward ?? {},
      }
      newly.push(def)
      unlockedCount += 1
    }
  }

  const lastUnlocked = [
    ...newly.map((d) => ({
      id: d.id,
      name: d.name,
      category: d.category,
      at: now,
    })),
    ...prev.lastUnlocked,
  ].slice(0, 12)

  return {
    achievements: {
      ...prev,
      unlocked,
      progress,
      lastUnlocked,
      unlockedCount: Object.keys(unlocked).length,
      updatedAt: now,
    },
    newlyUnlocked: newly,
    metrics,
  }
}

/**
 * Monta status + progresso de uma conquista para a UI.
 */
export function getAchievementProgress(achievements, achievementId) {
  const def = ACHIEVEMENTS_BY_ID[achievementId]
  if (!def) return null
  const state = createAchievementsState(achievements)
  const unlocked = Boolean(state.unlocked[achievementId])
  const progress = unlocked
    ? def.target
    : Number(state.progress[achievementId] ?? 0)
  const status = unlocked
    ? ACHIEVEMENT_STATUS.unlocked
    : progress > 0
      ? ACHIEVEMENT_STATUS.in_progress
      : ACHIEVEMENT_STATUS.locked

  return {
    ...def,
    status,
    progress,
    target: def.target,
    unlockedAt: state.unlocked[achievementId] ?? null,
    percent:
      def.target > 0
        ? Math.round(Math.min(1, progress / def.target) * 100)
        : unlocked
          ? 100
          : 0,
  }
}
