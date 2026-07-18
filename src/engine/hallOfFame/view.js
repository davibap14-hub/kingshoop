import { HOF_CLASSIFICATION, HOF_CLASSIFICATION_ORDER } from '../../data/hallOfFame'
import { createLeagueHistory } from '../history/state.js'

/**
 * Visão read-only da Hall of Fame Engine.
 */
export function getHallOfFameView(state = {}) {
  const history = createLeagueHistory(
    state.leagueHistory ?? state.history ?? state,
  )

  const ballots = [...(history.hofBallots ?? [])].reverse()
  const inductees = [...(history.hallOfFame ?? [])].reverse()

  const byClass = Object.fromEntries(
    HOF_CLASSIFICATION_ORDER.map((id) => [
      id,
      ballots.filter((b) => b.classification === id),
    ]),
  )

  return {
    inductees,
    ballots: ballots.slice(0, 24),
    firstBallot: byClass.first_ballot ?? [],
    hallOfFame: byClass.hall_of_fame ?? [],
    notInducted: byClass.not_inducted ?? [],
    counts: {
      inductees: inductees.length,
      firstBallot: (byClass.first_ballot ?? []).length,
      hallOfFame: (byClass.hall_of_fame ?? []).length,
      notInducted: (byClass.not_inducted ?? []).length,
      ballots: ballots.length,
    },
    labels: Object.fromEntries(
      Object.values(HOF_CLASSIFICATION).map((c) => [c.id, c.label]),
    ),
  }
}
