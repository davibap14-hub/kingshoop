import {
  EXPANSION_AFTER_SEASONS,
  EXPANSION_CALENDAR_VERSION,
  EXPANSION_FRANCHISES,
} from '../../data/expansion'
import { listActiveTeamIds, syncLeagueTeams } from '../../data/teams'

/**
 * Estado persistível da Expansion Engine.
 */
export function createExpansionState(overrides = {}) {
  return {
    expanded: Boolean(overrides.expanded),
    expandedAtSeason: overrides.expandedAtSeason ?? null,
    expansionTeamIds: [...(overrides.expansionTeamIds ?? [])],
    activeTeamIds: overrides.activeTeamIds?.length
      ? [...overrides.activeTeamIds]
      : listActiveTeamIds(),
    calendarVersion: overrides.calendarVersion ?? 1,
    lastExpansionDraft: overrides.lastExpansionDraft ?? null,
    waves: [...(overrides.waves ?? [])],
  }
}

export function hydrateExpansionState(raw = null) {
  const state = createExpansionState(raw ?? {})
  // Restaura liga ativa no registry global (Save / boot)
  syncLeagueTeams(state.activeTeamIds)
  return {
    ...state,
    activeTeamIds: listActiveTeamIds(),
  }
}

export function shouldExpandLeague(expansion, previousSeasonNumber) {
  if (expansion?.expanded) return false
  if (previousSeasonNumber == null) return false
  return previousSeasonNumber >= EXPANSION_AFTER_SEASONS
}

export function pendingExpansionFranchises(expansion) {
  const active = new Set(expansion?.activeTeamIds ?? listActiveTeamIds())
  return EXPANSION_FRANCHISES.filter((f) => !active.has(f.id))
}

export function markExpanded(expansion, { seasonNumber, teamIds, draftLog }) {
  const activeTeamIds = [
    ...new Set([...(expansion.activeTeamIds ?? []), ...teamIds]),
  ]
  syncLeagueTeams(activeTeamIds)
  return {
    ...expansion,
    expanded: true,
    expandedAtSeason: seasonNumber,
    expansionTeamIds: [...teamIds],
    activeTeamIds: listActiveTeamIds(),
    calendarVersion: EXPANSION_CALENDAR_VERSION,
    lastExpansionDraft: draftLog,
    waves: [
      ...(expansion.waves ?? []),
      {
        seasonNumber,
        teamIds: [...teamIds],
        at: Date.now(),
      },
    ],
  }
}
