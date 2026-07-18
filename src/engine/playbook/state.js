import { PLAY_CATALOG_BY_ID } from '../../data/playbook/catalog.js'
import { PLAYBOOK_CATEGORIES } from '../../data/playbook/constants.js'

export function createPlaybookEngineState(raw = {}) {
  return {
    byTeam: { ...(raw.byTeam ?? {}) },
  }
}

export function normalizeTeamPlaybook(raw = {}, teamId = null) {
  const playIds = Array.isArray(raw.playIds)
    ? raw.playIds.filter((id) => PLAY_CATALOG_BY_ID[id])
    : []

  const plays = playIds
    .map((id) => PLAY_CATALOG_BY_ID[id])
    .filter(Boolean)

  const categoryCounts = Object.fromEntries(
    PLAYBOOK_CATEGORIES.map((c) => [c, 0]),
  )
  for (const p of plays) {
    categoryCounts[p.category] = (categoryCounts[p.category] ?? 0) + 1
  }

  return {
    teamId: raw.teamId ?? teamId,
    playIds,
    plays,
    categoryCounts,
    coachArchetypeId: raw.coachArchetypeId ?? null,
    generatedAt: raw.generatedAt ?? null,
    version: raw.version ?? 1,
  }
}

export function getTeamPlaybook(state, teamId) {
  if (!state?.byTeam || !teamId) return null
  const raw = state.byTeam[teamId]
  if (!raw) return null
  return normalizeTeamPlaybook(raw, teamId)
}

export function setTeamPlaybook(state, teamId, playbook) {
  return {
    ...createPlaybookEngineState(state),
    byTeam: {
      ...(state?.byTeam ?? {}),
      [teamId]: normalizeTeamPlaybook(playbook, teamId),
    },
  }
}
