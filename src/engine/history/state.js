/**
 * Estado permanente do History Engine.
 * Nenhuma temporada arquivada é apagada.
 */

export function createLeagueHistory(overrides = {}) {
  return {
    /** Arquivos completos por temporada (nunca truncar) */
    seasons: overrides.seasons ?? [],
    /** Todos os MVPs de temporada */
    mvps: overrides.mvps ?? [],
    /** Todos os campeões */
    champions: overrides.champions ?? [],
    /** Todas as premiações (lista plana) */
    awards: overrides.awards ?? [],
    /** Líderes por temporada */
    leaders: overrides.leaders ?? [],
    /** Recordes all-time */
    records: overrides.records ?? createEmptyRecords(),
    /** Hall da Fama (induzidos) */
    hallOfFame: overrides.hallOfFame ?? [],
    /** Votações HOF permanentes (inclui "Não entrou") */
    hofBallots: overrides.hofBallots ?? [],
    /** Totais de carreira por jogador (pts/ast/reb + prêmios) */
    careerTotals: overrides.careerTotals ?? {},
    /** Aposentadorias registradas */
    retirements: overrides.retirements ?? [],
    /** MVPs de partida acumulados (nome → contagem / detalhes) */
    gameMvpTotals: overrides.gameMvpTotals ?? {},
    /** Triple-doubles acumulados */
    tripleDoubleTotals: overrides.tripleDoubleTotals ?? {},
    /** Expansion Engine — ondas de expansão da liga */
    expansions: overrides.expansions ?? [],
    /** Dynasty Engine — dinastias históricas reconhecidas */
    dynasties: overrides.dynasties ?? [],
  }
}

export function createEmptyRecords() {
  return {
    highestTeamScore: null,
    largestMargin: null,
    longestWinStreak: null,
    mostWinsSeason: null,
    mostPointsGame: null,
    tripleDoublesSeason: null,
  }
}

export function cloneHistory(history) {
  return createLeagueHistory(
    structuredClone
      ? structuredClone(history ?? {})
      : JSON.parse(JSON.stringify(history ?? {})),
  )
}
