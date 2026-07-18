/**
 * Disparo de histórias procedurais no fim da semana.
 */

import { generateStory, summarizeStoryForUi } from './generate.js'
import { upsertChain } from './memory.js'
import { createChainRecord, createStoryState } from './state.js'

/**
 * Tenta gerar uma história e deixá-la pendente (mesma porta de pendingEvent).
 */
export function triggerStory(state, context = {}, opts = {}) {
  const rng = opts.rng ?? Math.random
  const result = generateStory(state, context, rng)

  if (!result.story) {
    return {
      ok: true,
      triggered: false,
      event: null,
      pendingEvent: null,
      nextState: { ...state, pendingEvent: null },
      mode: result.mode,
    }
  }

  const pendingEvent = summarizeStoryForUi(result.story)
  let story = createStoryState(state.story)

  if (result.mode === 'new') {
    const chain = createChainRecord({
      id: pendingEvent.chainId,
      seedId: pendingEvent.seedId,
      theme: pendingEvent.theme,
      stage: 0,
      maxStages: pendingEvent.maxStages,
      open: true,
      title: pendingEvent.title,
      characters: pendingEvent.characters,
      createdWeek: state.currentWeek,
      createdSeason: state.currentSeason,
      lastWeek: state.currentWeek,
      dueWeek: null,
    })
    story = upsertChain(story, chain)
    story = {
      ...story,
      themeCooldowns: {
        ...story.themeCooldowns,
        [pendingEvent.theme]: state.currentWeek,
      },
      storiesTold: (story.storiesTold ?? 0) + 1,
      updatedAt: Date.now(),
    }
  } else {
    story = {
      ...story,
      storiesTold: (story.storiesTold ?? 0) + 1,
      updatedAt: Date.now(),
    }
  }

  return {
    ok: true,
    triggered: true,
    event: pendingEvent,
    pendingEvent,
    mode: result.mode,
    nextState: {
      ...state,
      story,
      pendingEvent,
    },
  }
}
