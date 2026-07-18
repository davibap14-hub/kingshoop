import { accumulateCareerTotals, creditSeasonHonors } from '../hallOfFame'
import { appendSeasonToHistory, buildSeasonArchive } from './archive.js'
import { evaluateHallOfFame } from './hof.js'
import {
  appendRetirements,
  extractRetirementsFromGm,
} from './retirements.js'
import { createLeagueHistory } from './state.js'
import { accumulateWeekTotals } from './totals.js'

/**
 * History Engine — pipeline semanal.
 *
 * - Atualiza totais (MVP de jogo, TDs)
 * - Registra aposentadorias
 * - No roll de temporada: arquiva a temporada ANTERIOR (antes do reset)
 * - Avalia Hall da Fama
 *
 * Recordes all-time / franquia: Records Engine (após este passo).
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
  expansion = null,
} = {}) {
  const messages = []
  let history = createLeagueHistory(leagueHistory ?? {})
  const archivedSeason = seasonRolled ? previousSeason?.seasonNumber ?? null : null

  // 0) Expansion Engine — registro permanente da onda
  if (
    seasonRolled &&
    expansion?.expanded &&
    expansion?.lastExpansionDraft &&
    expansion.expandedAtSeason === (previousSeason?.seasonNumber ?? null)
  ) {
    const wave = {
      season: expansion.expandedAtSeason,
      teamIds: [...(expansion.expansionTeamIds ?? [])],
      picks: expansion.lastExpansionDraft.picks?.length ?? 0,
      calendarVersion: expansion.calendarVersion ?? null,
      at: expansion.lastExpansionDraft.at ?? Date.now(),
    }
    const expansions = [...(history.expansions ?? [])]
    if (!expansions.some((e) => e.season === wave.season)) {
      expansions.push(wave)
      history = { ...history, expansions }
      messages.push(
        `History Engine: expansão T${wave.season} arquivada (${wave.teamIds.join(', ').toUpperCase()}).`,
      )
    }
  }

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
      history = creditSeasonHonors(history, archive)
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

  // 2) Totais permanentes da semana atual (+ carreira para HOF)
  history = accumulateWeekTotals(history, weekResults)
  history = accumulateCareerTotals(history, weekResults)

  // 3) Aposentadorias
  // (Recordes: Records Engine — processWeeklyRecords)
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

  // 4) Hall of Fame Engine — pontuação + classificação na aposentadoria
  const hof = evaluateHallOfFame({
    history,
    gm,
    retiredPlayerIds: retirements.map((r) => r.playerId),
    retirements,
    evaluatedSeason: seasonNumber,
  })
  history = hof.history
  for (const ballot of hof.ballots ?? []) {
    messages.push(
      `HOF (${ballot.classificationLabel}): ${ballot.name} — score ${ballot.score}.`,
    )
  }
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
      hofBallots: history.hofBallots?.length ?? 0,
      recordsSet: 0,
      inductees: hof.inductees,
      ballots: hof.ballots ?? [],
      newRetirements: retirements,
    },
  }
}
