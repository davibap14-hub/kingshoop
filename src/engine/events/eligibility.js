import { CAREER_EVENTS, CAREER_EVENTS_BY_ID } from '../../data/events/catalog'
import { EVENT_CATEGORIES } from '../../data/events/categories'
import {
  calcEventWeightMultiplier,
  matchesPersonalityConditions,
  sortChoicesByPersonality,
} from '../personality/events'
import { calculateRelationshipEffects } from '../relationships'
import { pickWeighted } from '../utils/math'

/**
 * Avalia se o evento pode ocorrer no estado atual.
 */
export function matchesConditions(event, state, context = {}) {
  const c = event.condicoes ?? {}
  const status = state.status ?? {}
  const week = state.currentWeek ?? 1

  if (c.requiresInjury && !state.injury) return false
  if (c.requiresHealthy && state.injury) return false

  if (c.minEnergia != null && (status.energia ?? 0) < c.minEnergia) return false
  if (c.maxEnergia != null && (status.energia ?? 0) > c.maxEnergia) return false
  if (c.minMotivacao != null && (status.motivacao ?? 0) < c.minMotivacao) return false
  if (c.minPopularidade != null && (status.popularidade ?? 0) < c.minPopularidade) {
    return false
  }
  if (c.minRelTreinador != null && (status.relTreinador ?? 0) < c.minRelTreinador) {
    return false
  }
  if (
    c.minRelCompanheiros != null &&
    (status.relCompanheiros ?? 0) < c.minRelCompanheiros
  ) {
    return false
  }

  // Relationship Engine — condições opcionais por chave
  const rel = state.relationships ?? {}
  if (c.minCoach != null && (rel.coach ?? 0) < c.minCoach) return false
  if (c.minGm != null && (rel.gm ?? 0) < c.minGm) return false
  if (c.minTeammates != null && (rel.teammates ?? 0) < c.minTeammates) return false
  if (c.minFans != null && (rel.fans ?? 0) < c.minFans) return false
  if (c.minPress != null && (rel.press ?? 0) < c.minPress) return false
  if (c.minSponsors != null && (rel.sponsors ?? 0) < c.minSponsors) return false
  if (c.minAgent != null && (rel.agent ?? 0) < c.minAgent) return false

  if (c.minWeek != null && week < c.minWeek) return false
  if (c.maxWeek != null && week > c.maxWeek) return false

  if (c.activityTypes?.length) {
    const activityType = context.activityType
    if (!activityType || !c.activityTypes.includes(activityType)) return false
  }

  if (c.categoriasBloqueadas?.includes(event.categoria)) return false

  if (!matchesPersonalityConditions(event, state.player)) return false

  return true
}

export function getEventById(eventId) {
  return CAREER_EVENTS_BY_ID[eventId] ?? null
}

export function listEventsByCategory(categoria) {
  return CAREER_EVENTS.filter((e) => e.categoria === categoria)
}

export function listEligibleEvents(state, context = {}) {
  return CAREER_EVENTS.filter((e) => matchesConditions(e, state, context))
}

/**
 * Sorteia um evento elegível.
 * 1) filtra condições
 * 2) sorteio ponderado por `peso`
 * 3) gate de `probabilidade`
 *
 * @returns {object|null} evento completo ou null
 */
export function rollEvent(state, context = {}, rng = Math.random) {
  const eligible = listEligibleEvents(state, context)
  if (!eligible.length) return null

  // Relationship Engine — peso por categoria (tensão / alianças)
  const relMods =
    calculateRelationshipEffects(state.relationships).eventWeightMods ?? {}

  // Personality + Relationship — repondera eventos
  const weighted = eligible.map((e) => ({
    ...e,
    peso: Math.max(
      0.1,
      (e.peso ?? 1) *
        calcEventWeightMultiplier(e, state.player) *
        (relMods[e.categoria] ?? 1),
    ),
  }))

  const picked = pickWeighted(weighted, 'peso', rng)
  if (!picked) return null

  if (rng() > (picked.probabilidade ?? 1)) {
    return null
  }

  return structuredClone
    ? structuredClone(picked)
    : JSON.parse(JSON.stringify(picked))
}

/**
 * Versão segura sem structuredClone (ambientes antigos).
 */
export function cloneEvent(event) {
  return JSON.parse(JSON.stringify(event))
}

export function getCategoryMeta(categoria) {
  return EVENT_CATEGORIES[categoria] ?? { id: categoria, label: categoria }
}

export function summarizeEventForUi(event, player = null) {
  if (!event) return null
  const escolhasRaw = (event.escolhas ?? []).map((c) => ({
    id: c.id,
    label: c.label,
    efeitos: { ...c.efeitos },
  }))
  const escolhas = player
    ? sortChoicesByPersonality(escolhasRaw, player)
    : escolhasRaw

  return {
    id: event.id,
    categoria: event.categoria,
    categoriaLabel: event.categoriaLabel ?? getCategoryMeta(event.categoria).label,
    texto: event.texto,
    escolhas,
  }
}
