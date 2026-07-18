/**
 * History Engine — bridge permanente para a Hall of Fame Engine.
 *
 * A pontuação e classificação vivem em `engine/hallOfFame`.
 * Aqui materializamos o resultado no arquivo da liga.
 */

import {
  appendHofToHistory,
  processHallOfFameBallots,
} from '../hallOfFame/evaluate.js'
import { HOF_CLASSIFICATION } from '../../data/hallOfFame/constants.js'

/**
 * Avalia aposentadorias → ballots + induções no History.
 *
 * @returns {{ history: object, ballots: object[], inductees: object[] }}
 */
export function evaluateHallOfFame({
  history,
  gm = null,
  retiredPlayerIds = [],
  retirements = [],
  evaluatedSeason = null,
} = {}) {
  let list = Array.isArray(retirements) ? retirements : []

  if (!list.length && retiredPlayerIds?.length) {
    const ids = new Set(retiredPlayerIds)
    list = (history?.retirements ?? []).filter((r) => ids.has(r.playerId))
  }

  const { ballots, inductees } = processHallOfFameBallots({
    history,
    gm,
    retirements: list,
    evaluatedSeason,
  })

  return {
    history: appendHofToHistory(history, { ballots, inductees }),
    ballots,
    inductees,
  }
}

/**
 * @param {object} p
 */
export function createHofEntry(p) {
  return {
    playerId: p.playerId,
    name: p.name,
    teamId: p.teamId ?? null,
    season: p.season,
    year: p.year,
    reason: p.reason ?? 'career',
    score: typeof p.score === 'number' ? Math.round(p.score * 10) / 10 : null,
    classification: p.classification ?? HOF_CLASSIFICATION.hall_of_fame.id,
    classificationLabel:
      p.classificationLabel ?? HOF_CLASSIFICATION.hall_of_fame.label,
    firstBallot: Boolean(
      p.firstBallot ?? p.classification === HOF_CLASSIFICATION.first_ballot.id,
    ),
    credentials: p.credentials ?? null,
    breakdown: p.breakdown ?? null,
  }
}

/**
 * @param {object} leagueHistory
 * @param {string} playerId
 */
export function isInHallOfFame(leagueHistory, playerId) {
  return (leagueHistory?.hallOfFame ?? []).some((e) => e.playerId === playerId)
}

/**
 * @param {object} leagueHistory
 * @param {string} playerId
 */
export function getHofBallot(leagueHistory, playerId) {
  return (leagueHistory?.hofBallots ?? []).find((b) => b.playerId === playerId) ?? null
}
