import { resolvePlayer } from '../gm/situation.js'
import { evolvePlayerDna } from './evolve.js'
import { ensurePlayerDna } from './normalize.js'

/**
 * Evolução semanal do DNA:
 * - jogador de carreira (estado.player)
 * - elenco do time atual (via gm.playerOverrides)
 *
 * Mudanças lentas — identidade preservada pela âncora.
 */
export function processWeeklyDna({
  player,
  gm,
  currentTeamId,
  week = 1,
  activityType = null,
  weekResults = [],
  playingTimeShare = 24,
} = {}) {
  const messages = []
  const dnaLog = []
  let nextPlayer = player ? ensurePlayerDna(player) : player
  let nextGm = gm

  const careerGame = (weekResults ?? []).find(
    (r) => r.homeId === currentTeamId || r.awayId === currentTeamId,
  )
  let won
  if (careerGame) {
    if (careerGame.winnerId != null) {
      won = careerGame.winnerId === currentTeamId
    } else if (careerGame.homeId === currentTeamId) {
      won = (careerGame.homeScore ?? 0) > (careerGame.awayScore ?? 0)
    } else {
      won = (careerGame.awayScore ?? 0) > (careerGame.homeScore ?? 0)
    }
  }

  const evolveOne = (p, extras = {}) => {
    const result = evolvePlayerDna(p, {
      week,
      gameGrade: won === true ? 78 : won === false ? 62 : undefined,
      minutes: playingTimeShare,
      teamLeader: Boolean(extras.teamLeader),
      highUsage: Boolean(extras.highUsage),
      transitionHeavy: activityType === 'train' || extras.transitionHeavy,
      clutchMoment: Boolean(careerGame && Math.abs(
        (careerGame.homeScore ?? 0) - (careerGame.awayScore ?? 0),
      ) <= 5),
      clutchSuccess: won === true,
    })
    if (result.deltas.length) {
      dnaLog.push({
        playerId: p.id,
        name: p.nome ?? p.name,
        deltas: result.deltas,
      })
    }
    return result.player
  }

  if (nextPlayer) {
    nextPlayer = evolveOne(nextPlayer, {
      highUsage: true,
      teamLeader: true,
    })
  }

  // Micro-evolução do elenco do time (overrides), sem reescrever o DB.
  if (gm && currentTeamId) {
    const rosterIds = gm.rosters?.[currentTeamId] ?? []
    const overrides = { ...(gm.playerOverrides ?? {}) }
    let changed = 0

    for (const id of rosterIds) {
      if (nextPlayer && id === nextPlayer.id) {
        overrides[id] = {
          ...(overrides[id] ?? {}),
          dna: nextPlayer.dna,
          dnaAnchor: nextPlayer.dnaAnchor,
        }
        changed += 1
        continue
      }

      const resolved = resolvePlayer(gm, id)
      if (!resolved) continue
      const evolved = evolveOne(ensurePlayerDna(resolved))
      overrides[id] = {
        ...(overrides[id] ?? {}),
        dna: evolved.dna,
        dnaAnchor: evolved.dnaAnchor,
      }
      changed += 1
    }

    if (changed) {
      nextGm = {
        ...gm,
        playerOverrides: overrides,
      }
      messages.push(
        `DNA Engine: identidade de ${changed} jogador(es) evoluiu levemente.`,
      )
    }
  } else if (dnaLog.length) {
    messages.push('DNA Engine: identidade do jogador evoluiu levemente.')
  }

  return {
    player: nextPlayer,
    gm: nextGm,
    dnaLog,
    messages,
    summary: {
      evolved: dnaLog.length,
      week,
      log: dnaLog.slice(0, 8),
    },
  }
}
