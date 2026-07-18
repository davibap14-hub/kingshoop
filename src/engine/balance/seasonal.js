import { calcOverall } from '../../data/players/utils'
import { applySeasonalAging } from './aging.js'

/**
 * Balance Engine — tick de temporada.
 * Idade +1, crescimento de rookies, decadência de veteranos.
 * Persiste overrides da liga em `gm.playerOverrides`.
 */
export function processSeasonalBalance({
  player,
  gm,
  seasonRolled = false,
  resolvePlayer = null,
  rng = Math.random,
} = {}) {
  if (!seasonRolled) {
    return {
      player,
      gm,
      messages: [],
      summary: {
        rolled: false,
        careerAged: false,
        leagueUpdated: 0,
      },
    }
  }

  const messages = []
  let nextPlayer = player
  let careerAged = false

  if (player) {
    const aged = applySeasonalAging(player, rng)
    nextPlayer = aged.player
    careerAged = aged.changed
    if (aged.changed) {
      messages.push(`Balance: idade ${aged.age}.`)
      messages.push(...aged.messages.slice(0, 2))
    }
  }

  let nextGm = gm
  let leagueUpdated = 0

  if (gm && typeof resolvePlayer === 'function') {
    const result = applyLeagueAgingWithResolver(gm, resolvePlayer, rng)
    nextGm = result.gm
    leagueUpdated = result.updated
    if (leagueUpdated > 0) {
      messages.push(
        `Balance: ${leagueUpdated} jogador(es) da liga atualizados (idade/attrs).`,
      )
    }
  }

  return {
    player: nextPlayer,
    gm: nextGm,
    messages,
    summary: {
      rolled: true,
      careerAged,
      careerAge: nextPlayer?.idade ?? null,
      careerOverall: nextPlayer?.overall ?? null,
      leagueUpdated,
    },
  }
}

/**
 * Envelhece elenco/FA da liga com resolver (DB + extras + draft).
 */
export function applyLeagueAgingWithResolver(gm, resolvePlayer, rng = Math.random) {
  const ids = new Set([
    ...Object.values(gm.rosters ?? {}).flat(),
    ...(gm.freeAgents ?? []),
    ...(gm.extraPlayers ?? []).map((p) => p.id),
  ])

  const playerOverrides = { ...(gm.playerOverrides ?? {}) }
  let extraPlayers = [...(gm.extraPlayers ?? [])]
  let updated = 0

  for (const id of ids) {
    const resolved = resolvePlayer(
      { ...gm, playerOverrides, extraPlayers },
      id,
    )
    if (!resolved) continue

    const aged = applySeasonalAging(resolved, rng)
    if (!aged.changed) continue
    updated += 1

    const inExtra = extraPlayers.some((p) => p.id === id)
    if (inExtra) {
      extraPlayers = extraPlayers.map((p) => (p.id === id ? aged.player : p))
    } else {
      playerOverrides[id] = snapshotPlayer(aged.player)
    }
  }

  return {
    gm: {
      ...gm,
      playerOverrides,
      extraPlayers,
    },
    updated,
  }
}

function snapshotPlayer(player) {
  return {
    id: player.id,
    idade: player.idade,
    potencial: player.potencial,
    overall: player.overall ?? calcOverall(player),
    salario: player.salario,
    fisico: { ...(player.fisico ?? {}) },
    arremesso: { ...(player.arremesso ?? {}) },
    defesa: { ...(player.defesa ?? {}) },
    qi: { ...(player.qi ?? {}) },
  }
}
