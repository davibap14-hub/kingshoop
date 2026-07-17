import {
  applyStatusDeltas,
  syncLegacyCareerVariables,
} from '../career/state'
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
  const merged = { ...baseEffects }

  for (const [key, value] of Object.entries(choiceEffects)) {
    merged[key] = (merged[key] ?? 0) + value
  }

  const status = applyStatusDeltas(state.status, merged)
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

  const effects = {
    eventId: event.id,
    categoria: event.categoria,
    choiceId: choice.id,
    choiceLabel: choice.label,
    deltas: merged,
    messages,
  }

  let nextState = {
    ...state,
    status,
    careerVariables,
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
    event: summarizeEventForUi(event),
  }
}
