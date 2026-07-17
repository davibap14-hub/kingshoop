/**
 * Motor de partida — posse, box score, tip-off.
 * Placeholder para simulação 1x1 / 5v5 futura.
 */

export function createEmptyBoxScore() {
  return {
    points: 0,
    rebounds: 0,
    assists: 0,
    steals: 0,
    blocks: 0,
    turnovers: 0,
    fgMade: 0,
    fgAtt: 0,
    threeMade: 0,
    threeAtt: 0,
  }
}

/**
 * Simula placar simplificado a partir de overalls.
 * @returns {{ homeScore: number, awayScore: number, summary: string }}
 */
export function simulateMatch({ homeOvr, awayOvr, rng = Math.random }) {
  const homeEdge = (homeOvr - awayOvr) * 0.35
  const homeScore = Math.round(95 + homeEdge + rng() * 25)
  const awayScore = Math.round(95 - homeEdge + rng() * 25)

  return {
    homeScore,
    awayScore,
    summary:
      homeScore === awayScore
        ? 'Empate na regulação.'
        : homeScore > awayScore
          ? 'Vitória em casa.'
          : 'Derrota em casa.',
  }
}
