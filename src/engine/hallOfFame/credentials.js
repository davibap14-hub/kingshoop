import { resolvePlayer } from '../gm/situation'
import { clamp } from '../utils/math'

/**
 * Totais de carreira persistidos no History (por playerId / nome).
 */
export function getCareerTotals(history, playerId, playerName) {
  const bag = history?.careerTotals ?? {}
  const byId = bag[playerId] ?? null
  const byName =
    playerName && playerName !== playerId ? bag[playerName] ?? null : null
  return mergeTotals(byId, byName)
}

function mergeTotals(a, b) {
  if (!a && !b) {
    return emptyTotals()
  }
  if (!a) return { ...emptyTotals(), ...b }
  if (!b) return { ...emptyTotals(), ...a }
  return {
    points: (a.points ?? 0) + (b.points ?? 0),
    assists: (a.assists ?? 0) + (b.assists ?? 0),
    rebounds: (a.rebounds ?? 0) + (b.rebounds ?? 0),
    games: Math.max(a.games ?? 0, b.games ?? 0),
    seasons: Math.max(a.seasons ?? 0, b.seasons ?? 0),
    gameMvps: (a.gameMvps ?? 0) + (b.gameMvps ?? 0),
    titles: Math.max(a.titles ?? 0, b.titles ?? 0),
    mvps: Math.max(a.mvps ?? 0, b.mvps ?? 0),
    allStar: Math.max(a.allStar ?? 0, b.allStar ?? 0),
    allNba: Math.max(a.allNba ?? 0, b.allNba ?? 0),
    dpoy: Math.max(a.dpoy ?? 0, b.dpoy ?? 0),
    name: a.name ?? b.name ?? null,
  }
}

export function emptyTotals() {
  return {
    points: 0,
    assists: 0,
    rebounds: 0,
    games: 0,
    seasons: 0,
    gameMvps: 0,
    titles: 0,
    mvps: 0,
    allStar: 0,
    allNba: 0,
    dpoy: 0,
    name: null,
  }
}

/**
 * Conta prêmios / títulos a partir do arquivo permanente + totais.
 */
export function gatherCredentials({
  playerId,
  playerName,
  history,
  gm = null,
  retirement = null,
} = {}) {
  const player = gm ? resolvePlayer(gm, playerId) : null
  const name = player?.nome ?? retirement?.name ?? playerName ?? playerId
  const totals = getCareerTotals(history, playerId, name)
  const age = player?.idade ?? retirement?.age ?? null

  // Game MVPs do mapa legado
  const gameMvps =
    totals.gameMvps ||
    history?.gameMvpTotals?.[playerId] ||
    history?.gameMvpTotals?.[name] ||
    0

  // Finals MVP por nome em awards
  let finalsMvps = 0
  for (const a of history?.awards ?? []) {
    if (a.type !== 'finals_mvp') continue
    if (a.detail === name || a.playerId === playerId || a.playerName === name) {
      finalsMvps += 1
    }
  }

  // Títulos: totais creditados + aposentadoria no ano do título do time
  let titles = totals.titles ?? 0
  if (retirement?.teamId) {
    for (const champ of history?.champions ?? []) {
      if (
        champ.teamId === retirement.teamId &&
        (champ.season === retirement.season ||
          Math.abs((champ.season ?? 0) - (retirement.season ?? 0)) <= 1)
      ) {
        titles = Math.max(titles, (totals.titles ?? 0) + 1)
      }
    }
  }

  // MVPs / DPOY / All-Star / All-NBA creditados nos totais (via archive honors)
  let mvps = totals.mvps ?? 0
  let dpoy = totals.dpoy ?? 0
  let allStar = totals.allStar ?? 0
  let allNba = totals.allNba ?? 0

  // Proxies se ainda zerados: carreira com muitos game MVPs
  if (allStar === 0 && gameMvps > 0) {
    allStar = Math.min(12, Math.floor(gameMvps / 4))
  }
  if (allNba === 0 && gameMvps > 0) {
    allNba = Math.min(8, Math.floor(gameMvps / 7))
  }

  const seasons =
    totals.seasons ||
    Math.max(1, Math.round((totals.games ?? 0) / 70)) ||
    (age != null ? Math.max(1, age - 19) : 1)

  const popularity = clamp(
    Math.round(
      player?.popularidade ??
        retirement?.popularidade ??
        40 + Math.min(40, gameMvps) + (titles + mvps + finalsMvps) * 5,
    ),
    0,
    100,
  )

  // Legacy Engine — score pré-computado (se disponível no history/state)
  const legacyScore =
    history?.legacyScores?.[playerId]?.score ??
    history?.legacyScores?.[name]?.score ??
    null

  return {
    playerId,
    name,
    teamId: retirement?.teamId ?? player?.teamId ?? null,
    age,
    titles,
    mvps,
    finalsMvps,
    allStar,
    allNba,
    dpoy,
    points: totals.points ?? 0,
    assists: totals.assists ?? 0,
    rebounds: totals.rebounds ?? 0,
    games: totals.games ?? 0,
    gameMvps,
    longevity: seasons,
    popularity,
    seasons,
    legacyScore,
  }
}
