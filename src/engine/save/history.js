import { MAX_HISTORY_ENTRIES } from '../../data/save/constants'

/**
 * Histórico vazio da carreira.
 */
export function createEmptyHistory() {
  return []
}

/**
 * Estatísticas acumuladas da carreira.
 */
export function createEmptyCareerStats() {
  return {
    weeksPlayed: 0,
    eventsResolved: 0,
    eventsTriggered: 0,
    totalXpEarned: 0,
    levelsGained: 0,
    trainingWeeks: 0,
    restWeeks: 0,
    mediaWeeks: 0,
    sponsorWeeks: 0,
    totalSalaryEarned: 0,
    totalSponsorEarned: 0,
    peakOverall: 0,
    peakPopularidade: 0,
    peakPatrimonio: 0,
  }
}

/**
 * Entrada de histórico semanal.
 */
export function buildWeekHistoryEntry(state, effects) {
  return {
    type: 'week',
    at: Date.now(),
    season: effects?.season ?? state.currentSeason,
    week: effects?.weekFrom ?? state.currentWeek,
    activityId: effects?.activityId ?? null,
    activityLabel: effects?.activityLabel ?? null,
    messages: effects?.messages ?? [],
    deltas: effects?.deltas ?? {},
    finance: effects?.finance
      ? {
          fluxoLiquido: effects.finance.fluxoLiquido,
          salario: effects.finance.salario,
          patrocinios: effects.finance.patrocinios,
          patrimonioNovo: effects.finance.patrimonioNovo,
        }
      : null,
    progression: effects?.progression
      ? {
          xpGain: effects.progression.xpGain,
          leveledUp: effects.progression.leveledUp,
          pointsGained: effects.progression.pointsGained,
        }
      : null,
    eventId: effects?.pendingEvent?.id ?? null,
    eventCategory: effects?.pendingEvent?.categoria ?? null,
  }
}

/**
 * Entrada de histórico de evento resolvido.
 */
export function buildEventHistoryEntry(state, effects) {
  return {
    type: 'event',
    at: Date.now(),
    season: state.currentSeason,
    week: state.currentWeek,
    eventId: effects?.eventId ?? null,
    choiceId: effects?.choiceId ?? null,
    messages: effects?.messages ?? [],
    deltas: effects?.deltas ?? {},
  }
}

export function appendHistory(history = [], entry) {
  const next = [...(history ?? []), entry]
  if (next.length <= MAX_HISTORY_ENTRIES) return next
  return next.slice(next.length - MAX_HISTORY_ENTRIES)
}

/**
 * Atualiza estatísticas acumuladas após uma semana.
 */
export function updateCareerStatsAfterWeek(stats, state, effects) {
  const base = { ...createEmptyCareerStats(), ...(stats ?? {}) }
  const activityType = effects?.activityType
  const finance = effects?.finance
  const progression = effects?.progression
  const overall = state.player?.overall ?? 0
  const pop = state.status?.popularidade ?? 0
  const patrimonio = state.finance?.patrimonio ?? 0

  base.weeksPlayed += 1
  if (effects?.pendingEvent) base.eventsTriggered += 1
  if (progression?.xpGain) base.totalXpEarned += progression.xpGain
  if (progression?.levelsGained) base.levelsGained += progression.levelsGained

  if (activityType === 'train') base.trainingWeeks += 1
  if (activityType === 'rest') base.restWeeks += 1
  if (activityType === 'media') base.mediaWeeks += 1
  if (activityType === 'sponsor') base.sponsorWeeks += 1

  if (finance?.salario) base.totalSalaryEarned += finance.salario
  if (finance?.patrocinios) base.totalSponsorEarned += finance.patrocinios

  base.peakOverall = Math.max(base.peakOverall, overall)
  base.peakPopularidade = Math.max(base.peakPopularidade, pop)
  base.peakPatrimonio = Math.max(base.peakPatrimonio, patrimonio)

  return base
}

export function updateCareerStatsAfterEvent(stats) {
  const base = { ...createEmptyCareerStats(), ...(stats ?? {}) }
  base.eventsResolved += 1
  return base
}
