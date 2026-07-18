/**
 * Visão read-only da Story Engine.
 */

import { STORY_THEMES } from '../../data/story'
import { createStoryState } from './state.js'
import { listOpenChains } from './memory.js'

export function getStoryView(state = {}) {
  const story = createStoryState(state.story)
  const open = listOpenChains(story)
  const recent = (story.history ?? []).slice(0, 8)

  return {
    openChains: open.map((c) => ({
      id: c.id,
      title: c.title,
      theme: c.theme,
      themeLabel: STORY_THEMES[c.theme]?.label ?? c.theme,
      stage: c.stage,
      maxStages: c.maxStages,
      dueWeek: c.dueWeek,
      lastChoiceId: c.lastChoiceId,
    })),
    flags: story.flags,
    recent,
    counts: {
      open: open.length,
      told: story.storiesTold ?? 0,
      resolved: story.storiesResolved ?? 0,
      flags: Object.keys(story.flags ?? {}).length,
    },
    tip: 'Histórias procedurais em cadeias — decisões passadas alteram o futuro.',
    pending: state.pendingEvent
      ? {
          id: state.pendingEvent.id,
          title: state.pendingEvent.title ?? state.pendingEvent.texto,
          theme: state.pendingEvent.categoriaLabel,
          isContinuation: Boolean(state.pendingEvent.isContinuation),
        }
      : null,
  }
}
