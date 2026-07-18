import { HOF_THRESHOLDS } from '../../data/history/index.js'
import { resolvePlayer } from '../gm/situation'

/**
 * Avalia elegibilidade e induz jogadores ao Hall da Fama.
 */
export function evaluateHallOfFame({ history, gm = null, retiredPlayerIds = [] }) {
  const existing = new Set((history.hallOfFame || []).map((h) => h.playerId))
  const inductees = []

  const finalsMvpCount = {}
  for (const a of history.awards || []) {
    if (a.type !== 'finals_mvp' || !a.detail) continue
    // detail costuma ser o nome do MVP das finais
    const key = a.detail
    finalsMvpCount[key] = (finalsMvpCount[key] || 0) + 1
  }

  const gameMvps = { ...(history.gameMvpTotals || {}) }
  const candidates = new Set([
    ...retiredPlayerIds,
    ...(history.retirements || []).map((r) => r.playerId),
  ])

  // Lendas com muitos MVPs de jogo também entram na fila
  for (const [key, count] of Object.entries(gameMvps)) {
    if (count >= HOF_THRESHOLDS.minGameMvps) candidates.add(key)
  }
  for (const [name, count] of Object.entries(finalsMvpCount)) {
    if (count >= HOF_THRESHOLDS.minFinalsMvp) candidates.add(name)
  }

  for (const playerId of candidates) {
    if (existing.has(playerId)) continue

    const player = gm ? resolvePlayer(gm, playerId) : null
    const name = player?.nome ?? playerId
    const age = player?.idade ?? player?.age ?? null
    const retirement = (history.retirements || []).find(
      (r) => r.playerId === playerId || r.name === name,
    )
    const displayName = retirement?.name ?? name
    const playerGameMvps =
      gameMvps[playerId] ?? gameMvps[displayName] ?? gameMvps[name] ?? 0
    const playerFinalsMvps =
      finalsMvpCount[displayName] ??
      finalsMvpCount[name] ??
      finalsMvpCount[playerId] ??
      0

    // Títulos: jogador aposentado pelo time campeão na mesma temporada
    let titles = 0
    if (retirement) {
      for (const champ of history.champions || []) {
        if (
          champ.season === retirement.season &&
          champ.teamId === retirement.teamId
        ) {
          titles += 1
        }
      }
    }

    const eligible =
      playerGameMvps >= HOF_THRESHOLDS.minGameMvps ||
      playerFinalsMvps >= HOF_THRESHOLDS.minFinalsMvp ||
      titles >= HOF_THRESHOLDS.minChampionships ||
      (HOF_THRESHOLDS.autoInductOnRetirement &&
        retirement &&
        (age ?? retirement.age ?? 0) >= HOF_THRESHOLDS.minAge)

    if (!eligible) continue

    inductees.push({
      playerId,
      name,
      teamId: retirement?.teamId ?? player?.teamId ?? null,
      inductedSeason:
        retirement?.season ?? history.seasons?.at(-1)?.season ?? null,
      inductedAt: Date.now(),
      credentials: {
        gameMvps: playerGameMvps,
        finalsMvps: playerFinalsMvps,
        titles,
        age: age ?? retirement?.age ?? null,
      },
      reason: buildHofReason({
        gameMvps: playerGameMvps,
        finalsMvps: playerFinalsMvps,
        titles,
        age: age ?? retirement?.age,
      }),
    })
  }

  if (inductees.length === 0) {
    return { history, inductees: [] }
  }

  return {
    history: {
      ...history,
      hallOfFame: [...(history.hallOfFame || []), ...inductees],
    },
    inductees,
  }
}

function buildHofReason({ gameMvps, finalsMvps, titles, age }) {
  const parts = []
  if (finalsMvps > 0) parts.push(`${finalsMvps} MVP(s) das Finais`)
  if (titles > 0) parts.push(`${titles} título(s)`)
  if (gameMvps > 0) parts.push(`${gameMvps} MVPs de jogo`)
  if (age != null) parts.push(`${age} anos`)
  return parts.length ? parts.join(' · ') : 'Carreira lendária'
}
