/**
 * Compara candidatos com o livro e registra quebras.
 */

import { labelForRecord, MAX_RECORD_BREAKS_PER_WEEK } from '../../data/records'
import { ensureFranchiseBook, getBookEntry } from './state.js'

/**
 * Aplica uma lista de candidatos a um livro (liga ou franquia).
 * @returns {{ book, broken: object[] }}
 */
export function applyCandidatesToBook(book, candidates, { scope, teamId = null } = {}) {
  let next = { ...book }
  const broken = []

  for (const candidate of candidates) {
    if (!candidate || candidate.value == null) continue
    // Franquia: só candidatos do time
    if (scope === 'franchise') {
      if (!teamId) continue
      if (candidate.teamId && candidate.teamId !== teamId) continue
      if (
        candidate.holderKind === 'team' &&
        candidate.holderId &&
        candidate.holderId !== teamId
      ) {
        continue
      }
    }

    const bucket = candidate.bucket
    const key = candidate.key
    const current = getBookEntry(next, bucket, key)
    if (current?.value != null && candidate.value <= current.value) continue

    const entry = {
      key,
      scope,
      bucket,
      value: candidate.value,
      holderKind: candidate.holderKind,
      holderId: candidate.holderId,
      holderName: candidate.holderName,
      teamId: candidate.teamId ?? teamId ?? null,
      season: candidate.season ?? null,
      week: candidate.week ?? null,
      gameId: candidate.gameId ?? null,
      note: candidate.note ?? '',
      previousValue: current?.value ?? null,
      previousHolderName: current?.holderName ?? current?.holderId ?? null,
      brokenAt: Date.now(),
      label: labelForRecord(bucket, key),
    }

    next = {
      ...next,
      [bucket]: {
        ...(next[bucket] ?? {}),
        [key]: entry,
      },
    }
    broken.push(entry)
  }

  return { book: next, broken }
}

/**
 * Avalia liga + franquias envolvidas.
 */
export function evaluateRecordBreaks(recordsState, candidates) {
  let state = { ...recordsState }
  const allBroken = []

  const leagueResult = applyCandidatesToBook(state.league, candidates, {
    scope: 'league',
  })
  state = { ...state, league: leagueResult.book }
  allBroken.push(...leagueResult.broken)

  const teamIds = new Set()
  for (const c of candidates) {
    if (c.teamId) teamIds.add(c.teamId)
    if (c.holderKind === 'team' && c.holderId) teamIds.add(c.holderId)
  }
  // Também avalia franquias já existentes (carreira/season podem mudar holder)
  for (const id of Object.keys(state.franchise ?? {})) {
    teamIds.add(id)
  }

  let franchise = { ...state.franchise }
  for (const teamId of teamIds) {
    state = ensureFranchiseBook(state, teamId)
    franchise = state.franchise
    const book = franchise[teamId]
    const result = applyCandidatesToBook(book, candidates, {
      scope: 'franchise',
      teamId,
    })
    franchise = { ...franchise, [teamId]: result.book }
    allBroken.push(...result.broken)
  }

  // Prioriza liga > franquia, depois valor
  allBroken.sort((a, b) => {
    if (a.scope !== b.scope) return a.scope === 'league' ? -1 : 1
    return (b.value ?? 0) - (a.value ?? 0)
  })

  const announced = allBroken.slice(0, MAX_RECORD_BREAKS_PER_WEEK)

  return {
    records: {
      ...state,
      franchise,
      brokenThisWeek: announced,
    },
    broken: announced,
    brokenAll: allBroken,
  }
}

/**
 * Conta recordes atualmente detidos por um jogador.
 */
export function countRecordsHeld(recordsState, playerId, playerName = null) {
  if (!recordsState || !playerId) return { league: 0, franchise: 0, total: 0 }
  let league = 0
  let franchise = 0

  const matches = (entry) => {
    if (!entry) return false
    return (
      entry.holderId === playerId ||
      entry.holderName === playerName ||
      entry.holder === playerName ||
      entry.playerId === playerId
    )
  }

  for (const bucket of Object.values(recordsState.league ?? {})) {
    for (const entry of Object.values(bucket ?? {})) {
      if (matches(entry)) league += 1
    }
  }

  for (const book of Object.values(recordsState.franchise ?? {})) {
    for (const bucket of Object.values(book ?? {})) {
      for (const entry of Object.values(bucket ?? {})) {
        if (matches(entry)) franchise += 1
      }
    }
  }

  return { league, franchise, total: league + franchise }
}
