/**
 * Visão somente leitura da Records Engine.
 */

import { RECORD_DEFS, labelForRecord } from '../../data/records'
import { hydrateRecordsState } from './state.js'
import { countRecordsHeld } from './evaluate.js'

function flattenBook(book, scope, teamId = null) {
  const rows = []
  for (const def of RECORD_DEFS) {
    const entry = book?.[def.bucket]?.[def.key] ?? null
    if (!entry) continue
    rows.push({
      id: `${scope}.${teamId ? `${teamId}.` : ''}${def.bucket}.${def.key}`,
      scope,
      teamId,
      bucket: def.bucket,
      key: def.key,
      label: entry.label ?? def.label ?? labelForRecord(def.bucket, def.key),
      value: entry.value,
      holderId: entry.holderId,
      holderName: entry.holderName,
      holderKind: entry.holderKind,
      season: entry.season,
      week: entry.week,
      note: entry.note,
    })
  }
  return rows
}

/**
 * @param {object} state — career state ou { records, leagueHistory, player }
 */
export function getRecordsView(state = {}) {
  const records = hydrateRecordsState(
    state.records ?? null,
    state.leagueHistory ?? null,
  )
  const pid = state.player?.id ?? 'career_player'
  const name = state.playerName ?? state.player?.nome ?? null
  const held = countRecordsHeld(records, pid, name)

  const franchiseBooks = Object.entries(records.franchise ?? {}).map(
    ([teamId, book]) => ({
      teamId,
      records: flattenBook(book, 'franchise', teamId),
    }),
  )

  return {
    league: flattenBook(records.league, 'league'),
    franchise: franchiseBooks,
    brokenThisWeek: [...(records.brokenThisWeek ?? [])],
    careerBreaks: records.careerBreaks ?? 0,
    held,
    lastEvaluated: records.lastEvaluated ?? null,
    catalogSize: RECORD_DEFS.length,
  }
}
