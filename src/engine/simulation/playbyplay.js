import { PLAY_ACTION_LABELS } from '../../data/simulation/constants'

let _seq = 0

/**
 * Formata um evento de Play-by-Play.
 */
export function formatPbpEvent({
  quarter,
  clock,
  homeScore,
  awayScore,
  offenseTeam,
  defenseTeam,
  action,
  text,
  actors = {},
  points = 0,
}) {
  _seq += 1
  return {
    id: `pbp_${_seq}_${Date.now()}`,
    seq: _seq,
    quarter,
    clock: clock ?? `Q${quarter}`,
    action,
    actionLabel: PLAY_ACTION_LABELS[action] ?? action,
    text,
    actors,
    points,
    score: {
      home: homeScore,
      away: awayScore,
    },
    offense: offenseTeam?.short ?? offenseTeam?.id,
    defense: defenseTeam?.short ?? defenseTeam?.id,
  }
}

export function resetPbpSeq() {
  _seq = 0
}

/**
 * Atualiza placar nos eventos após a posse (pontos marcados).
 */
export function stampScoreOnEvents(events, homeScore, awayScore) {
  return events.map((e) => ({
    ...e,
    score: { home: homeScore, away: awayScore },
  }))
}
