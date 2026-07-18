/**
 * Match Center Engine — agrega dados das Engines para o pré-jogo.
 * Nenhuma simulação. Nenhuma mutação de temporada/placar.
 */

import {
  MATCH_CENTER_RECENT_GAMES,
  MATCH_CENTER_RIVALRY_CLASSIC,
} from '../../data/matchCenter'
import { getTeamById } from '../../data/teams'
import { getFatigueView } from '../fatigue/view.js'
import { getFranchiseObjective } from '../franchise/objective.js'
import { buildLineupFromDb } from '../match/lineups.js'
import { calcRivalryScore } from '../momentum/rivalry.js'
import { getSeasonView } from '../season/state.js'
import { estimateWinProbability } from './probability.js'
import { assignRefereeCrew } from './referees.js'

/**
 * Visão completa do Match Center.
 * @param {object} state — career state
 * @param {object} [opts]
 * @param {string} [opts.homeTeamId]
 * @param {string} [opts.awayTeamId]
 * @param {object} [opts.game] — slot de schedule
 */
export function getMatchCenterView(state = {}, opts = {}) {
  const season = state.season ?? null
  const gm = state.gm ?? null
  const week = state.currentWeek ?? season?.lastWeek ?? 1
  const teamId = state.currentTeamId ?? null

  const seasonView = season
    ? getSeasonView(season, { teamId, week })
    : null

  const next = seasonView?.nextGame ?? null
  const game = opts.game ?? next?.game ?? null

  const homeTeamId = opts.homeTeamId ?? game?.homeId ?? null
  const awayTeamId = opts.awayTeamId ?? game?.awayId ?? null

  if (!homeTeamId || !awayTeamId) {
    return {
      available: false,
      reason: 'no_matchup',
      message: 'Nenhuma partida agendada para o Match Center.',
      week,
      seasonNumber: seasonView?.seasonNumber ?? state.currentSeason ?? 1,
    }
  }

  const homeTeam = enrichTeam(getTeamById(homeTeamId))
  const awayTeam = enrichTeam(getTeamById(awayTeamId))
  const homeLineup = summarizeLineup(
    buildLineupFromDb(homeTeamId, { gm }),
  )
  const awayLineup = summarizeLineup(
    buildLineupFromDb(awayTeamId, { gm }),
  )

  const standings = season?.standings ?? {}
  const homeRecord = standingsRow(standings[homeTeamId], homeTeam)
  const awayRecord = standingsRow(standings[awayTeamId], awayTeam)

  const results = season?.results ?? []
  const homeForm = recentForm(results, homeTeamId, MATCH_CENTER_RECENT_GAMES)
  const awayForm = recentForm(results, awayTeamId, MATCH_CENTER_RECENT_GAMES)
  const h2h = headToHead(results, homeTeamId, awayTeamId, 5)

  const injuries = (season?.injuries ?? seasonView?.injuries ?? []).filter(
    (i) => i.teamId === homeTeamId || i.teamId === awayTeamId,
  )
  const homeInjuries = injuries.filter((i) => i.teamId === homeTeamId)
  const awayInjuries = injuries.filter((i) => i.teamId === awayTeamId)

  const fatigueView = getFatigueView(state)
  const careerOnHome = isCareerOnTeam(state, homeTeamId)
  const careerOnAway = isCareerOnTeam(state, awayTeamId)

  const homeCondition = buildCondition({
    lineup: homeLineup,
    injuries: homeInjuries,
    fatigueView: careerOnHome ? fatigueView : null,
  })
  const awayCondition = buildCondition({
    lineup: awayLineup,
    injuries: awayInjuries,
    fatigueView: careerOnAway ? fatigueView : null,
  })

  const rivalryScore = calcRivalryScore(homeTeamId, awayTeamId)
  const rivalry = {
    score: rivalryScore,
    label:
      rivalryScore >= MATCH_CENTER_RIVALRY_CLASSIC
        ? 'Rivalidade clássica'
        : rivalryScore >= 35
          ? 'Confronto de conferência'
          : 'Partida regular',
    isClassic: rivalryScore >= MATCH_CENTER_RIVALRY_CLASSIC,
  }

  const homeObjective = formatObjective(getFranchiseObjective(gm, homeTeamId))
  const awayObjective = formatObjective(getFranchiseObjective(gm, awayTeamId))

  const probability = estimateWinProbability({
    homeAvgOverall: homeLineup.avgOverall,
    awayAvgOverall: awayLineup.avgOverall,
    homeWinPct: homeRecord.winPct,
    awayWinPct: awayRecord.winPct,
    homeInjuryDrag: homeCondition.injuryDrag,
    awayInjuryDrag: awayCondition.injuryDrag,
    homeFatigueDrag: homeCondition.fatigueDrag,
    awayFatigueDrag: awayCondition.fatigueDrag,
  })

  const featured = {
    home: pickFeatured(homeLineup.starters, homeForm),
    away: pickFeatured(awayLineup.starters, awayForm),
  }

  const matchObjectives = buildMatchObjectives({
    homeObjective,
    awayObjective,
    rivalry,
    phase: next?.phase ?? seasonView?.phase ?? game?.phase,
    careerTeamId: teamId,
    homeTeamId,
    awayTeamId,
    probability,
  })

  const gameId = game?.id ?? `mc_${homeTeamId}_${awayTeamId}_w${week}`
  const referees = assignRefereeCrew(gameId)

  const playerIsHome = teamId === homeTeamId
  const playerIsAway = teamId === awayTeamId

  return {
    available: true,
    reason: null,
    message: null,
    week: next?.week ?? week,
    phase: next?.phase ?? seasonView?.phase ?? null,
    seasonNumber: seasonView?.seasonNumber ?? state.currentSeason ?? 1,
    label: game?.label ?? `${homeTeam.short} vs ${awayTeam.short}`,
    gameId,
    home: {
      team: homeTeam,
      record: homeRecord,
      lineup: homeLineup,
      form: homeForm,
      injuries: homeInjuries.map(slimInjury),
      condition: homeCondition,
      objective: homeObjective,
      featured: featured.home,
      isPlayerTeam: playerIsHome,
    },
    away: {
      team: awayTeam,
      record: awayRecord,
      lineup: awayLineup,
      form: awayForm,
      injuries: awayInjuries.map(slimInjury),
      condition: awayCondition,
      objective: awayObjective,
      featured: featured.away,
      isPlayerTeam: playerIsAway,
    },
    startersComparison: buildStartersComparison(homeLineup, awayLineup),
    headToHead: h2h,
    rivalry,
    probability,
    matchObjectives,
    referees,
    tipOff: '19:30',
    venue: {
      name: homeTeam.arena?.name ?? `${homeTeam.city} Arena`,
      city: homeTeam.arena?.city ?? homeTeam.city,
      homeCourt: true,
    },
  }
}

function enrichTeam(team) {
  if (!team) return null
  return {
    id: team.id,
    name: team.name,
    short: team.short,
    city: team.city,
    conference: team.conference,
    colors: team.colors ?? {
      primary: '#0c2340',
      secondary: '#ffffff',
      accent: '#2563eb',
    },
    logo: team.logo ?? `${team.id}-mark`,
    arena: team.arena ?? null,
  }
}

function summarizeLineup(lineup) {
  const players = (lineup?.players ?? []).map((p) => ({
    id: p.id,
    name: p.nome ?? p.name,
    position: p.posicao ?? p.position,
    overall: p.overall ?? 0,
    resistance: p.fisico?.resistencia ?? 50,
    teamId: lineup.teamId,
  }))
  const avgOverall = players.length
    ? Math.round(
        players.reduce((s, p) => s + p.overall, 0) / players.length,
      )
    : 0
  const avgResistance = players.length
    ? Math.round(
        players.reduce((s, p) => s + p.resistance, 0) / players.length,
      )
    : 50

  return {
    teamId: lineup?.teamId,
    teamShort: lineup?.teamShort,
    starters: players,
    avgOverall,
    avgResistance,
    chemistry: lineup?.chemistry ?? null,
    coachName: lineup?.coach?.name ?? lineup?.coach?.nome ?? null,
    styleId: lineup?.styleId ?? null,
  }
}

function standingsRow(row, team) {
  const wins = row?.wins ?? 0
  const losses = row?.losses ?? 0
  const games = wins + losses
  return {
    wins,
    losses,
    games,
    winPct: games > 0 ? wins / games : 0.5,
    streak: row?.streak ?? 0,
    streakLabel: row?.streakLabel ?? '—',
    pointsFor: row?.pointsFor ?? 0,
    pointsAgainst: row?.pointsAgainst ?? 0,
    short: row?.short ?? team?.short,
    name: row?.name ?? team?.name,
  }
}

function recentForm(results, teamId, limit) {
  const games = []
  for (let i = results.length - 1; i >= 0 && games.length < limit; i -= 1) {
    const r = results[i]
    if (r.homeId !== teamId && r.awayId !== teamId) continue
    const won = r.winnerId === teamId
    const opponentId = r.homeId === teamId ? r.awayId : r.homeId
    const opponentShort =
      r.homeId === teamId ? r.awayShort : r.homeShort
    const scoreFor = r.homeId === teamId ? r.homeScore : r.awayScore
    const scoreAgainst = r.homeId === teamId ? r.awayScore : r.homeScore
    games.push({
      gameId: r.gameId,
      week: r.week,
      result: won ? 'W' : 'L',
      opponentId,
      opponentShort: opponentShort ?? getTeamById(opponentId)?.short,
      scoreFor,
      scoreAgainst,
      label: `${won ? 'V' : 'D'} ${scoreFor}–${scoreAgainst} vs ${opponentShort ?? opponentId}`,
    })
  }
  return games
}

function headToHead(results, homeId, awayId, limit) {
  const games = []
  for (let i = results.length - 1; i >= 0 && games.length < limit; i -= 1) {
    const r = results[i]
    const pair =
      (r.homeId === homeId && r.awayId === awayId) ||
      (r.homeId === awayId && r.awayId === homeId)
    if (!pair) continue
    games.push({
      gameId: r.gameId,
      week: r.week,
      homeId: r.homeId,
      awayId: r.awayId,
      homeScore: r.homeScore,
      awayScore: r.awayScore,
      winnerId: r.winnerId,
      homeShort: r.homeShort,
      awayShort: r.awayShort,
    })
  }
  return games
}

function buildCondition({ lineup, injuries, fatigueView }) {
  const injuryCount = injuries?.length ?? 0
  const injuryDrag = Math.min(8, injuryCount * 2.2)
  let fatigueDrag = 0
  let fatigueLabel = 'Elenco fresco'
  let fatigueScore = lineup?.avgResistance ?? 50

  if (fatigueView?.composite != null) {
    const c = fatigueView.composite
    fatigueScore = Math.max(0, 100 - c)
    fatigueDrag = Math.min(6, c / 20)
    fatigueLabel =
      c >= 70 ? 'Carga alta' : c >= 45 ? 'Carga moderada' : 'Carga controlada'
  } else {
    fatigueLabel =
      fatigueScore >= 70
        ? 'Resistência alta'
        : fatigueScore >= 50
          ? 'Condição estável'
          : 'Elenco desgastado'
    fatigueDrag = Math.max(0, (55 - fatigueScore) / 12)
  }

  const score = Math.round(
    clampNumber(
      (lineup?.avgResistance ?? 50) * 0.55 +
        (100 - injuryDrag * 8) * 0.25 +
        fatigueScore * 0.2,
      0,
      100,
    ),
  )

  return {
    score,
    label:
      score >= 75
        ? 'Prontos'
        : score >= 55
          ? 'Regulares'
          : 'Desgastados',
    avgResistance: lineup?.avgResistance ?? 50,
    injuryCount,
    injuryDrag: Math.round(injuryDrag * 10) / 10,
    fatigueDrag: Math.round(fatigueDrag * 10) / 10,
    fatigueLabel,
  }
}

function pickFeatured(starters = [], form = []) {
  if (!starters.length) return null
  const sorted = [...starters].sort((a, b) => b.overall - a.overall)
  const top = sorted[0]
  return {
    id: top.id,
    name: top.name,
    position: top.position,
    overall: top.overall,
    note:
      form[0]?.result === 'W'
        ? 'Chega aquecido após vitória recente'
        : 'Melhor overall entre os titulares',
  }
}

function buildStartersComparison(homeLineup, awayLineup) {
  const positions = ['PG', 'SG', 'SF', 'PF', 'C']
  return positions.map((pos) => {
    const home =
      homeLineup.starters.find((p) => p.position === pos) ??
      homeLineup.starters[positions.indexOf(pos)] ??
      null
    const away =
      awayLineup.starters.find((p) => p.position === pos) ??
      awayLineup.starters[positions.indexOf(pos)] ??
      null
    const edge =
      !home || !away
        ? 'even'
        : home.overall > away.overall + 1
          ? 'home'
          : away.overall > home.overall + 1
            ? 'away'
            : 'even'
    return { position: pos, home, away, edge }
  })
}

function buildMatchObjectives({
  homeObjective,
  awayObjective,
  rivalry,
  phase,
  careerTeamId,
  homeTeamId,
  awayTeamId,
  probability,
}) {
  const list = []
  if (rivalry.isClassic) {
    list.push({
      id: 'rivalry',
      title: 'Vencer a rivalidade',
      detail: 'Confronto marcado — intensidade emocional elevada.',
    })
  }
  if (phase && phase !== 'regular') {
    list.push({
      id: 'phase',
      title: `Competir na fase ${phase}`,
      detail: 'Cada posse pesa mais fora da temporada regular.',
    })
  }
  const playerSide =
    careerTeamId === homeTeamId
      ? homeObjective
      : careerTeamId === awayTeamId
        ? awayObjective
        : null
  if (playerSide) {
    list.push({
      id: 'franchise',
      title: `Objetivo da franquia: ${playerSide.label}`,
      detail: playerSide.reason ?? 'Alinhe o desempenho ao plano do time.',
    })
  }
  const fav =
    probability.homeWinPct >= probability.awayWinPct ? 'home' : 'away'
  list.push({
    id: 'cover',
    title:
      fav === 'home'
        ? 'Confirmar o favoritismo em casa'
        : 'Buscar o upset como visitante',
    detail: `Modelo pré-jogo: ${probability.homeWinPct}%–${probability.awayWinPct}%.`,
  })
  list.push({
    id: 'health',
    title: 'Gerir carga e lesões',
    detail: 'Manter o elenco disponível sem forçar minutos excessivos.',
  })
  return list.slice(0, 5)
}

function formatObjective(obj) {
  if (!obj) return null
  return {
    id: obj.objectiveId ?? obj.id ?? null,
    label: obj.label ?? obj.objectiveId ?? '—',
    reason: obj.reason ?? obj.description ?? null,
  }
}

function slimInjury(i) {
  return {
    id: i.id,
    playerId: i.playerId,
    playerName: i.playerName,
    teamId: i.teamId,
    teamShort: i.teamShort,
    label: i.label,
    severity: i.severity,
    weeksRemaining: i.weeksRemaining,
  }
}

function isCareerOnTeam(state, teamId) {
  if (!teamId) return false
  if (state.currentTeamId === teamId) return true
  const pid = state.player?.id
  if (!pid || !state.gm?.rosters?.[teamId]) return false
  return (state.gm.rosters[teamId] ?? []).includes(pid)
}

function clampNumber(n, min, max) {
  return Math.max(min, Math.min(max, n))
}
