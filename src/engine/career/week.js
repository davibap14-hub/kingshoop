import { getActivity, WEEKLY_ACTIVITIES } from '../../data/career/activities'
import { WEEKS_PER_SEASON } from '../../data/constants/career'
import { triggerEvent } from '../events'
import { processWeeklyProgression } from '../progression'
import { applyTraining, rangeRoll } from './activities'
import { processWeeklyFinance, trySignSponsorship } from '../finance'
import {
  appendHistory,
  buildWeekHistoryEntry,
  updateCareerStatsAfterWeek,
} from '../save'
import { processWeeklySeason } from '../season'
import { rollInjury, tickInjury } from './injuries'
import {
  applyStatusDeltas,
  createCareerState,
  syncLegacyCareerVariables,
  syncPlayerStatsFromDetailed,
} from './state'

/**
 * Lista atividades disponíveis nesta semana (regra: 1 escolha).
 */
export function listAvailableActivities(state) {
  const injured = Boolean(state.injury)

  return WEEKLY_ACTIVITIES.filter((activity) => {
    if (activity.requiresInjury && !injured) return false
    if (activity.requiresHealthy && injured && state.injury?.blocksTraining) {
      return false
    }
    if (activity.id === 'recovery' && !injured) return false
    return true
  }).map((a) => ({
    id: a.id,
    type: a.type,
    label: a.label,
    description: a.description,
  }))
}

function advanceCalendar(state) {
  let currentWeek = state.currentWeek + 1
  let currentSeason = state.currentSeason
  let seasonRolled = false

  if (currentWeek > WEEKS_PER_SEASON) {
    currentWeek = 1
    currentSeason += 1
    seasonRolled = true
  }

  return { currentWeek, currentSeason, seasonRolled }
}

/**
 * Career Engine — executa UMA atividade e devolve os efeitos da semana.
 * Pode anexar `pendingEvent` via Event Engine.
 */
export function runCareerWeek(state, activityId, opts = {}) {
  const rng = opts.rng ?? Math.random

  if (state.pendingEvent) {
    return {
      ok: false,
      error: 'Resolva o evento pendente antes de avançar a semana.',
      activityId,
      effects: null,
      nextState: null,
      availableActivities: listAvailableActivities(state),
      pendingEvent: state.pendingEvent,
    }
  }

  const activity = getActivity(activityId)

  if (!activity) {
    return {
      ok: false,
      error: `Atividade desconhecida: ${activityId}`,
      activityId,
      effects: null,
      nextState: null,
      availableActivities: listAvailableActivities(state),
    }
  }

  const available = listAvailableActivities(state)
  if (!available.some((a) => a.id === activityId)) {
    return {
      ok: false,
      error: `Atividade indisponível nesta semana: ${activity.label}`,
      activityId,
      effects: null,
      nextState: null,
      availableActivities: available,
    }
  }

  const messages = []
  const deltas = {
    energia: 0,
    motivacao: 0,
    popularidade: 0,
    felicidade: 0,
    relTreinador: 0,
    relCompanheiros: 0,
    dinheiro: 0,
  }
  const attributeDeltas = {}
  let player = state.player
  let injury = state.injury
  let sponsorships = [...(state.sponsorships ?? [])]
  let activityCashBonus = 0

  messages.push(`Atividade: ${activity.label}.`)

  if (activity.type === 'train') {
    const training = applyTraining(state, activity, rng)
    player = training.player
    Object.assign(attributeDeltas, training.attributeDeltas)
    messages.push(...training.messages)

    deltas.energia += -Math.abs(activity.energyCost)
    deltas.motivacao += rng() < 0.5 ? 2 : 1
    deltas.relTreinador += activity.coachBias ?? 0
    deltas.relCompanheiros += activity.teammatesBias ?? 0

    const maybeInjury = rollInjury(state, activity, rng)
    if (maybeInjury) {
      injury = maybeInjury
      deltas.motivacao -= 8
      deltas.energia -= 10
      messages.push(`LESÃO: ${maybeInjury.label} (${maybeInjury.weeksRemaining} sem.).`)
    }
  } else if (activity.type === 'rest') {
    deltas.energia += Math.abs(activity.energyCost)
    deltas.motivacao += 4
    deltas.relTreinador += activity.coachBias ?? 0
    messages.push('Descanso completo — corpo e mente recuperados.')

    const tick = tickInjury(injury, { accelerated: false })
    injury = tick.injury
    messages.push(...tick.messages)
  } else if (activity.type === 'recovery') {
    deltas.energia += 15
    deltas.motivacao += 3
    deltas.relTreinador += activity.coachBias ?? 0
    const tick = tickInjury(injury, { accelerated: true })
    injury = tick.injury
    messages.push('Sessão de fisioterapia intensiva.')
    messages.push(...tick.messages)
  } else if (activity.type === 'media') {
    deltas.energia += -Math.abs(activity.energyCost)
    const popGain = rangeRoll(activity.popularityGain ?? [2, 5], rng)
    deltas.popularidade += popGain
    deltas.motivacao += 2
    deltas.relTreinador += activity.coachBias ?? 0
    messages.push(`Exposição na mídia: popularidade +${popGain}.`)
  } else if (activity.type === 'bonding') {
    deltas.energia += -Math.abs(activity.energyCost)
    deltas.relCompanheiros += activity.teammatesBias ?? 5
    deltas.motivacao += 5
    messages.push('Confraternização fortaleceu o vestiário.')
  } else if (activity.type === 'coach') {
    deltas.energia += -Math.abs(activity.energyCost)
    deltas.relTreinador += activity.coachBias ?? 6
    deltas.motivacao += 3
    messages.push('Sessão com o treinador alinhou expectativas.')
  } else if (activity.type === 'sponsor') {
    deltas.energia += -Math.abs(activity.energyCost)
    activityCashBonus = rangeRoll(activity.cashBonus ?? [3000, 8000], rng)
    const popGain = rangeRoll(activity.popularityGain ?? [1, 4], rng)
    deltas.popularidade += popGain
    deltas.relTreinador += activity.coachBias ?? 0
    deltas.relCompanheiros += activity.teammatesBias ?? 0
    messages.push(
      `Evento de marca: +$${activityCashBonus.toLocaleString('en-US')} e popularidade +${popGain}.`,
    )

    const signed = trySignSponsorship(
      { ...state, status: applyStatusDeltas(state.status, deltas) },
      rng,
    )
    if (signed.sponsorship) {
      sponsorships = [...sponsorships, signed.sponsorship]
      messages.push(...signed.messages)
    }
  }

  if (
    state.injury &&
    activity.type !== 'rest' &&
    activity.type !== 'recovery'
  ) {
    const tick = tickInjury(injury, { accelerated: false })
    injury = tick.injury
    messages.push(...tick.messages)
  }

  // Finance Engine — salário, patrocínios, investimentos, gastos, luxo, impostos, patrimônio
  const finance = processWeeklyFinance(
    { ...state, sponsorships },
    { extraIncome: activityCashBonus, rng },
  )
  sponsorships = finance.sponsorships
  deltas.dinheiro += finance.deltas.dinheiro
  deltas.felicidade += finance.deltas.felicidade
  deltas.popularidade += finance.deltas.popularidade
  messages.push(...finance.messages)

  if (activity.type !== 'train' && activity.type !== 'rest') {
    deltas.energia += 5
  }

  const status = applyStatusDeltas(state.status, deltas)
  const calendar = advanceCalendar(state)

  if (calendar.seasonRolled) {
    messages.push(`Nova temporada! Temporada ${calendar.currentSeason} começa.`)
  }

  let contract = state.contract
  if (calendar.seasonRolled && contract) {
    const yearsRemaining = Math.max(0, (contract.yearsRemaining ?? 1) - 1)
    contract = { ...contract, yearsRemaining }
    if (yearsRemaining === 0) {
      messages.push('Contrato expirou — renegociação necessária.')
    } else {
      messages.push(`Contrato: ${yearsRemaining} ano(s) restante(s).`)
    }
  }

  const careerVariables = syncLegacyCareerVariables(status)
  const playerStats = syncPlayerStatsFromDetailed(player)

  // Progression Engine — XP semanal + level-up gradual
  const progResult = processWeeklyProgression(
    { ...state, status, injury, player },
    activity,
    rng,
  )
  messages.push(...progResult.messages)

  // Season Engine — atualiza toda a liga na semana avançada
  const seasonResult = processWeeklySeason(
    {
      ...state,
      status,
      injury,
      currentWeek: calendar.currentWeek,
      currentSeason: calendar.currentSeason,
      season: calendar.seasonRolled
        ? undefined
        : state.season,
    },
    {
      week: calendar.currentWeek,
      seasonNumber: calendar.currentSeason,
      seasonRolled: calendar.seasonRolled,
      rng,
    },
  )
  messages.push(...seasonResult.messages)

  let nextState = {
    ...state,
    player,
    playerStats,
    status,
    careerVariables,
    contract,
    sponsorships,
    finance: finance.finance,
    injury,
    progression: progResult.nextProgression,
    season: seasonResult.season,
    currentWeek: calendar.currentWeek,
    currentSeason: calendar.currentSeason,
    lastEvent: messages[messages.length - 1] ?? activity.label,
    pendingEvent: null,
  }

  const eventRoll = triggerEvent(
    nextState,
    { activityType: activity.type, activityId: activity.id },
    { rng },
  )

  if (eventRoll.triggered) {
    nextState = eventRoll.nextState
    messages.push(`Evento: ${eventRoll.event.categoriaLabel} — escolha pendente.`)
  }

  const effects = {
    activityId: activity.id,
    activityLabel: activity.label,
    activityType: activity.type,
    weekFrom: state.currentWeek,
    weekTo: calendar.currentWeek,
    seasonNumber: calendar.currentSeason,
    deltas,
    attributeDeltas,
    messages,
    injury,
    injuryHealed: Boolean(state.injury) && !injury,
    finance: finance.summary,
    sponsorships,
    contract,
    progression: {
      xpGain: progResult.xpGain,
      leveledUp: progResult.leveledUp,
      levelsGained: progResult.levelsGained,
      pointsGained: progResult.pointsGained,
      snapshot: progResult.nextProgression,
    },
    season: seasonResult.summary,
    pendingEvent: nextState.pendingEvent,
  }

  nextState.lastWeekResult = effects

  // Save System — histórico + estatísticas da carreira
  const historyEntry = buildWeekHistoryEntry(nextState, effects)
  nextState.history = appendHistory(state.history, historyEntry)
  nextState.careerStats = updateCareerStatsAfterWeek(
    state.careerStats,
    nextState,
    effects,
  )

  return {
    ok: true,
    error: null,
    activityId: activity.id,
    effects,
    nextState,
    availableActivities: listAvailableActivities(nextState),
    pendingEvent: nextState.pendingEvent,
  }
}

/** Bootstrap: estado inicial + atividades da semana 1 */
export function startCareer(overrides = {}) {
  const state = createCareerState(overrides)
  state.careerVariables =
    overrides.careerVariables ?? syncLegacyCareerVariables(state.status)
  return {
    state,
    availableActivities: listAvailableActivities(state),
  }
}
