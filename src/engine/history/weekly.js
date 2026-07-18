import { appendSeasonToHistory, buildSeasonArchive } from './archive.js'
import { evaluateHallOfFame } from './hof.js'
import {
  extractRecordCandidatesFromWeek,
  updateLeagueRecords,
} from './records.js'
import {
  appendRetirements,
  extractRetirementsFromGm,
} from './retirements.js'
import { createLeagueHistory } from './state.js'
import { accumulateWeekTotals } from './totals.js'

/**
 * History Engine — pipeline semanal.
 *
 * - Atualiza totais (MVP de jogo, TDs) e recordes
 * - Registra aposentadorias
 * - No roll de temporada: arquiva a temporada ANTERIOR (antes do reset)
 * - Avalia Hall da Fama
 *
 * Nenhuma temporada arquivada é removida.
 */
export function processWeeklyHistory({
  leagueHistory,
  previousSeason = null,
  seasonRolled = false,
  weekResults = [],
  week,
  seasonNumber,
  gmDecisions = [],
  gm = null,
} = {}) {
  const messages = []
  let history = createLeagueHistory(leagueHistory ?? {})
  const archivedSeason = seasonRolled ? previousSeason?.seasonNumber ?? null : null

  // 1) Arquivar temporada que acabou — ANTES de qualquer dado novo sobrescrever
  if (seasonRolled && previousSeason) {
    const seasonTotals = accumulateWeekTotals(
      {
        gameMvpTotals: {},
        tripleDoubleTotals: {},
      },
      previousSeason.results ?? [],
    )
    const archive = buildSeasonArchive(previousSeason, {
      gameMvpTotals: seasonTotals.gameMvpTotals,
      tripleDoubleTotals: seasonTotals.tripleDoubleTotals,
    })
    if (archive) {
      history = appendSeasonToHistory(history, archive)
      messages.push(
        `History Engine: temporada ${archive.season} arquivada (permanente).`,
      )
      if (archive.champion) {
        messages.push(
          `Arquivo: campeão T${archive.season} — ${archive.champion.teamShort ?? archive.champion.teamId}.`,
        )
      }
      if (archive.awards?.mvp) {
        messages.push(
          `Arquivo: MVP T${archive.season} — ${archive.awards.mvp.teamShort}.`,
        )
      }
    }
  }

  // 2) Totais permanentes da semana atual
  history = accumulateWeekTotals(history, weekResults)

  // 3) Recordes all-time
  const weekCandidates = extractRecordCandidatesFromWeek(
    weekResults,
    seasonNumber,
    week,
  )
  const beforeRecords = history.records
  history = {
    ...history,
    records: updateLeagueRecords(history.records, weekCandidates),
  }
  for (const [key, cand] of Object.entries(weekCandidates)) {
    const prev = beforeRecords?.[key]?.value
    if (cand && (prev == null || cand.value > prev)) {
      messages.push(
        `Recorde: ${key} → ${cand.value}${cand.note ? ` (${cand.note})` : ''}.`,
      )
    }
  }

  // 4) Aposentadorias
  const retirements = extractRetirementsFromGm(
    gmDecisions,
    gm,
    seasonNumber,
    week,
  )
  if (retirements.length) {
    history = appendRetirements(history, retirements)
    for (const r of retirements) {
      messages.push(`Aposentadoria: ${r.name} (T${r.season}).`)
    }
  }

  // 5) Hall da Fama
  const hof = evaluateHallOfFame({
    history,
    gm,
    retiredPlayerIds: retirements.map((r) => r.playerId),
  })
  history = hof.history
  for (const ind of hof.inductees) {
    messages.push(`Hall da Fama: ${ind.name} — ${ind.reason}.`)
  }

  return {
    leagueHistory: history,
    messages,
    summary: {
      seasonsArchived: history.seasons?.length ?? 0,
      archivedSeason,
      champions: history.champions?.length ?? 0,
      mvps: history.mvps?.length ?? 0,
      awards: history.awards?.length ?? 0,
      retirements: history.retirements?.length ?? 0,
      hallOfFame: history.hallOfFame?.length ?? 0,
      recordsSet: Object.keys(weekCandidates).length,
      inductees: hof.inductees,
      newRetirements: retirements,
    },
  }
}
