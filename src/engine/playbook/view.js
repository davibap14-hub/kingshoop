import {
  PLAYBOOK_CATEGORIES,
  PLAYBOOK_CATEGORY_LABELS,
} from '../../data/playbook/constants.js'
import { PLAY_CATALOG_COUNT } from '../../data/playbook/catalog.js'
import { getTeamCoach } from '../coaches/state.js'
import { ensureLeaguePlaybooks } from './generate.js'
import { createPlaybookEngineState, getTeamPlaybook } from './state.js'

export function getPlaybookView(state = {}) {
  const teamId = state.currentTeamId
  const coaches = state.gm?.coaches
  let playbooks = createPlaybookEngineState(state.gm?.playbooks)

  const ensured = ensureLeaguePlaybooks(playbooks, { coaches })
  playbooks = ensured.state

  const book = teamId ? getTeamPlaybook(playbooks, teamId) : null
  const coach = teamId ? getTeamCoach(coaches, teamId) : null

  if (!book) {
    return {
      available: false,
      teamId,
      playCount: 0,
      catalogSize: PLAY_CATALOG_COUNT,
      categories: [],
      plays: [],
      coachName: coach?.name ?? null,
    }
  }

  const categories = PLAYBOOK_CATEGORIES.map((id) => ({
    id,
    label: PLAYBOOK_CATEGORY_LABELS[id],
    count: book.categoryCounts?.[id] ?? 0,
  })).filter((c) => c.count > 0)

  const plays = (book.plays ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    categoryLabel: PLAYBOOK_CATEGORY_LABELS[p.category] ?? p.category,
    positioning: p.positioning,
    priority: p.priority,
    reading: p.reading,
    firstOption: p.firstOption,
    secondOption: p.secondOption,
    thirdOption: p.thirdOption,
    executionSet: p.executionSet,
  }))

  return {
    available: true,
    teamId,
    playCount: plays.length,
    catalogSize: PLAY_CATALOG_COUNT,
    categories,
    plays: plays.sort((a, b) => b.priority - a.priority),
    coachName: coach?.name ?? null,
    coachArchetypeId: book.coachArchetypeId,
  }
}
