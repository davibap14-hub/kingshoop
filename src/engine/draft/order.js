import { TEAMS } from '../../data/teams'

/**
 * Ordem do draft: pior campanha primeiro (standings invertidos).
 * Empate: menos vitórias / mais derrotas.
 */
export function buildDraftOrder(seasonState, teams = TEAMS) {
  const standings = Object.values(seasonState?.standings ?? {})
  if (!standings.length) {
    return teams.map((t) => t.id)
  }

  const sorted = [...standings].sort((a, b) => {
    if (a.wins !== b.wins) return a.wins - b.wins
    if (a.losses !== b.losses) return b.losses - a.losses
    return String(a.teamId).localeCompare(String(b.teamId))
  })

  const order = sorted.map((r) => r.teamId)
  for (const t of teams) {
    if (!order.includes(t.id)) order.push(t.id)
  }
  return order
}

/**
 * Expande ordem em rodadas (snake opcional).
 * round 1: ordem natural; round 2: invertida; etc.
 */
export function expandDraftPicks(order, rounds = 2, { snake = true } = {}) {
  const picks = []
  let pickNumber = 1
  for (let r = 0; r < rounds; r++) {
    const sequence =
      snake && r % 2 === 1 ? [...order].reverse() : [...order]
    for (const teamId of sequence) {
      picks.push({ pickNumber, teamId, round: r + 1 })
      pickNumber += 1
    }
  }
  return picks
}
