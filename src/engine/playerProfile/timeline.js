/**
 * Timeline da carreira — Save history · Story · Achievements.
 */

import { PLAYER_PROFILE_LIMITS } from '../../data/playerProfile'

export function buildCareerTimeline({
  history = [],
  storyView = null,
  achievementsView = null,
  injuryView = null,
} = {}) {
  const items = []

  for (const entry of [...history].reverse().slice(0, 40)) {
    items.push({
      id: `week-${entry.at ?? ''}-${entry.week}-${entry.season}`,
      at: entry.at ?? null,
      kind: 'week',
      season: entry.season,
      week: entry.week,
      title: entry.activityLabel
        ? `${entry.activityLabel}`
        : `Semana ${entry.week}`,
      detail: (entry.messages ?? []).slice(0, 2).join(' · ') || null,
      meta: {
        xpGain: entry.progression?.xpGain ?? null,
        leveledUp: entry.progression?.leveledUp ?? false,
      },
    })
  }

  for (const u of achievementsView?.recent ?? []) {
    items.push({
      id: `ach-${u.id}-${u.unlockedAt}`,
      at: u.unlockedAt ?? null,
      kind: 'achievement',
      season: null,
      week: null,
      title: u.name ?? u.id,
      detail: u.description ?? 'Conquista desbloqueada',
      meta: { category: u.category },
    })
  }

  for (const chain of storyView?.recent ?? []) {
    items.push({
      id: `story-${chain.id}-${chain.updatedAt ?? chain.stage}`,
      at: chain.updatedAt ?? null,
      kind: 'story',
      season: null,
      week: null,
      title: chain.title ?? chain.id,
      detail: chain.themeLabel
        ? `${chain.themeLabel} · cap. ${(chain.stage ?? 0) + 1}`
        : null,
      meta: {},
    })
  }

  if (injuryView?.active) {
    items.unshift({
      id: `inj-active-${injuryView.active.id}`,
      at: Date.now(),
      kind: 'injury',
      season: null,
      week: null,
      title: injuryView.active.label,
      detail: `${injuryView.active.severityLabel} · ${injuryView.active.weeksRemaining} sem. restantes`,
      meta: {},
    })
  }

  items.sort((a, b) => (b.at ?? 0) - (a.at ?? 0))
  return items.slice(0, PLAYER_PROFILE_LIMITS.timeline)
}
