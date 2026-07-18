import { TEAMS } from '../../data/teams'
import { resolvePlayer } from '../gm/situation'
import { decideCoachWeek } from './decide.js'
import { buildCoachEffects } from './effects.js'
import { deriveMedicalStaffFromCoach, ensureLeagueCoaches } from './generate.js'
import {
  createCoachEngineState,
  getTeamCoach,
} from './state.js'

/**
 * Pipeline semanal da Coach Engine.
 * Cada técnico toma decisões automáticas por pesos (nunca RNG puro).
 */
export function processWeeklyCoaches({
  coaches,
  gm,
  careerTeamId = null,
  player = null,
  relationships = {},
  activityType = null,
  trainingSuccess = false,
  injured = false,
  highFatigue = false,
  weekResults = [],
  week = null,
  seasonNumber = null,
  seasonRolled = false,
  rng = Math.random,
} = {}) {
  const messages = []
  let state = ensureLeagueCoaches(createCoachEngineState(coaches ?? gm?.coaches), {
    teams: TEAMS,
    seasonNumber: seasonNumber ?? 1,
  })

  // No roll de temporada, regenera coaches (novo ciclo / demissões implícitas)
  if (seasonRolled) {
    state = createCoachEngineState({ byTeam: {} })
    state = ensureLeagueCoaches(state, {
      teams: TEAMS,
      seasonNumber: seasonNumber ?? 1,
    })
    messages.push('Coach Engine: novos ciclos técnicos na liga.')
  }

  const decisions = []
  const teamIds = Object.keys(gm?.rosters ?? {}).length
    ? Object.keys(gm.rosters)
    : TEAMS.map((t) => t.id)

  for (const teamId of teamIds) {
    const coach = getTeamCoach(state, teamId)
    if (!coach) continue

    const rosterIds = gm?.rosters?.[teamId] ?? []
    const players = rosterIds
      .map((id) => resolvePlayer(gm, id))
      .filter(Boolean)

    const teamGames = (weekResults ?? []).filter(
      (g) => g.homeId === teamId || g.awayId === teamId,
    )
    const recentWins = teamGames.filter((g) => g.winnerId === teamId).length
    const recentLosses = teamGames.length - recentWins
    const youngCount = players.filter((p) => (p.idade ?? 28) <= 23).length

    const isCareerTeam = teamId === careerTeamId
    const decision = decideCoachWeek(
      coach,
      {
        week,
        players,
        recentWins,
        recentLosses,
        hasYoungRoster: youngCount >= 3,
        highFatigue: isCareerTeam ? Boolean(highFatigue) : false,
        lowMorale: recentLosses >= 2,
        age: isCareerTeam ? player?.idade : null,
        overall: isCareerTeam ? player?.overall : null,
        coachRelationship: isCareerTeam
          ? relationships?.coach ?? 55
          : 55,
        activityType: isCareerTeam ? activityType : null,
        trainingSuccess: isCareerTeam ? trainingSuccess : false,
        injured: isCareerTeam ? injured : false,
      },
      rng,
    )

    decisions.push({ teamId, ...decision })
  }

  const careerDecision =
    decisions.find((d) => d.teamId === careerTeamId) ?? null
  const careerCoach = careerTeamId
    ? getTeamCoach(state, careerTeamId)
    : null
  const careerEffects = careerCoach
    ? buildCoachEffects(careerCoach, careerDecision)
    : null

  if (careerDecision) {
    messages.push(
      `Coach ${careerDecision.coachName}: foco ${careerDecision.practiceFocus.label} · ${careerDecision.playingTime.minutes} min · estilo ${careerDecision.style.style?.label ?? careerDecision.style.styleId}.`,
    )
    if (careerDecision.relationDelta) {
      const sign = careerDecision.relationDelta > 0 ? '+' : ''
      messages.push(
        `Coach Engine: relação com atletas ${sign}${careerDecision.relationDelta}.`,
      )
    }
  }

  state = {
    ...state,
    lastDecisions: [...(state.lastDecisions ?? []), ...decisions].slice(-40),
    lastUpdate: Date.now(),
  }

  return {
    coaches: state,
    gm: gm ? { ...gm, coaches: state } : gm,
    decisions,
    careerDecision,
    careerCoach,
    effects: careerEffects,
    medicalStaff: deriveMedicalStaffFromCoach(careerCoach),
    messages,
    summary: {
      coachName: careerCoach?.name ?? null,
      practiceFocus: careerDecision?.practiceFocus?.label ?? null,
      minutes: careerDecision?.playingTime?.minutes ?? null,
      styleId: careerDecision?.style?.styleId ?? null,
      relationDelta: careerDecision?.relationDelta ?? 0,
      teamsDecided: decisions.length,
      offensiveSystem: careerCoach?.offensiveSystem ?? null,
      defensiveSystem: careerCoach?.defensiveSystem ?? null,
      development: careerCoach?.development ?? null,
    },
  }
}
