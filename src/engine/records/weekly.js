/**
 * Records Engine — pipeline semanal.
 *
 * Controla recordes da liga (NBA) e de franquia.
 * Ao quebrar: History · News · Achievements · Legacy.
 */

import { MAX_RECORD_BREAKS_PER_WEEK } from '../../data/records'
import { createEmptyTrackers, hydrateRecordsState } from './state.js'
import {
  accumulateSeasonTrackers,
  extractCareerCandidates,
  extractGameCandidates,
  extractSeasonCandidates,
  extractStreakCandidates,
} from './extract.js'
import { countRecordsHeld, evaluateRecordBreaks } from './evaluate.js'
import { buildRecordDecisions, syncRecordsToHistory } from './sync.js'

/**
 * Processa a semana: extrai candidatos, avalia quebras, sincroniza History.
 */
export function processWeeklyRecords({
  records = null,
  leagueHistory = null,
  weekResults = [],
  standings = null,
  previousSeason = null,
  seasonRolled = false,
  analytics = null,
  seasonNumber = 1,
  week = 1,
  playerTeamId = null,
  careerPlayerId = null,
  careerPlayerName = null,
} = {}) {
  let state = hydrateRecordsState(records, leagueHistory)
  const messages = []
  const allBroken = []

  const priorTrackers = state.trackers
  const priorSeasonNumber =
    previousSeason?.seasonNumber ??
    (seasonRolled ? seasonNumber - 1 : seasonNumber)

  // No roll: fecha recordes de temporada com trackers + standings da temporada anterior
  if (
    seasonRolled &&
    priorTrackers?.seasonPlayers &&
    Object.keys(priorTrackers.seasonPlayers).length > 0
  ) {
    const seasonCands = extractSeasonCandidates({
      trackers: priorTrackers,
      standings: previousSeason?.standings ?? null,
      season: priorSeasonNumber,
      week: previousSeason?.currentWeek ?? week,
      seasonLabel: priorSeasonNumber,
    })
    const evalPrev = evaluateRecordBreaks(state, seasonCands)
    state = evalPrev.records
    allBroken.push(...(evalPrev.brokenAll ?? evalPrev.broken))
    state = {
      ...state,
      trackers: createEmptyTrackers(seasonNumber),
    }
  } else if (
    state.trackers?.seasonNumber != null &&
    state.trackers.seasonNumber !== seasonNumber
  ) {
    state = {
      ...state,
      trackers: createEmptyTrackers(seasonNumber),
    }
  }

  const trackers = accumulateSeasonTrackers(
    state.trackers,
    weekResults,
    seasonNumber,
  )
  state = { ...state, trackers }

  const candidates = [
    ...extractGameCandidates(weekResults, seasonNumber, week),
    ...extractSeasonCandidates({
      trackers,
      standings: standings ?? null,
      season: seasonNumber,
      week,
    }),
    ...extractStreakCandidates(standings ?? {}, seasonNumber, week),
    ...extractCareerCandidates({
      leagueHistory,
      analytics,
      season: seasonNumber,
      week,
    }),
  ]

  const evaluated = evaluateRecordBreaks(state, candidates)
  state = evaluated.records
  allBroken.push(...(evaluated.brokenAll ?? evaluated.broken))

  // Dedup por scope+bucket+key+value+holder (mesma quebra nos dois passes)
  const uniqueBroken = dedupeBroken(allBroken)
  uniqueBroken.sort((a, b) => {
    if (a.scope !== b.scope) return a.scope === 'league' ? -1 : 1
    return (b.value ?? 0) - (a.value ?? 0)
  })
  const announced = uniqueBroken.slice(0, MAX_RECORD_BREAKS_PER_WEEK)

  let careerBreaks = state.careerBreaks ?? 0
  for (const b of uniqueBroken) {
    if (
      careerPlayerId &&
      (b.holderId === careerPlayerId || b.holderName === careerPlayerName)
    ) {
      careerBreaks += 1
    }
  }

  state = {
    ...state,
    brokenThisWeek: announced,
    careerBreaks,
    lastEvaluated: { season: seasonNumber, week },
  }

  for (const b of announced) {
    messages.push(formatBreakMessage(b))
  }

  const history = syncRecordsToHistory(leagueHistory, state)
  const decisions = buildRecordDecisions(announced, { playerTeamId })

  const held = countRecordsHeld(state, careerPlayerId, careerPlayerName)

  if (announced.length) {
    messages.push(
      `Records Engine: ${announced.length} recorde(s) quebrado(s) nesta semana.`,
    )
  }

  return {
    records: state,
    leagueHistory: history,
    decisions,
    messages,
    summary: {
      broken: announced.length,
      brokenAll: uniqueBroken.length,
      leagueRecordsHeld: held.league,
      franchiseRecordsHeld: held.franchise,
      careerBreaks,
      trackedPlayers: Object.keys(trackers.seasonPlayers ?? {}).length,
    },
  }
}

function dedupeBroken(list) {
  const seen = new Set()
  const out = []
  for (const b of list) {
    const id = [
      b.scope,
      b.teamId ?? '',
      b.bucket,
      b.key,
      b.value,
      b.holderId ?? '',
    ].join('|')
    if (seen.has(id)) continue
    seen.add(id)
    out.push(b)
  }
  return out
}

function formatBreakMessage(entry) {
  const scope = entry.scope === 'franchise' ? 'Franquia' : 'NBA'
  const prev =
    entry.previousValue != null
      ? ` (antes ${entry.previousValue}${
          entry.previousHolderName ? ` — ${entry.previousHolderName}` : ''
        })`
      : ''
  return `Recorde ${scope}: ${entry.label ?? entry.key} → ${entry.value} (${entry.holderName ?? entry.holderId})${prev}.`
}
