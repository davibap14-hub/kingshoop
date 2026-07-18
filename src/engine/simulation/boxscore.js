import { MVP_WEIGHTS } from '../../data/match/constants'

export function createPlayerLine(player) {
  return {
    id: player.id,
    nome: player.nome,
    posicao: player.posicao,
    overall: player.overall,
    points: 0,
    rebounds: 0,
    orb: 0,
    drb: 0,
    assists: 0,
    steals: 0,
    blocks: 0,
    turnovers: 0,
    fouls: 0,
    fgMade: 0,
    fgAtt: 0,
    threeMade: 0,
    threeAtt: 0,
    ftMade: 0,
    ftAtt: 0,
  }
}

export function createTeamBox(teamMeta, players) {
  return {
    teamId: teamMeta.id,
    teamName: teamMeta.name,
    teamShort: teamMeta.short,
    players: players.map(createPlayerLine),
    totals: {
      points: 0,
      rebounds: 0,
      orb: 0,
      drb: 0,
      assists: 0,
      steals: 0,
      blocks: 0,
      turnovers: 0,
      fouls: 0,
      fgMade: 0,
      fgAtt: 0,
      threeMade: 0,
      threeAtt: 0,
      ftMade: 0,
      ftAtt: 0,
    },
  }
}

function findLine(box, playerId) {
  return box.players.find((p) => p.id === playerId)
}

function bump(box, playerId, field, amount = 1) {
  const line = findLine(box, playerId)
  if (!line) return
  line[field] += amount
  if (field in box.totals) box.totals[field] += amount
}

export function applyPossessionToBox(offenseBox, defenseBox, result) {
  if (result.missedById) {
    bump(offenseBox, result.missedById, 'fgAtt')
    if (result.isThree) bump(offenseBox, result.missedById, 'threeAtt')
  }

  if (result.points > 0 && result.scorerId) {
    bump(offenseBox, result.scorerId, 'points', result.points)
    if (result.outcome === 'make2') {
      bump(offenseBox, result.scorerId, 'fgMade')
      bump(offenseBox, result.scorerId, 'fgAtt')
    } else if (result.outcome === 'make3') {
      bump(offenseBox, result.scorerId, 'fgMade')
      bump(offenseBox, result.scorerId, 'fgAtt')
      bump(offenseBox, result.scorerId, 'threeMade')
      bump(offenseBox, result.scorerId, 'threeAtt')
    } else if (result.outcome === 'shooting_foul') {
      const attempts = result.isThree ? 3 : 2
      const line = findLine(offenseBox, result.scorerId)
      if (line) {
        line.ftAtt += attempts
        line.ftMade += result.points
      }
    }
  }

  if (result.assisterId) bump(offenseBox, result.assisterId, 'assists')
  if (result.rebounderId) {
    const onOffense = offenseBox.players.some((p) => p.id === result.rebounderId)
    const box = onOffense ? offenseBox : defenseBox
    bump(box, result.rebounderId, 'rebounds')
    bump(box, result.rebounderId, onOffense ? 'orb' : 'drb')
  }
  if (result.stealerId) bump(defenseBox, result.stealerId, 'steals')
  if (result.blockerId) bump(defenseBox, result.blockerId, 'blocks')
  if (result.turnoversById) bump(offenseBox, result.turnoversById, 'turnovers')
  if (result.foulerId) bump(defenseBox, result.foulerId, 'fouls')
}

export function recomputeTotals(box) {
  const sum = (key) => box.players.reduce((s, p) => s + (p[key] ?? 0), 0)
  box.totals = {
    points: sum('points'),
    rebounds: sum('rebounds'),
    orb: sum('orb'),
    drb: sum('drb'),
    assists: sum('assists'),
    steals: sum('steals'),
    blocks: sum('blocks'),
    turnovers: sum('turnovers'),
    fouls: sum('fouls'),
    fgMade: sum('fgMade'),
    fgAtt: sum('fgAtt'),
    threeMade: sum('threeMade'),
    threeAtt: sum('threeAtt'),
    ftMade: sum('ftMade'),
    ftAtt: sum('ftAtt'),
  }
}

export function computeMvp(homeBox, awayBox) {
  const all = [
    ...homeBox.players.map((p) => ({
      ...p,
      teamId: homeBox.teamId,
      teamShort: homeBox.teamShort,
    })),
    ...awayBox.players.map((p) => ({
      ...p,
      teamId: awayBox.teamId,
      teamShort: awayBox.teamShort,
    })),
  ]

  let best = null
  let bestScore = -Infinity

  for (const p of all) {
    const score =
      p.points * MVP_WEIGHTS.points +
      p.rebounds * MVP_WEIGHTS.rebounds +
      p.assists * MVP_WEIGHTS.assists +
      p.steals * MVP_WEIGHTS.steals +
      p.blocks * MVP_WEIGHTS.blocks +
      p.turnovers * MVP_WEIGHTS.turnovers +
      p.fouls * MVP_WEIGHTS.fouls

    if (score > bestScore) {
      bestScore = score
      best = p
    }
  }

  if (!best) return null

  return {
    id: best.id,
    nome: best.nome,
    teamId: best.teamId,
    teamShort: best.teamShort,
    points: best.points,
    rebounds: best.rebounds,
    assists: best.assists,
    steals: best.steals,
    blocks: best.blocks,
    turnovers: best.turnovers,
    fouls: best.fouls,
    score: Math.round(bestScore * 10) / 10,
  }
}
