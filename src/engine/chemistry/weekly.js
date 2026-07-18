import { resolvePlayer } from '../gm/situation'
import { createChemistryState } from './state.js'
import {
  applyDiscussionChemistry,
  applyEventChemistry,
  applyGameResultToChemistry,
  applyTrainingChemistry,
  tickRosterChemistry,
} from './update.js'
import { ensureRosterPairs } from './personality.js'
import { buildLineupChemistryEffects } from './effects.js'

/**
 * Pipeline semanal da Chemistry Engine.
 *
 * Fontes: tempo juntos, vitórias/derrotas, treinos, discussões/eventos.
 */
export function processWeeklyChemistry({
  chemistry,
  gm,
  weekResults = [],
  activityType = null,
  careerPlayerId = 'career_player',
  careerTeamId = null,
  eventTeammateDelta = 0,
  relationshipBonus = 0,
} = {}) {
  const messages = []
  let state = createChemistryState(chemistry ?? gm?.chemistry)

  // 1) Tempo juntos em todos os elencos da liga
  const teams = Object.keys(gm?.rosters ?? {})
  for (const teamId of teams) {
    const ids = gm.rosters[teamId] ?? []
    const players = ids
      .map((id) => resolvePlayer(gm, id))
      .filter(Boolean)
    if (players.length < 2) continue
    state = tickRosterChemistry(state, players)
  }

  // 2) Resultados da semana (vitórias / derrotas)
  let gamesApplied = 0
  for (const result of weekResults) {
    const winnerId = result.winnerId
    for (const side of [
      { teamId: result.homeId, won: winnerId === result.homeId },
      { teamId: result.awayId, won: winnerId === result.awayId },
    ]) {
      const roster = gm?.rosters?.[side.teamId] ?? []
      if (roster.length < 2) continue
      state = applyGameResultToChemistry(state, roster, side.won)
      gamesApplied += 1
    }
  }
  if (gamesApplied) {
    messages.push(
      `Chemistry: ${gamesApplied} elencos atualizados por resultados.`,
    )
  }

  // 3) Treino / bonding do jogador de carreira
  if (activityType && careerTeamId) {
    const roster = gm?.rosters?.[careerTeamId] ?? []
    const withCareer = roster.includes(careerPlayerId)
      ? roster
      : [...roster, careerPlayerId]
    const before = state
    state = applyTrainingChemistry(state, withCareer, activityType)
    if (state !== before) {
      messages.push(`Chemistry: efeito de ${activityType} no elenco.`)
    }
  }

  // 4) Discussões / eventos (delta de companheiros da Relationship Engine)
  if (eventTeammateDelta && careerTeamId) {
    const roster = (gm?.rosters?.[careerTeamId] ?? []).filter(
      (id) => id !== careerPlayerId,
    )
    if (roster.length) {
      if (eventTeammateDelta <= -4) {
        const severity = Math.min(2, Math.abs(eventTeammateDelta) / 4)
        state = applyDiscussionChemistry(
          state,
          careerPlayerId,
          roster,
          severity,
        )
        messages.push('Chemistry: discussão abalou pares do elenco.')
      } else {
        state = applyEventChemistry(
          state,
          careerPlayerId,
          roster,
          eventTeammateDelta > 0,
        )
        messages.push(
          eventTeammateDelta > 0
            ? 'Chemistry: evento fortaleceu vínculos.'
            : 'Chemistry: tensão leve no vestiário.',
        )
      }
    }
  }

  // Snapshot do time do jogador para a UI / sim
  const careerRosterIds = gm?.rosters?.[careerTeamId] ?? []
  const careerPlayers = careerRosterIds
    .map((id) => resolvePlayer({ ...gm, chemistry: state }, id))
    .filter(Boolean)

  state = ensureRosterPairs(state, careerPlayers)
  const lineupEffects = buildLineupChemistryEffects(
    state,
    careerPlayers,
    relationshipBonus,
  )

  return {
    chemistry: state,
    gm: gm ? { ...gm, chemistry: state } : gm,
    effects: lineupEffects,
    messages,
    summary: {
      pairCount: Object.keys(state.pairs ?? {}).length,
      teamChemistry: lineupEffects.teamChemistry,
      avgPair: lineupEffects.avgPair,
      passBoost: lineupEffects.passBoost,
      defenseBoost: lineupEffects.defenseBoost,
      offenseEfficiency: lineupEffects.offenseEfficiency,
      gamesApplied,
    },
  }
}
