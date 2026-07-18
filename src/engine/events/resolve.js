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
import {
  appendHistory,
  buildEventHistoryEntry,
  updateCareerStatsAfterEvent,
} from '../save'
import { getEventById, summarizeEventForUi } from './eligibility'

/**
 * Aplica a escolha de um evento pendente.
 * Entrada: estado + eventId + choiceId
 * Saída: efeitos + nextState (sem UI)
 */
export function resolveEventChoice(state, eventId, choiceId) {
  const pending = state.pendingEvent
  const event = getEventById(eventId) ?? pending

  if (!event || event.id !== eventId) {
    return {
      ok: false,
      error: 'Evento inválido ou não pendente.',
      effects: null,
      nextState: null,
    }
  }

  if (pending && pending.id !== eventId) {
    return {
      ok: false,
      error: 'Este não é o evento pendente atual.',
      effects: null,
      nextState: null,
    }
  }

  const choice = (event.escolhas ?? []).find((c) => c.id === choiceId)
  if (!choice) {
    return {
      ok: false,
      error: `Escolha inválida: ${choiceId}`,
      effects: null,
      nextState: null,
    }
  }

  const baseEffects = event.efeitos ?? {}
  const choiceEffects = choice.efeitos ?? {}
  let merged = { ...baseEffects }

  for (const [key, value] of Object.entries(choiceEffects)) {
    merged[key] = (merged[key] ?? 0) + value
  }

  // Personality Engine — amplifica / atenua efeitos da escolha
  merged = applyPersonalityToChoiceEffects(merged, state.player)

  // Relationship Engine — atualiza coach/gm/teammates/fans/press/sponsors/agent
  const relResult = applyEventToRelationships(
    state.relationships,
    merged,
    { reason: `event:${event.id}:${choice.id}` },
  )
  const relationshipEffects = calculateRelationshipEffects(relResult.relationships)
  let status = applyStatusDeltas(state.status, merged)
  status = syncStatusFromRelationships(status, relResult.relationships)
  const careerVariables = syncLegacyCareerVariables(status)

  const messages = [
    `[${event.categoriaLabel ?? event.categoria}] ${event.texto}`,
    choice.texto ?? `Escolha: ${choice.label}`,
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
    eventId: event.id,
    categoria: event.categoria,
    choiceId: choice.id,
    choiceLabel: choice.label,
    deltas: merged,
    relationshipDeltas: relResult.applied,
    messages,
  }

  let nextState = {
    ...state,
    status,
    careerVariables,
    relationships: relResult.relationships,
    relationshipEffects,
    playingTimeShare: relationshipEffects.playingTimeShare,
    pendingEvent: null,
    lastEvent: messages[messages.length - 1],
    lastEventResult: effects,
  }

  nextState.history = appendHistory(
    state.history,
    buildEventHistoryEntry(nextState, effects),
  )
  nextState.careerStats = updateCareerStatsAfterEvent(state.careerStats)

  return {
    ok: true,
    error: null,
    effects,
    nextState,
    event: summarizeEventForUi(event, state.player),
  }
}
