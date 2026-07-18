import {
  COACH_ATTR_KEYS,
  COACH_ATTR_LABELS,
  PRACTICE_FOCI,
} from '../../data/coaches'
import { TEAM_STYLES } from '../../data/ai/styles'
import { buildCoachEffects } from './effects.js'
import { ensureLeagueCoaches } from './generate.js'
import {
  createCoachEngineState,
  getTeamCoach,
} from './state.js'

/**
 * Visão read-only para a Interface.
 */
export function getCoachView(state = {}) {
  const teamId = state.currentTeamId
  let coaches = createCoachEngineState(
    state.coaches ?? state.gm?.coaches,
  )
  coaches = ensureLeagueCoaches(coaches, {
    seasonNumber: state.currentSeason ?? 1,
  })

  const coach = getTeamCoach(coaches, teamId)
  const lastDecision =
    [...(coaches.lastDecisions ?? [])]
      .reverse()
      .find((d) => d.teamId === teamId) ?? null

  const effects = coach ? buildCoachEffects(coach, lastDecision) : null
  const style =
    TEAM_STYLES[effects?.styleId ?? coach?.preferredStyleId] ?? null

  const attributes = COACH_ATTR_KEYS.map((key) => ({
    id: key,
    label: COACH_ATTR_LABELS[key] ?? key,
    value: coach?.[key] ?? 50,
  }))

  return {
    coach: coach
      ? {
          id: coach.id,
          name: coach.name,
          archetypeId: coach.archetypeId,
          preferredStyleId: coach.preferredStyleId,
          preferredStyleLabel: style?.label ?? coach.preferredStyleId,
        }
      : null,
    attributes,
    decision: lastDecision
      ? {
          practiceFocus:
            lastDecision.practiceFocus?.label ??
            PRACTICE_FOCI[lastDecision.practiceFocus?.focusId]?.label,
          minutes: lastDecision.playingTime?.minutes,
          styleLabel: lastDecision.style?.style?.label ?? style?.label,
          relationDelta: lastDecision.relationDelta,
          setBias: lastDecision.setBias,
        }
      : null,
    effects: effects
      ? {
          playingTimeShare: effects.playingTimeShare,
          trainingMultiplier: effects.trainingMultiplier,
          xpMultiplier: effects.xpMultiplier,
          motivationAura: effects.motivationAura,
          practiceFocus: effects.practiceFocus?.label ?? null,
        }
      : null,
    leagueCoachCount: Object.keys(coaches.byTeam ?? {}).length,
  }
}
