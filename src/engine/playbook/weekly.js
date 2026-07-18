import { TEAMS } from '../../data/teams'
import { ensureLeaguePlaybooks } from './generate.js'
import { createPlaybookEngineState } from './state.js'

/**
 * Garante playbooks da liga; regenera se o coach mudou de arquétipo.
 */
export function processWeeklyPlaybooks({
  playbooks,
  gm,
  seasonRolled = false,
} = {}) {
  const messages = []
  let state = createPlaybookEngineState(playbooks ?? gm?.playbooks)

  if (seasonRolled) {
    state = createPlaybookEngineState({ byTeam: {} })
    messages.push('Playbook Engine: novos playbooks na liga.')
  }

  const ensured = ensureLeaguePlaybooks(state, {
    coaches: gm?.coaches,
    teams: TEAMS,
  })
  state = ensured.state

  if (ensured.changed && !seasonRolled) {
    messages.push('Playbook Engine: playbooks alinhados aos técnicos.')
  }

  const nextGm = gm
    ? {
        ...gm,
        playbooks: state,
      }
    : gm

  return {
    playbooks: state,
    gm: nextGm,
    messages,
    summary: {
      teams: Object.keys(state.byTeam ?? {}).length,
      regenerated: Boolean(ensured.changed || seasonRolled),
    },
  }
}
