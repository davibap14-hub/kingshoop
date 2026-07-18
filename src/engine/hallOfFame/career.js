import { emptyTotals } from './credentials.js'

/**
 * Acumula estatísticas de carreira a partir dos resultados da semana.
 * Fonte: mvpStats, performances e boxSummary (se existir).
 */
export function accumulateCareerTotals(history, weekResults = []) {
  const careerTotals = { ...(history.careerTotals ?? {}) }

  for (const result of weekResults) {
    const seenGames = new Set()

    for (const line of result.boxSummary ?? []) {
      const key = line.playerId || line.playerName
      bumpPlayer(careerTotals, line.playerId, line.playerName, {
        points: line.points ?? 0,
        assists: line.assists ?? 0,
        rebounds: line.rebounds ?? 0,
        games: 1,
      })
      if (key) seenGames.add(key)
    }

    if (result.mvpStats?.id || result.mvp) {
      const mvpId = result.mvpStats?.id
      const mvpName = result.mvpStats?.nome ?? result.mvp
      const key = mvpId || mvpName
      bumpPlayer(careerTotals, mvpId, mvpName, {
        points: seenGames.has(key) ? 0 : result.mvpStats?.points ?? 0,
        assists: seenGames.has(key) ? 0 : result.mvpStats?.assists ?? 0,
        rebounds: seenGames.has(key) ? 0 : result.mvpStats?.rebounds ?? 0,
        games: seenGames.has(key) ? 0 : 1,
        gameMvps: 1,
      })
    }

    for (const perf of result.performances ?? []) {
      if (!perf.playerId && !perf.playerName) continue
      if (
        perf.type !== 'game_mvp' &&
        perf.type !== 'scoring_burst' &&
        perf.type !== 'triple_double'
      ) {
        continue
      }
      const key = perf.playerId || perf.playerName
      // game_mvp já contado via mvpStats
      if (perf.type === 'game_mvp') continue
      bumpPlayer(careerTotals, perf.playerId, perf.playerName, {
        points: seenGames.has(key) ? 0 : perf.points ?? 0,
        assists: seenGames.has(key) ? 0 : perf.assists ?? 0,
        rebounds: seenGames.has(key) ? 0 : perf.rebounds ?? 0,
        games: seenGames.has(key) ? 0 : 1,
      })
    }
  }

  return {
    ...history,
    careerTotals,
  }
}

/**
 * Credita All-Star / All-NBA / MVP / DPOY ao arquivar temporada.
 */
export function creditSeasonHonors(history, archive) {
  if (!archive?.season) return history

  const careerTotals = { ...(history.careerTotals ?? {}) }
  const seasonGameMvps = archive.gameMvpTotals ?? {}

  const ranked = Object.entries(seasonGameMvps)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))

  // All-Star: top 12 · All-NBA: top 5 · +1 temporada ativa
  ranked.slice(0, 12).forEach((row, i) => {
    bumpHonors(careerTotals, row.key, {
      allStar: 1,
      allNba: i < 5 ? 1 : 0,
      seasons: 1,
    })
  })

  // MVP / DPOY da temporada → líder de game MVPs (proxy do time premiado)
  if (archive.awards?.mvp && ranked[0]) {
    bumpHonors(careerTotals, ranked[0].key, { mvps: 1 })
  }
  if (archive.awards?.dpoy && ranked[0]) {
    // DPOY: segundo líder se MVP já pegou o primeiro e times diferentes — senão o #1
    const dpoyKey =
      ranked[1] && archive.awards.dpoy.teamId !== archive.awards.mvp?.teamId
        ? ranked[1].key
        : ranked[0].key
    bumpHonors(careerTotals, dpoyKey, { dpoy: 1 })
  }

  // Finals MVP por nome
  const finalsName = archive.awards?.finals_mvp?.detail
  if (finalsName && typeof finalsName === 'string' && !/Star$/i.test(finalsName)) {
    bumpHonors(careerTotals, finalsName, { mvps: 1, titles: 1 })
  }

  return {
    ...history,
    careerTotals,
  }
}

function bumpPlayer(careerTotals, playerId, playerName, delta) {
  const key = playerId || playerName
  if (!key) return
  const prev = careerTotals[key] ?? emptyTotals()
  careerTotals[key] = {
    ...prev,
    name: playerName ?? prev.name ?? key,
    points: (prev.points ?? 0) + (delta.points ?? 0),
    assists: (prev.assists ?? 0) + (delta.assists ?? 0),
    rebounds: (prev.rebounds ?? 0) + (delta.rebounds ?? 0),
    games: (prev.games ?? 0) + (delta.games ?? 0),
    gameMvps: (prev.gameMvps ?? 0) + (delta.gameMvps ?? 0),
    seasons: prev.seasons ?? 0,
    titles: prev.titles ?? 0,
    mvps: prev.mvps ?? 0,
    allStar: prev.allStar ?? 0,
    allNba: prev.allNba ?? 0,
    dpoy: prev.dpoy ?? 0,
  }
}

function bumpHonors(careerTotals, key, honors) {
  if (!key) return
  const prev = careerTotals[key] ?? emptyTotals()
  careerTotals[key] = {
    ...prev,
    name: prev.name ?? key,
    titles: (prev.titles ?? 0) + (honors.titles ?? 0),
    mvps: (prev.mvps ?? 0) + (honors.mvps ?? 0),
    allStar: (prev.allStar ?? 0) + (honors.allStar ?? 0),
    allNba: (prev.allNba ?? 0) + (honors.allNba ?? 0),
    dpoy: (prev.dpoy ?? 0) + (honors.dpoy ?? 0),
    seasons: (prev.seasons ?? 0) + (honors.seasons ?? 0),
  }
}
