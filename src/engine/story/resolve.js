/**
 * Resolução de escolhas da Story Engine — atualiza memória e consequências.
 */

import {
  applyStatusDeltas,
  syncLegacyCareerVariables,
} from '../career/state'
import { applyPersonalityToChoiceEffects } from '../personality/events'
import {
  applyEventToRelationships,
  calculateRelationshipEffects,
  syncStatusFromRelationships,
} from '../relationships'
import { processAchievementCheck } from '../achievements/weekly.js'
import {
  appendHistory,
  buildEventHistoryEntry,
  updateCareerStatsAfterEvent,
} from '../save'
import { STORY_SEEDS_BY_ID } from '../../data/story'
import { summarizeStoryForUi } from './generate.js'
import {
  appendStoryHistory,
  applyFlagDeltas,
  upsertChain,
} from './memory.js'
import { createChainRecord, createStoryState } from './state.js'

/**
 * Aplica escolha de uma história pendente.
 * Assinatura compatível com resolveEventChoice(state, eventId, choiceId).
 */
export function resolveStoryChoice(state, storyId, choiceId) {
  const pending = state.pendingEvent
  if (!pending || pending.id !== storyId) {
    return {
      ok: false,
      error: 'História inválida ou não pendente.',
      effects: null,
      nextState: null,
    }
  }

  const choice = (pending.escolhas ?? []).find((c) => c.id === choiceId)
  if (!choice) {
    return {
      ok: false,
      error: `Escolha inválida: ${choiceId}`,
      effects: null,
      nextState: null,
    }
  }

  let merged = { ...(pending.efeitos ?? {}) }
  for (const [key, value] of Object.entries(choice.efeitos ?? {})) {
    merged[key] = (merged[key] ?? 0) + value
  }
  merged = applyPersonalityToChoiceEffects(merged, state.player)

  const relResult = applyEventToRelationships(
    state.relationships,
    merged,
    { reason: `story:${pending.id}:${choice.id}` },
  )
  const relationshipEffects = calculateRelationshipEffects(relResult.relationships)
  let status = applyStatusDeltas(state.status, merged)
  status = syncStatusFromRelationships(status, relResult.relationships)
  const careerVariables = syncLegacyCareerVariables(status)

  // Memória narrativa
  let story = createStoryState(state.story)
  story = {
    ...story,
    flags: applyFlagDeltas(story.flags, choice.flags ?? {}),
    storiesResolved: (story.storiesResolved ?? 0) + 1,
    updatedAt: Date.now(),
  }

  const seed = STORY_SEEDS_BY_ID[pending.seedId]
  const stage = pending.stage ?? 0
  const maxStages = pending.maxStages ?? seed?.stages?.length ?? 1
  const willContinue = choice.continue === 'next' && stage + 1 < maxStages
  const week = state.currentWeek ?? 1
  const gap = 1 + ((choice.tags ?? []).includes('media') ? 1 : 0)

  const chainId = pending.chainId ?? `chain_${pending.id}`
  const existing = story.chains.find((c) => c.id === chainId)

  const chain = createChainRecord({
    ...(existing ?? {}),
    id: chainId,
    seedId: pending.seedId,
    theme: pending.theme ?? pending.categoria,
    stage: willContinue ? stage + 1 : stage,
    maxStages,
    open: willContinue,
    title: pending.title ?? pending.texto,
    characters: {
      ...(existing?.characters ?? {}),
      ...(pending.characters ?? {}),
    },
    flags: applyFlagDeltas(
      { ...(existing?.flags ?? {}), ...(story.flags ?? {}) },
      choice.flags ?? {},
    ),
    lastChoiceId: choice.id,
    lastChoiceTags: choice.tags ?? [],
    createdWeek: existing?.createdWeek ?? week,
    createdSeason: existing?.createdSeason ?? state.currentSeason,
    lastWeek: week,
    dueWeek: willContinue ? week + gap : null,
  })

  story = upsertChain(story, chain)
  story = appendStoryHistory(story, {
    storyId: pending.id,
    seedId: pending.seedId,
    chainId,
    theme: pending.theme ?? pending.categoria,
    choiceId: choice.id,
    choiceLabel: choice.label,
    tags: choice.tags ?? [],
    week,
    season: state.currentSeason,
    continued: willContinue,
    title: pending.title ?? pending.texto,
  })

  const continuationText = willContinue
    ? `A história continua (capítulo ${stage + 2}/${maxStages}) em breve.`
    : 'Arco encerrado — decisões ficam na memória narrativa.'

  const messages = [
    `[${pending.categoriaLabel ?? pending.theme}] ${pending.title ?? pending.texto}`,
    choice.texto ?? `Escolha: ${choice.label}`,
    continuationText,
  ]

  for (const [key, value] of Object.entries(merged)) {
    if (!value) continue
    const sign = value > 0 ? '+' : ''
    messages.push(
      key === 'dinheiro'
        ? `${key}: ${sign}$${Math.abs(value).toLocaleString('en-US')}`
        : `${key}: ${sign}${value}`,
    )
  }
  for (const entry of relResult.log) {
    const sign = entry.delta > 0 ? '+' : ''
    messages.push(`Relação ${entry.key}: ${sign}${entry.delta}.`)
  }

  const effects = {
    eventId: pending.id,
    storyId: pending.id,
    chainId,
    categoria: pending.categoria ?? pending.theme,
    choiceId: choice.id,
    choiceLabel: choice.label,
    deltas: merged,
    relationshipDeltas: relResult.applied,
    flagsApplied: choice.flags ?? {},
    continued: willContinue,
    continuation: continuationText,
    messages,
  }

  let nextState = {
    ...state,
    status,
    careerVariables,
    relationships: relResult.relationships,
    relationshipEffects,
    playingTimeShare: relationshipEffects.playingTimeShare,
    story,
    pendingEvent: null,
    lastEvent: messages[messages.length - 1],
    lastEventResult: effects,
  }

  nextState.history = appendHistory(
    state.history,
    buildEventHistoryEntry(nextState, effects),
  )
  nextState.careerStats = updateCareerStatsAfterEvent(state.careerStats)

  // Achievement Engine — histórias / flags podem desbloquear colecionáveis
  const ach = processAchievementCheck(nextState)
  nextState = ach.state
  if (ach.messages.length) {
    effects.messages = [...effects.messages, ...ach.messages]
    effects.achievements = ach.summary
  }

  return {
    ok: true,
    error: null,
    effects,
    nextState,
    event: summarizeStoryForUi(pending),
  }
}
