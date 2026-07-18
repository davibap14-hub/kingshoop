import {
  HIGH_MINUTES_THRESHOLD,
  OVERLOAD_STREAK_WEEKS,
} from '../../data/fatigue/constants.js'
import { buildFatigueEffects } from './effects.js'
import { applyRecoveryToComponents, calcWeeklyRecovery } from './recover.js'
import { analyzeWeekScheduleLoad } from './schedule.js'
import { clampFatigueValue, createFatigueState } from './state.js'

/**
 * Pipeline semanal da Fatigue Engine.
 */
export function processWeeklyFatigue({
  fatigue = null,
  player = null,
  status = null,
  activity = null,
  season = null,
  currentTeamId = null,
  week = 1,
  seasonNumber = 1,
  playingTimeShare = 24,
  medicalStaff = 55,
  seasonRolled = false,
} = {}) {
  const messages = []
  let state = createFatigueState(fatigue)

  if (seasonRolled || state.lastSeasonNumber !== seasonNumber) {
    state = createFatigueState({
      weekly: 10,
      season: 6,
      highMinuteStreak: 0,
      lastSeasonNumber: seasonNumber,
    })
    messages.push('Fatigue Engine: carga da temporada reiniciada.')
  }

  const schedule = analyzeWeekScheduleLoad({
    season,
    teamId: currentTeamId,
    week,
  })

  const minutes = Number(playingTimeShare) || 24
  const activityType = activity?.type ?? 'rest'
  const age = player?.idade ?? 22
  const energy = status?.energia ?? 70

  // Pré-efeitos para modular recuperação
  const pre = buildFatigueEffects(state)
  const recovery = calcWeeklyRecovery({
    activityType,
    age,
    medicalStaff,
    energy,
    effects: pre.effects,
  })

  state = applyRecoveryToComponents(state, recovery)

  // Viagem + B2B da semana
  state = {
    ...state,
    travel: clampFatigueValue(
      state.travel * 0.4 + schedule.travel,
    ),
    backToBack: clampFatigueValue(
      state.backToBack * 0.35 + schedule.backToBack,
    ),
  }

  // Minutos consecutivos
  let streak = state.highMinuteStreak ?? 0
  if (schedule.playsThisWeek && minutes >= HIGH_MINUTES_THRESHOLD) {
    streak += 1
    state = {
      ...state,
      consecutiveMinutes: clampFatigueValue(
        state.consecutiveMinutes + 8 + (minutes - HIGH_MINUTES_THRESHOLD) * 1.2,
      ),
    }
  } else if (activityType === 'rest' || activityType === 'recovery') {
    streak = Math.max(0, streak - 2)
    state = {
      ...state,
      consecutiveMinutes: clampFatigueValue(state.consecutiveMinutes - 10),
    }
  } else {
    streak = Math.max(0, streak - 1)
    state = {
      ...state,
      consecutiveMinutes: clampFatigueValue(state.consecutiveMinutes - 4),
    }
  }

  // Overload
  let overload = state.overload
  if (streak >= OVERLOAD_STREAK_WEEKS) {
    overload = clampFatigueValue(
      40 + streak * 12 + Math.max(0, minutes - 30) * 2,
    )
  } else if (state.weekly >= 70 && state.season >= 55) {
    overload = clampFatigueValue(Math.max(overload, 50 + (state.weekly - 70)))
  } else {
    overload = clampFatigueValue(overload * 0.7 - 4)
  }

  // Jogo na semana adiciona carga weekly/season
  if (schedule.playsThisWeek) {
    state = {
      ...state,
      weekly: clampFatigueValue(state.weekly + 6 + minutes * 0.15),
      season: clampFatigueValue(state.season + 3 + minutes * 0.08),
      game: clampFatigueValue(18 + minutes * 0.35),
    }
  }

  state = {
    ...state,
    overload,
    highMinuteStreak: streak,
    lastWasAway: schedule.isAway,
    lastPlayedWeek: schedule.playsThisWeek ? week : state.lastPlayedWeek,
    lastSeasonNumber: seasonNumber,
    lastUpdate: { week, seasonNumber, activityType },
  }

  const withEffects = buildFatigueEffects(state)

  if (withEffects.effects.highFatigue) {
    messages.push(
      `Fatigue Engine: carga alta (${withEffects.composite}) — performance e risco afetados.`,
    )
  } else if (activityType === 'rest' || activityType === 'recovery') {
    messages.push(
      `Fatigue Engine: recuperação (${recovery.weeklyDelta > 0 ? '+' : ''}${recovery.weeklyDelta.toFixed(0)} weekly).`,
    )
  }

  if (schedule.backToBack > 0 && schedule.playsThisWeek) {
    messages.push('Fatigue Engine: densidade de calendário (B2B/viagem).')
  }

  return {
    fatigue: withEffects,
    messages,
    summary: {
      composite: withEffects.composite,
      weekly: withEffects.weekly,
      season: withEffects.season,
      travel: withEffects.travel,
      backToBack: withEffects.backToBack,
      overload: withEffects.overload,
      consecutiveMinutes: withEffects.consecutiveMinutes,
      highFatigue: withEffects.effects.highFatigue,
      overloaded: withEffects.effects.overloaded,
      trainingMult: withEffects.effects.training,
      injuryChanceBonus: withEffects.effects.injuryChanceBonus,
      simFatigue: withEffects.effects.simFatigue,
      schedule,
    },
    effects: withEffects.effects,
  }
}

/** Multiplicador de treino a partir do estado de fadiga. */
export function getTrainingFatigueMultiplier(fatigue) {
  const built = buildFatigueEffects(fatigue ?? {})
  return built.effects?.training ?? 1
}
