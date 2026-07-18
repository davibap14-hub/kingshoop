/**
 * Estado persistível da Achievement Engine.
 */

export function createAchievementsState(overrides = {}) {
  return {
    /** id → { at, season, week, reward } */
    unlocked: { ...(overrides.unlocked ?? {}) },
    /** id → progresso numérico atual */
    progress: { ...(overrides.progress ?? {}) },
    /** últimas desbloqueadas (UI) */
    lastUnlocked: Array.isArray(overrides.lastUnlocked)
      ? overrides.lastUnlocked
      : [],
    /** contadores auxiliares não derivados */
    counters: {
      injuryRecoveries: 0,
      teamsPlayed: [],
      bestGamePoints: 0,
      bestGameAssists: 0,
      bestGameRebounds: 0,
      bestGameSteals: 0,
      bestGameBlocks: 0,
      bestMarginWin: 0,
      gameMvps: 0,
      tripleDoubles: 0,
      ...(overrides.counters ?? {}),
    },
    unlockedCount: overrides.unlockedCount ?? 0,
    updatedAt: overrides.updatedAt ?? null,
  }
}
