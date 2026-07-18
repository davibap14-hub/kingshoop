/**
 * Estado persistível da Story Engine — memória narrativa.
 */

export function createStoryState(overrides = {}) {
  return {
    /** Cadeias narrativas abertas / recentes */
    chains: Array.isArray(overrides.chains) ? overrides.chains : [],
    /** Flags acumuladas de decisões (influenciam futuros eventos) */
    flags: { ...(overrides.flags ?? {}) },
    /** Histórico de histórias resolvidas */
    history: Array.isArray(overrides.history) ? overrides.history : [],
    /** themeId → última semana em que uma cadeia nova começou */
    themeCooldowns: { ...(overrides.themeCooldowns ?? {}) },
    /** Contadores */
    storiesTold: overrides.storiesTold ?? 0,
    storiesResolved: overrides.storiesResolved ?? 0,
    updatedAt: overrides.updatedAt ?? null,
  }
}

export function createChainRecord(partial = {}) {
  return {
    id: partial.id,
    seedId: partial.seedId,
    theme: partial.theme,
    stage: partial.stage ?? 0,
    maxStages: partial.maxStages ?? 1,
    open: partial.open !== false,
    title: partial.title ?? '',
    characters: { ...(partial.characters ?? {}) },
    flags: { ...(partial.flags ?? {}) },
    lastChoiceId: partial.lastChoiceId ?? null,
    lastChoiceTags: partial.lastChoiceTags ?? [],
    createdWeek: partial.createdWeek ?? null,
    createdSeason: partial.createdSeason ?? null,
    lastWeek: partial.lastWeek ?? null,
    dueWeek: partial.dueWeek ?? null,
  }
}
