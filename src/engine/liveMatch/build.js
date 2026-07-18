/**
 * Live Match Engine — monta frames de reprodução a partir do PBP.
 * NUNCA chama simulateGame. NUNCA altera o resultado.
 */

import {
  LIVE_BASE_DURATION_MS,
  LIVE_PLAYBACK_SPEEDS,
  LIVE_PLAY_FEED_WINDOW,
} from '../../data/liveMatch'
import { freezeMatch } from '../presentation/freeze.js'
import { updateDisplayMomentum } from './momentum.js'
import {
  extractPlayActors,
  normalizePbpEvent,
  timeoutSide,
} from './parse.js'
import { liveWinProbability } from './probability.js'

/**
 * Constrói o feed completo da partida ao vivo.
 * @param {object} matchResult — retorno da Simulation Engine
 * @param {object} [opts]
 */
export function buildLiveMatchFeed(matchResult, opts = {}) {
  if (!matchResult) {
    return { ok: false, error: 'match_required', feed: null }
  }

  const match = freezeMatch(matchResult)
  const homeShort = match.placarFinal?.homeTeam?.short ?? 'HOME'
  const awayShort = match.placarFinal?.awayTeam?.short ?? 'AWAY'
  const speedId = opts.speed ?? 'normal'
  const speed = LIVE_PLAYBACK_SPEEDS[speedId] ?? LIVE_PLAYBACK_SPEEDS.normal

  const rawEvents = match.playByPlay ?? []
  const events = rawEvents
    .map((e, i) => normalizePbpEvent(e, i))
    .filter(Boolean)

  const teamStats = {
    home: emptyTeamStats(),
    away: emptyTeamStats(),
  }

  let momentum = { home: 50, away: 50, lastHomeScore: 0, lastAwayScore: 0 }
  let prevScore = { home: 0, away: 0 }
  const frames = []
  const playLog = []

  // Tip-off
  frames.push({
    index: 0,
    kind: 'tipoff',
    durationMs: scaleDuration(LIVE_BASE_DURATION_MS.tipoff, speed),
    animation: 'tipoff_fade',
    quarter: 1,
    clock: 'Q1',
    score: { home: 0, away: 0 },
    play: {
      text: `${homeShort} x ${awayShort} — bola ao alto.`,
      actionLabel: 'Início',
      scorer: null,
      assister: null,
      fouler: null,
      isTimeout: false,
      isFoul: false,
      isScoring: false,
      points: 0,
    },
    sequence: [],
    timeouts: { home: 0, away: 0 },
    fouls: { home: 0, away: 0 },
    teamStats: cloneStats(teamStats),
    momentum: { home: 50, away: 50, leader: 'even' },
    winProbability: { homeWinPct: 52, awayWinPct: 48 },
    progress: 0,
  })

  for (let i = 0; i < events.length; i += 1) {
    const event = events[i]
    const actors = extractPlayActors(event)
    const scoredHome = (event.score.home ?? 0) > prevScore.home
    const offenseIsHome =
      event.offense === homeShort ||
      (actors.isScoring && scoredHome) ||
      (event.offense == null && !actors.isScoring && !scoredHome
        ? false
        : event.offense === homeShort)

    if (actors.isTimeout) {
      const side = timeoutSide(event, homeShort, awayShort)
      if (side === 'home') teamStats.home.timeouts += 1
      else if (side === 'away') teamStats.away.timeouts += 1
    }

    if (actors.isFoul) {
      // falta atribuída à defesa quando possível
      if (offenseIsHome) teamStats.away.fouls += 1
      else teamStats.home.fouls += 1
    }

    if (actors.isScoring) {
      const side = offenseIsHome ? 'home' : 'away'
      teamStats[side].points = event.score?.[side] ?? teamStats[side].points
      if (actors.assister) teamStats[side].assists += 1
      teamStats[side].fieldGoals += 1
      if (event.points === 3) teamStats[side].threes += 1
    }

    // sincroniza placar absoluto do PBP
    teamStats.home.points = event.score.home
    teamStats.away.points = event.score.away

    momentum = updateDisplayMomentum(momentum, event, homeShort)
    const winProbability = liveWinProbability(
      event.score.home,
      event.score.away,
      event.quarter,
    )

    const playEntry = {
      id: event.id,
      seq: event.seq,
      text: event.text,
      actionLabel: event.actionLabel,
      points: event.points,
      quarter: event.quarter,
      score: { ...event.score },
      scorer: actors.scorer,
      assister: actors.assister,
      isTimeout: actors.isTimeout,
      isFoul: actors.isFoul,
    }
    playLog.push(playEntry)

    const kind = actors.isTimeout
      ? 'timeout'
      : actors.isScoring
        ? 'scoring'
        : actors.isFoul
          ? 'foul'
          : /roubo|toco|turnover|perda/i.test(event.text)
            ? 'defensive'
            : 'possession'

    frames.push({
      index: frames.length,
      kind,
      durationMs: scaleDuration(
        LIVE_BASE_DURATION_MS[kind] ?? LIVE_BASE_DURATION_MS.possession,
        speed,
      ),
      animation: animationForKind(kind, event),
      quarter: event.quarter,
      clock: event.clock,
      score: { ...event.score },
      play: {
        text: event.text,
        actionLabel: event.actionLabel,
        action: event.action,
        scorer: actors.scorer,
        assister: actors.assister,
        fouler: actors.fouler,
        isTimeout: actors.isTimeout,
        isFoul: actors.isFoul,
        isScoring: actors.isScoring,
        points: event.points,
        offense: event.offense,
        defense: event.defense,
        eventId: event.id,
        seq: event.seq,
      },
      sequence: playLog.slice(-LIVE_PLAY_FEED_WINDOW),
      timeouts: {
        home: teamStats.home.timeouts,
        away: teamStats.away.timeouts,
      },
      fouls: {
        home: teamStats.home.fouls,
        away: teamStats.away.fouls,
      },
      teamStats: cloneStats(teamStats),
      momentum: {
        home: momentum.home,
        away: momentum.away,
        leader: momentum.leader,
      },
      winProbability,
      progress: Math.round(((i + 1) / events.length) * 100),
    })

    prevScore = { ...event.score }
  }

  // Frame final
  const last = frames[frames.length - 1]
  frames.push({
    index: frames.length,
    kind: 'final',
    durationMs: scaleDuration(LIVE_BASE_DURATION_MS.final, speed),
    animation: 'final_horn',
    quarter: last?.quarter ?? 4,
    clock: 'FIM',
    score: {
      home: match.homeScore,
      away: match.awayScore,
    },
    play: {
      text: match.summary ?? 'Fim de jogo.',
      actionLabel: 'Final',
      scorer: match.mvp?.nome ?? null,
      assister: null,
      fouler: null,
      isTimeout: false,
      isFoul: false,
      isScoring: false,
      points: 0,
    },
    sequence: playLog.slice(-LIVE_PLAY_FEED_WINDOW),
    timeouts: last?.timeouts ?? { home: 0, away: 0 },
    fouls: last?.fouls ?? { home: 0, away: 0 },
    teamStats: last?.teamStats ?? cloneStats(teamStats),
    momentum: last?.momentum ?? { home: 50, away: 50, leader: 'even' },
    winProbability: {
      homeWinPct: match.homeScore >= match.awayScore ? 100 : 0,
      awayWinPct: match.awayScore > match.homeScore ? 100 : 0,
    },
    progress: 100,
    mvp: match.mvp
      ? {
          name: match.mvp.nome,
          teamShort: match.mvp.teamShort,
          points: match.mvp.points,
          rebounds: match.mvp.rebounds,
          assists: match.mvp.assists,
        }
      : null,
  })

  return {
    ok: true,
    error: null,
    feed: {
      teams: {
        home: {
          id: match.placarFinal?.homeTeam?.id,
          short: homeShort,
          name: match.placarFinal?.homeTeam?.name,
          colors: match.placarFinal?.homeTeam?.colors ?? null,
        },
        away: {
          id: match.placarFinal?.awayTeam?.id,
          short: awayShort,
          name: match.placarFinal?.awayTeam?.name,
          colors: match.placarFinal?.awayTeam?.colors ?? null,
        },
      },
      finalScore: { home: match.homeScore, away: match.awayScore },
      summary: match.summary,
      overtime: Boolean(match.overtime),
      possessionCount: match.possessionCount ?? events.length,
      eventCount: events.length,
      frameCount: frames.length,
      speed: speedId,
      frames,
      sourceMomentum: match.momentum ?? null,
    },
  }
}

/**
 * Frame atual (puro).
 */
export function getLiveMatchFrame(feed, index = 0) {
  if (!feed?.frames?.length) return null
  const i = Math.max(0, Math.min(index, feed.frames.length - 1))
  return feed.frames[i]
}

export function rescaleLiveFeedSpeed(feed, speedId = 'normal') {
  if (!feed?.frames) return feed
  const speed = LIVE_PLAYBACK_SPEEDS[speedId] ?? LIVE_PLAYBACK_SPEEDS.normal
  return {
    ...feed,
    speed: speedId,
    frames: feed.frames.map((f) => ({
      ...f,
      durationMs: scaleDuration(
        LIVE_BASE_DURATION_MS[f.kind] ?? LIVE_BASE_DURATION_MS.possession,
        speed,
      ),
    })),
  }
}

function emptyTeamStats() {
  return {
    points: 0,
    assists: 0,
    fouls: 0,
    timeouts: 0,
    fieldGoals: 0,
    threes: 0,
  }
}

function cloneStats(stats) {
  return {
    home: { ...stats.home },
    away: { ...stats.away },
  }
}

function scaleDuration(base, speed) {
  if (!speed || speed.factor === 0) return 0
  return Math.max(120, Math.round(base * speed.factor))
}

function animationForKind(kind, event) {
  if (kind === 'timeout') return 'timeout_break'
  if (kind === 'scoring') {
    return (event.points ?? 0) === 3 ? 'three_flash' : 'score_pulse'
  }
  if (kind === 'foul') return 'crowd_gasp'
  if (kind === 'defensive') return 'steal_swipe'
  return 'possession_fade'
}
