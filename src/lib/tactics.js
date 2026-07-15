/**
 * Táticas e química — adaptado do motor Pick Five (4-0-court)
 * para o modelo de jogadores do KingsHoop (attack/defense/overall/archetype).
 */

const SLOTS = ['PG', 'SG', 'SF', 'PF', 'C']

const FORMATION_WEIGHTS = {
  Equilibrada: {
    PG: { o: 1.0, d: 1.0 },
    SG: { o: 1.0, d: 0.95 },
    SF: { o: 0.98, d: 1.0 },
    PF: { o: 0.94, d: 1.12 },
    C: { o: 0.9, d: 1.18 },
  },
  'Pace & Space': {
    PG: { o: 1.18, d: 0.92 },
    SG: { o: 1.16, d: 0.88 },
    SF: { o: 1.12, d: 0.92 },
    PF: { o: 1.04, d: 0.82 },
    C: { o: 0.78, d: 0.8 },
  },
  'Post Up': {
    PG: { o: 0.82, d: 0.88 },
    SG: { o: 0.88, d: 0.9 },
    SF: { o: 0.92, d: 0.94 },
    PF: { o: 1.08, d: 1.2 },
    C: { o: 1.1, d: 1.26 },
  },
  'Full Court Press': {
    PG: { o: 0.94, d: 1.14 },
    SG: { o: 0.96, d: 1.12 },
    SF: { o: 0.98, d: 1.12 },
    PF: { o: 0.92, d: 1.08 },
    C: { o: 0.88, d: 1.1 },
  },
}

const STYLE_MODS = {
  'Run & Gun': { offense: 8, defense: -5, pace: 1.4, threeRate: 0.08 },
  'Meia Quadra': { offense: 0, defense: 2, pace: -0.4, threeRate: 0 },
  'Defesa First': { offense: -5, defense: 10, pace: -1.0, threeRate: -0.05 },
  'Iso Star': { offense: 10, defense: -6, pace: 0.6, threeRate: 0.04 },
}

const FORMATION_STYLE_SYNERGY = {
  Equilibrada: {
    'Run & Gun': { offense: 1, defense: -1, pace: 0.3, synergy: 'ok' },
    'Meia Quadra': { offense: 1, defense: 1, pace: 0, synergy: 'ideal' },
    'Defesa First': { offense: -1, defense: 3, pace: -0.4, synergy: 'good' },
    'Iso Star': { offense: 2, defense: -2, pace: 0.2, synergy: 'ok' },
  },
  'Pace & Space': {
    'Run & Gun': { offense: 4, defense: -2, pace: 1, synergy: 'ideal' },
    'Meia Quadra': { offense: 1, defense: 0, pace: 0.2, synergy: 'good' },
    'Defesa First': { offense: -3, defense: 1, pace: -0.6, synergy: 'conflict' },
    'Iso Star': { offense: 2, defense: -2, pace: 0.4, synergy: 'good' },
  },
  'Post Up': {
    'Run & Gun': { offense: 0, defense: -3, pace: 0.2, synergy: 'conflict' },
    'Meia Quadra': { offense: 2, defense: 2, pace: -0.4, synergy: 'ideal' },
    'Defesa First': { offense: -1, defense: 4, pace: -0.8, synergy: 'good' },
    'Iso Star': { offense: 3, defense: -2, pace: 0.1, synergy: 'ok' },
  },
  'Full Court Press': {
    'Run & Gun': { offense: 1, defense: 1, pace: 0.6, synergy: 'good' },
    'Meia Quadra': { offense: -1, defense: 2, pace: -0.3, synergy: 'ok' },
    'Defesa First': { offense: -2, defense: 5, pace: -0.5, synergy: 'ideal' },
    'Iso Star': { offense: 1, defense: -1, pace: 0.2, synergy: 'conflict' },
  },
}

const PERIMETER_ARCHETYPES = new Set([
  'Chutador de Elite',
  'Showtime',
  'Pontuador',
  'Criador de Jogadas',
])
const PAINT_ARCHETYPES = new Set(['Dominador', 'Paredão'])
const DEF_ARCHETYPES = new Set(['Paredão'])
const FACILITATOR_ARCHETYPES = new Set(['Criador de Jogadas'])

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

function avg(values) {
  if (!values.length) return 0
  return values.reduce((s, v) => s + v, 0) / values.length
}

function lineupList(lineupByPos) {
  return SLOTS.map((s) => lineupByPos?.[s]).filter(Boolean)
}

/** Fit formação × perfil do quinteto (versão KingsHoop). */
export function getFormationFit(lineupByPos, formation) {
  const filled = lineupList(lineupByPos)
  if (filled.length < 5) {
    return { offense: 0, defense: 0, pace: 0, fit: null }
  }

  const pg = lineupByPos.PG
  const sg = lineupByPos.SG
  const sf = lineupByPos.SF
  const pf = lineupByPos.PF
  const c = lineupByPos.C

  let offense = 0
  let defense = 0
  let pace = 0
  let fit = 72

  switch (formation) {
    case 'Pace & Space': {
      offense += 2
      defense -= 1
      pace += 1
      const perimeter = [pg, sg, sf].filter(
        (p) => p && (p.attack >= 90 || PERIMETER_ARCHETYPES.has(p.archetype)),
      ).length
      if (perimeter >= 2) {
        offense += 3
        fit += 12
      }
      if (c && c.defense >= 90 && PAINT_ARCHETYPES.has(c.archetype)) {
        pace -= 0.5
        fit -= 8
      } else if (c) {
        fit += 6
      }
      break
    }
    case 'Post Up': {
      defense += 1
      pace -= 0.5
      if (pf && c && pf.overall >= 90 && c.overall >= 90) {
        defense += 3
        offense += 2
        fit += 14
      } else if (pf && c) {
        fit += 4
      } else {
        fit -= 10
      }
      if (avg([pg, sg].filter(Boolean).map((p) => p.attack)) >= 92) {
        offense += 1
        fit += 4
      }
      break
    }
    case 'Full Court Press': {
      defense += 2
      pace += 0.5
      const stoppers = filled.filter(
        (p) => p.defense >= 92 || DEF_ARCHETYPES.has(p.archetype),
      ).length
      defense += Math.min(4, stoppers)
      fit += stoppers * 3
      if (stoppers < 2) {
        defense -= 2
        fit -= 10
      }
      break
    }
    default: {
      // Equilibrada
      if (c && c.defense >= 88) {
        defense += 2
        fit += 6
      }
      if (avg([pg, sg].filter(Boolean).map((p) => p.overall)) >= 90) {
        offense += 2
        fit += 5
      }
      break
    }
  }

  return {
    offense: Math.round(offense * 10) / 10,
    defense: Math.round(defense * 10) / 10,
    pace: Math.round(pace * 10) / 10,
    fit: clamp(Math.round(fit), 0, 100),
  }
}

export function computeLineupChemistry(lineupByPos, formation, playstyle) {
  const lineup = lineupList(lineupByPos)
  if (!lineup.length) {
    return { score: 50, multiplier: 1, label: 'ok' }
  }

  let score = 55
  const archetypes = lineup.map((p) => p.archetype)
  const uniqueRoles = new Set(archetypes).size

  if (uniqueRoles >= 4) score += 8
  else if (uniqueRoles <= 2) score -= 6

  const facilitators = lineup.filter((p) =>
    FACILITATOR_ARCHETYPES.has(p.archetype),
  ).length
  const scorers = lineup.filter(
    (p) => p.attack >= 94 || p.archetype === 'Dominador' || p.archetype === 'Pontuador',
  ).length
  if (facilitators >= 1 && scorers >= 2) score += 6
  if (scorers >= 4) score -= 7

  const defAvg = avg(lineup.map((p) => p.defense))
  if (defAvg >= 90) score += 6
  else if (defAvg < 78) score -= 5

  const synergy =
    FORMATION_STYLE_SYNERGY[formation]?.[playstyle]?.synergy ?? 'ok'
  if (synergy === 'ideal') score += 7
  else if (synergy === 'good') score += 3
  else if (synergy === 'conflict') score -= 8

  const fit = getFormationFit(lineupByPos, formation).fit
  if (fit != null) score += (fit - 72) * 0.25

  score = clamp(Math.round(score), 20, 96)
  const multiplier = clamp(0.88 + (score - 50) * 0.0048, 0.88, 1.12)

  return {
    score,
    multiplier: Math.round(multiplier * 1000) / 1000,
    label: score >= 80 ? 'elite' : score >= 65 ? 'good' : score >= 45 ? 'ok' : 'strained',
  }
}

/**
 * Ratings efetivos do time (ataque/defesa/pace/taxa de 3) com táticas aplicadas.
 * @param {object} lineupByPos
 * @param {string[]} activePositions — posições em quadra (escalada/caos)
 * @param {string} formation
 * @param {string} playstyle
 * @param {{ boostPositions?: Set<string> }} [opts]
 */
export function computeTeamRatings(
  lineupByPos,
  activePositions,
  formation,
  playstyle,
  opts = {},
) {
  const positions = activePositions?.length ? activePositions : SLOTS
  const weights = FORMATION_WEIGHTS[formation] ?? FORMATION_WEIGHTS.Equilibrada
  const baseStyle = STYLE_MODS[playstyle] ?? STYLE_MODS['Meia Quadra']
  const synergy = FORMATION_STYLE_SYNERGY[formation]?.[playstyle] ?? {
    offense: 0,
    defense: 0,
    pace: 0,
    synergy: 'ok',
  }
  const formationFit = getFormationFit(lineupByPos, formation)
  const chemistry = computeLineupChemistry(lineupByPos, formation, playstyle)

  let offSum = 0
  let offW = 0
  let defSum = 0
  let defW = 0
  let count = 0

  for (const pos of positions) {
    const player = lineupByPos?.[pos]
    if (!player) continue
    const w = weights[pos] ?? { o: 1, d: 1 }
    let atk = player.attack
    let def = player.defense
    if (opts.boostPositions?.has(pos)) {
      atk += 10
      def += 10
    }
    offSum += atk * w.o
    offW += w.o
    defSum += def * w.d
    defW += w.d
    count += 1
  }

  if (count === 0) {
    return {
      attack: 50,
      defense: 50,
      pace: 0,
      threeRate: 0.35,
      chemistry: chemistry.score,
      fit: formationFit.fit,
    }
  }

  let attack = offSum / offW
  let defense = defSum / defW

  attack += baseStyle.offense + synergy.offense + (formationFit.offense || 0)
  defense += baseStyle.defense + synergy.defense + (formationFit.defense || 0)

  attack *= chemistry.multiplier
  defense *= chemistry.multiplier

  // Fit fraco pune um pouco o overall tático
  if (formationFit.fit != null && formationFit.fit < 60) {
    const penalty = 1 - (60 - formationFit.fit) * 0.004
    attack *= penalty
    defense *= penalty
  }

  const pace =
    (baseStyle.pace || 0) + (synergy.pace || 0) + (formationFit.pace || 0)
  const threeRate = clamp(0.35 + (baseStyle.threeRate || 0), 0.2, 0.5)

  return {
    attack: Math.round(attack * 10) / 10,
    defense: Math.round(defense * 10) / 10,
    pace: Math.round(pace * 10) / 10,
    threeRate,
    chemistry: chemistry.score,
    fit: formationFit.fit,
  }
}

/** Métricas da sidebar — elenco completo + táticas. */
export function computeDisplayMetrics(lineupByPos, formation, playstyle) {
  if (!lineupByPos) return { att: 0, def: 0, ovr: 0, chem: 0 }
  const ratings = computeTeamRatings(lineupByPos, SLOTS, formation, playstyle)
  const players = lineupList(lineupByPos)
  const ovr = players.length
    ? Math.round(avg(players.map((p) => p.overall)))
    : 0
  return {
    att: Math.round(ratings.attack),
    def: Math.round(ratings.defense),
    ovr,
    chem: ratings.chemistry,
  }
}
