import { GM_PERSONALITY_IDS } from '../../data/gm/personalities'
import { TEAMS } from '../../data/teams'
import { EXPANSION_FRANCHISE_BY_ID } from '../../data/expansion'
import { ensureLeagueCoaches } from '../coaches/generate.js'
import { createCoachEngineState } from '../coaches/state.js'
import { ensureLeaguePlaybooks } from '../playbook/generate.js'
import { createPlaybookEngineState } from '../playbook/state.js'
import { hydrateDraftPicks } from '../trade/picks.js'

/**
 * Garante fatias GM para todas as franquias ativas (pós-expansão).
 */
export function ensureGmForActiveLeague(gm, opts = {}) {
  const teams = opts.teams ?? TEAMS
  const seasonNumber = opts.seasonNumber ?? 1
  let next = {
    ...gm,
    rosters: { ...(gm.rosters ?? {}) },
    personalities: { ...(gm.personalities ?? {}) },
    objectives: { ...(gm.objectives ?? {}) },
    contracts: { ...(gm.contracts ?? {}) },
  }

  for (const team of teams) {
    if (!next.rosters[team.id]) next.rosters[team.id] = []
    if (!next.personalities[team.id]) {
      const expansion = EXPANSION_FRANCHISE_BY_ID[team.id]
      next.personalities[team.id] =
        expansion?.defaultPersonality ??
        GM_PERSONALITY_IDS[
          Math.abs(team.id.charCodeAt(0)) % GM_PERSONALITY_IDS.length
        ]
    }
  }

  next.coaches = ensureLeagueCoaches(
    createCoachEngineState(next.coaches ?? {}),
    { teams, seasonNumber },
  )
  next.playbooks = ensureLeaguePlaybooks(
    createPlaybookEngineState(next.playbooks ?? {}),
    { coaches: next.coaches, teams },
  ).state
  next.draftPicks = hydrateDraftPicks(next.draftPicks, teams)

  return next
}
