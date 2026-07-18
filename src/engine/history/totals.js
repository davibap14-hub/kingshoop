/**
 * Acumula MVPs de jogo e triplos-duplos a partir dos resultados da semana.
 * Totais permanentes — nunca zeram entre temporadas.
 */
export function accumulateWeekTotals(history, weekResults = []) {
  const gameMvpTotals = { ...(history.gameMvpTotals || {}) }
  const tripleDoubleTotals = { ...(history.tripleDoubleTotals || {}) }

  for (const result of weekResults) {
    const mvpId = result.mvpStats?.id
    const mvpName = result.mvp
    const mvpKey = mvpId || mvpName
    if (mvpKey) {
      gameMvpTotals[mvpKey] = (gameMvpTotals[mvpKey] || 0) + 1
    }

    for (const perf of result.performances ?? []) {
      if (perf.type !== 'triple_double') continue
      const key = perf.playerId || perf.playerName
      if (!key) continue
      tripleDoubleTotals[key] = (tripleDoubleTotals[key] || 0) + 1
    }
  }

  return {
    ...history,
    gameMvpTotals,
    tripleDoubleTotals,
  }
}
