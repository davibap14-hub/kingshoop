import { DEFAULT_MEDICAL_STAFF } from '../../data/injuries'
import { recalcInjuryProfile } from './risk.js'
import { rollInjuryEvent } from './roll.js'
import { tickInjuryRecovery } from './recovery.js'
import {
  createInjuryEngineState,
  hydrateInjuryEngine,
  toLegacyInjury,
} from './state.js'

/**
 * Pipeline semanal da Injury Engine (jogador de carreira).
 *
 * Atualiza: risco, condição, minutos, fadiga, histórico,
 * lesão ativa, recuperação e possível recaída.
 */
export function processWeeklyInjuries({
  injuryEngine,
  injury = null,
  player = null,
  status = {},
  activity = null,
  playingTimeShare = 24,
  medicalStaff = DEFAULT_MEDICAL_STAFF,
  week = null,
  seasonNumber = null,
  rng = Math.random,
} = {}) {
  const messages = []
  let state = hydrateInjuryEngine(injuryEngine, injury)
  const hadInjuryAtStart = Boolean(state.active)

  state = {
    ...state,
    profile: {
      ...state.profile,
      medicalStaff: medicalStaff ?? state.profile.medicalStaff,
      minutesPerGame: playingTimeShare ?? state.profile.minutesPerGame,
    },
  }

  // 1) Recalcula perfil (risco / fadiga / condição) — pesos
  const profile = recalcInjuryProfile(state.profile, {
    age: player?.idade ?? 22,
    energy: status.energia ?? 70,
    minutesPerGame: playingTimeShare ?? state.profile.minutesPerGame,
    resistencia: player?.fisico?.resistencia ?? 60,
    activityType: activity?.type ?? null,
    injured: hadInjuryAtStart,
  })
  state = { ...state, profile }

  const age = player?.idade ?? 22
  const isRest = activity?.type === 'rest'
  const isRecovery = activity?.type === 'recovery'
  const isTrain = activity?.type === 'train'

  // 2) Nova lesão no treino (se saudável)
  let justInjured = false
  if (!state.active && isTrain) {
    const rolled = rollInjuryEvent({
      profile,
      status,
      activity,
      week,
      seasonNumber,
      alreadyInjured: false,
      rng,
    })
    if (rolled) {
      state = { ...state, active: rolled, lastUpdate: Date.now() }
      justInjured = true
      messages.push(
        `LESÃO [${severityLabel(rolled.severity)}]: ${rolled.label} — ${rolled.weeksRemaining} sem. · ${rolled.treatmentLabel}.`,
      )
    }
  }

  // 3) Tick de recuperação (não na mesma semana da nova lesão)
  if (state.active && !justInjured) {
    const tick = tickInjuryRecovery({
      injuryEngine: state,
      age,
      rested: isRest || isRecovery,
      accelerated: isRecovery,
      week,
      seasonNumber,
      rng,
    })
    state = tick.injuryEngine
    messages.push(...tick.messages)
  }

  return {
    injuryEngine: {
      ...state,
      lastUpdate: Date.now(),
    },
    injury: toLegacyInjury(state.active),
    messages,
    summary: {
      injuryRisk: state.profile.injuryRisk,
      condition: state.profile.condition,
      fatigue: state.profile.fatigue,
      minutesPerGame: state.profile.minutesPerGame,
      medicalStaff: state.profile.medicalStaff,
      historyCount: state.profile.history?.length ?? 0,
      active: state.active
        ? {
            label: state.active.label,
            severity: state.active.severity,
            weeksRemaining: state.active.weeksRemaining,
            treatment: state.active.treatmentLabel,
            relapseChance: state.active.relapseChance,
          }
        : null,
      healthy: !state.active,
    },
  }
}

function severityLabel(severity) {
  if (severity === 'light') return 'Leve'
  if (severity === 'severe') return 'Grave'
  return 'Moderada'
}

export { createInjuryEngineState }
