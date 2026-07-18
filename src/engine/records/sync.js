/**
 * Sincroniza Records Engine → History Engine + decisões (News).
 */

import {
  HISTORY_RECORD_MIRROR,
  labelForRecord,
} from '../../data/records'
import { createEmptyRecords, createLeagueHistory } from '../history/state.js'
import { getBookEntry } from './state.js'

/**
 * Espelha o livro canônico em `leagueHistory.records`
 * (chaves legadas + nomesadas).
 */
export function syncRecordsToHistory(leagueHistory, recordsState) {
  const history = createLeagueHistory(leagueHistory ?? {})
  const legacy = { ...(history.records ?? createEmptyRecords()) }
  const book = recordsState?.league

  for (const [legacyKey, path] of Object.entries(HISTORY_RECORD_MIRROR)) {
    const entry = getBookEntry(book, path.bucket, path.key)
    if (!entry) continue
    legacy[legacyKey] = toHistoryEntry(entry)
  }

  // Chaves nomesadas para o painel / Legacy
  if (book) {
    for (const [bucket, slots] of Object.entries(book)) {
      for (const [key, entry] of Object.entries(slots ?? {})) {
        if (!entry) continue
        legacy[`league.${bucket}.${key}`] = toHistoryEntry(entry)
      }
    }
  }

  for (const [teamId, fbook] of Object.entries(recordsState?.franchise ?? {})) {
    for (const [bucket, slots] of Object.entries(fbook ?? {})) {
      for (const [key, entry] of Object.entries(slots ?? {})) {
        if (!entry) continue
        legacy[`franchise.${teamId}.${bucket}.${key}`] = toHistoryEntry(entry)
      }
    }
  }

  return {
    ...history,
    records: legacy,
  }
}

function toHistoryEntry(entry) {
  return {
    value: entry.value,
    holder: entry.holderName ?? entry.holderId ?? null,
    holderId: entry.holderId ?? null,
    holderName: entry.holderName ?? null,
    playerId: entry.holderKind === 'player' ? entry.holderId : null,
    playerName: entry.holderKind === 'player' ? entry.holderName : null,
    teamId: entry.teamId ?? null,
    season: entry.season ?? null,
    week: entry.week ?? null,
    note: entry.note ?? '',
    scope: entry.scope ?? null,
    bucket: entry.bucket ?? null,
    key: entry.key ?? null,
    label: entry.label ?? labelForRecord(entry.bucket, entry.key),
  }
}

/**
 * Gera decisões GM para o News Engine.
 */
export function buildRecordDecisions(broken = [], { playerTeamId = null } = {}) {
  return broken.map((entry) => ({
    type: 'record_broken',
    scope: entry.scope,
    bucket: entry.bucket,
    key: entry.key,
    label: entry.label ?? labelForRecord(entry.bucket, entry.key),
    value: entry.value,
    previousValue: entry.previousValue ?? null,
    holderId: entry.holderId,
    holderName: entry.holderName,
    holderKind: entry.holderKind,
    teamId: entry.teamId,
    season: entry.season,
    week: entry.week,
    note: entry.note,
    reason:
      entry.scope === 'franchise'
        ? `Recorde da franquia: ${entry.label ?? entry.key}`
        : `Recorde da NBA: ${entry.label ?? entry.key}`,
    aboutPlayerTeam: entry.teamId === playerTeamId,
    at: entry.brokenAt ?? Date.now(),
  }))
}
