import { secretCards } from '../data/cards'
import { players } from '../data/players'

const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C']

function pickByPosition(pool, position) {
  const candidates = pool.filter((p) => p.position === position)
  if (!candidates.length) return null
  return candidates[Math.floor(Math.random() * candidates.length)]
}

function buildLineup(pool) {
  const lineup = {}
  let remaining = [...pool]

  for (const pos of POSITIONS) {
    const player = pickByPosition(remaining, pos)
    lineup[pos] = player
    if (player) {
      remaining = remaining.filter((p) => p.id !== player.id)
    }
  }

  return { lineup, remaining }
}

/**
 * Draft automático: starting five casa/fora + presidente + carta secreta.
 */
export function performAutoDraft() {
  const athletes = players.filter((p) => !p.isPresident)
  const presidents = players.filter((p) => p.isPresident)

  const { lineup: homeLineup, remaining } = buildLineup(athletes)
  const { lineup: awayLineup } = buildLineup(remaining)

  const homePresident =
    presidents[Math.floor(Math.random() * presidents.length)] ?? null

  const selectedCard =
    secretCards[Math.floor(Math.random() * secretCards.length)] ?? null

  return { homeLineup, awayLineup, homePresident, selectedCard }
}

export { POSITIONS }
