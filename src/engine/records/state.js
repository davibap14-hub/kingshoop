/**
 * Estado persistível da Records Engine.
 */

import {
  HISTORY_RECORD_MIRROR,
  RECORD_BUCKETS,
  RECORDS_VERSION,
} from '../../data/records'
import { createEmptyRecords } from '../history/state.js'

function emptyBucket() {
  return {}
}

/** Livro vazio (liga ou franquia). */
export function createEmptyRecordBook() {
  return {
    [RECORD_BUCKETS.game]: emptyBucket(),
    [RECORD_BUCKETS.season]: emptyBucket(),
    [RECORD_BUCKETS.career]: emptyBucket(),
    [RECORD_BUCKETS.streak]: emptyBucket(),
    [RECORD_BUCKETS.teamGame]: emptyBucket(),
    [RECORD_BUCKETS.teamSeason]: emptyBucket(),
  }
}

export function createEmptyTrackers(seasonNumber = 1) {
  return {
    seasonNumber,
    /** playerId → { points, rebounds, assists, steals, blocks, tripleDoubles, games, name, teamId } */
    seasonPlayers: {},
  }
}

/**
 * @param {object} [overrides]
 */
export function createRecordsState(overrides = {}) {
  return {
    version: overrides.version ?? RECORDS_VERSION,
    league: hydrateBook(overrides.league),
    franchise: hydrateFranchiseMap(overrides.franchise),
    brokenThisWeek: [...(overrides.brokenThisWeek ?? [])],
    trackers: {
      ...createEmptyTrackers(overrides.trackers?.seasonNumber ?? 1),
      ...(overrides.trackers ?? {}),
      seasonPlayers: { ...(overrides.trackers?.seasonPlayers ?? {}) },
    },
    lastEvaluated: overrides.lastEvaluated ?? { season: null, week: null },
    /** Contagem de quebras pelo jogador de carreira (conquistas) */
    careerBreaks: overrides.careerBreaks ?? 0,
  }
}

export function hydrateRecordsState(raw = null, leagueHistory = null) {
  const state = createRecordsState(raw ?? {})
  if (!isBookEmpty(state.league) || !leagueHistory?.records) {
    return state
  }
  return migrateFromHistoryRecords(state, leagueHistory.records)
}

function hydrateBook(raw) {
  const base = createEmptyRecordBook()
  if (!raw || typeof raw !== 'object') return base
  for (const bucket of Object.keys(base)) {
    base[bucket] = { ...(raw[bucket] ?? {}) }
  }
  return base
}

function hydrateFranchiseMap(raw) {
  if (!raw || typeof raw !== 'object') return {}
  const out = {}
  for (const [teamId, book] of Object.entries(raw)) {
    out[teamId] = hydrateBook(book)
  }
  return out
}

function isBookEmpty(book) {
  if (!book) return true
  for (const bucket of Object.values(RECORD_BUCKETS)) {
    const slot = book[bucket]
    if (slot && Object.values(slot).some(Boolean)) return false
  }
  return true
}

/**
 * Migra os 6 recordes legados do History Engine para o livro canônico.
 */
export function migrateFromHistoryRecords(recordsState, historyRecords) {
  const next = createRecordsState(recordsState)
  const legacy = historyRecords ?? createEmptyRecords()

  for (const [legacyKey, path] of Object.entries(HISTORY_RECORD_MIRROR)) {
    const src = legacy[legacyKey]
    if (!src || src.value == null) continue
    const current = next.league?.[path.bucket]?.[path.key]
    if (current?.value != null && current.value >= src.value) continue

    const entry = {
      key: path.key,
      scope: 'league',
      bucket: path.bucket,
      value: src.value,
      holderKind: path.bucket.startsWith('team') || path.bucket === 'streak'
        ? 'team'
        : 'player',
      holderId: src.holderId ?? src.playerId ?? src.holder ?? src.teamId ?? null,
      holderName: src.holderName ?? src.playerName ?? src.holder ?? null,
      teamId: src.teamId ?? null,
      season: src.season ?? null,
      week: src.week ?? null,
      note: src.note ?? '',
      migratedFrom: legacyKey,
    }
    next.league = {
      ...next.league,
      [path.bucket]: {
        ...next.league[path.bucket],
        [path.key]: entry,
      },
    }
  }

  return next
}

export function ensureFranchiseBook(recordsState, teamId) {
  if (!teamId) return recordsState
  if (recordsState.franchise?.[teamId]) return recordsState
  return {
    ...recordsState,
    franchise: {
      ...recordsState.franchise,
      [teamId]: createEmptyRecordBook(),
    },
  }
}

export function getBookEntry(book, bucket, key) {
  return book?.[bucket]?.[key] ?? null
}
