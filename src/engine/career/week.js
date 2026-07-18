import { getActivity, WEEKLY_ACTIVITIES } from '../../data/career/activities'
import { WEEKS_PER_SEASON } from '../../data/constants/career'
import { triggerEvent } from '../events'
import { processWeeklyProgression } from '../progression'
import {
  calcTeammateChemistryDelta,
  sortActivitiesByPersonality,
  suggestWeeklyActivity,
} from '../personality'
import { processSeasonalBalance } from '../balance'
import { processWeeklyContracts } from '../contracts'
import { processWeeklyNews } from '../news'
import {
  applyEventToRelationships,
  calculateRelationshipEffects,
  processWeeklyRelationships,
  syncStatusFromRelationships,
} from '../relationships'
import { applyTraining, rangeRoll } from './activities'
import { processWeeklyFinance, trySignSponsorship } from '../finance'
import {
  appendHistory,
  buildWeekHistoryEntry,
  updateCareerStatsAfterWeek,
} from '../save'
import { processWeeklyGm } from '../gm'
import { resolvePlayer } from '../gm/situation'
import { processWeeklyHistory } from '../history'
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

  const available = WEEKLY_ACTIVITIES.filter((activity) => {
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

  // Personality Engine — ordena escolhas semanais pela personalidade
  const sorted = sortActivitiesByPersonality(available, state.player)
  const suggested = suggestWeeklyActivity(sorted, state.player)
  return sorted.map((a) => ({
    ...a,
    suggested: suggested?.id === a.id,
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

  if (state.pendingContractOffer) {
    return {
      ok: false,
      error: 'Resolva a oferta de contrato antes de avançar a semana.',
      activityId,
      effects: null,
      nextState: null,
      availableActivities: listAvailableActivities(state),
      pendingContractOffer: state.pendingContractOffer,
    }
  }

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
  let popularityGain = 0
  let trainingSuccess = false

  // Relationship Engine — efeitos da semana anterior guiam treino/XP
  const priorRelEffects = calculateRelationshipEffects(state.relationships)
  const stateWithRel = {
    ...state,
    relationshipEffects: priorRelEffects,
  }

  messages.push(`Atividade: ${activity.label}.`)

  if (activity.type === 'train') {
    const training = applyTraining(stateWithRel, activity, rng)
    player = training.player
    Object.assign(attributeDeltas, training.attributeDeltas)
    messages.push(...training.messages)
    trainingSuccess = Object.values(training.attributeDeltas).some((v) => v > 0)

    deltas.energia += -Math.abs(activity.energyCost)
    deltas.motivacao += rng() < 0.5 ? 2 : 1

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
    messages.push('Descanso completo — corpo e mente recuperados.')

    const tick = tickInjury(injury, { accelerated: false })
    injury = tick.injury
    messages.push(...tick.messages)
  } else if (activity.type === 'recovery') {
    deltas.energia += 15
    deltas.motivacao += 3
    const tick = tickInjury(injury, { accelerated: true })
    injury = tick.injury
    messages.push('Sessão de fisioterapia intensiva.')
    messages.push(...tick.messages)
  } else if (activity.type === 'media') {
    deltas.energia += -Math.abs(activity.energyCost)
    popularityGain = rangeRoll(activity.popularityGain ?? [2, 5], rng)
    deltas.motivacao += 2
    messages.push(`Exposição na mídia: imprensa/torcida +${popularityGain}.`)
  } else if (activity.type === 'bonding') {
    deltas.energia += -Math.abs(activity.energyCost)
    deltas.motivacao += 5
    messages.push('Confraternização fortaleceu o vestiário.')
  } else if (activity.type === 'coach') {
    deltas.energia += -Math.abs(activity.energyCost)
    deltas.motivacao += 3
    messages.push('Sessão com o treinador alinhou expectativas.')
  } else if (activity.type === 'sponsor') {
    deltas.energia += -Math.abs(activity.energyCost)
    activityCashBonus = rangeRoll(activity.cashBonus ?? [3000, 8000], rng)
    popularityGain = rangeRoll(activity.popularityGain ?? [1, 4], rng)
    messages.push(
      `Evento de marca: +$${activityCashBonus.toLocaleString('en-US')}.`,
    )

    const signed = trySignSponsorship(
      {
        ...state,
        status: applyStatusDeltas(state.status, deltas),
        relationships: state.relationships,
        relationshipEffects: priorRelEffects,
      },
      rng,
    )
    if (signed.sponsorship) {
      sponsorships = [...sponsorships, signed.sponsorship]
      messages.push(...signed.messages)
    }
  }

  // Personality Engine — química alimenta a Relationship Engine (companheiros)
  const chemDelta = calcTeammateChemistryDelta(player, activity.type)
  if (chemDelta) {
    messages.push(
      chemDelta > 0
        ? `Personalidade: química do elenco +${chemDelta}.`
        : `Personalidade: tensão no vestiário ${chemDelta}.`,
    )
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
  // popularidade financeira vira torcida/imprensa via Relationship Engine
  if (finance.deltas.popularidade) {
    popularityGain += finance.deltas.popularidade
  }
  messages.push(...finance.messages)

  if (activity.type !== 'train' && activity.type !== 'rest') {
    deltas.energia += 5
  }

  const calendar = advanceCalendar(state)

  // Relationship Engine — ações da semana alteram coach/gm/teammates/fans/press/sponsors/agent
  const relResult = processWeeklyRelationships({
    relationships: state.relationships,
    status: state.status,
    activity,
    chemDelta,
    popularityGain,
    trainingSuccess,
    injured: Boolean(injury && !state.injury),
    week: calendar.currentWeek,
    seasonNumber: calendar.currentSeason,
  })
  messages.push(...relResult.messages)

  // Status: deltas de energia/motivação/dinheiro + espelho dos relacionamentos
  let status = applyStatusDeltas(relResult.status, {
    energia: deltas.energia,
    motivacao: deltas.motivacao + (relResult.effects.motivationAura ?? 0),
    felicidade: deltas.felicidade,
    dinheiro: deltas.dinheiro,
  })
  status = {
    ...status,
    relTreinador: relResult.relationships.coach,
    relCompanheiros: relResult.relationships.teammates,
    popularidade: Math.round(
      (relResult.relationships.fans + relResult.relationships.press) / 2,
    ),
  }

  if (calendar.seasonRolled) {
    messages.push(`Nova temporada! Temporada ${calendar.currentSeason} começa.`)
  }

  // Balance Engine — idade, rookies e decadência no roll de temporada
  const balanceResult = processSeasonalBalance({
    player,
    gm: state.gm,
    seasonRolled: calendar.seasonRolled,
    resolvePlayer,
    rng,
  })
  player = balanceResult.player
  const gmAfterBalance = balanceResult.gm ?? state.gm
  messages.push(...balanceResult.messages)

  const playerStats = syncPlayerStatsFromDetailed(player)

  // Progression Engine — XP semanal (Balance + Relationship)
  const progResult = processWeeklyProgression(
    {
      ...state,
      status,
      injury,
      player,
      relationshipEffects: relResult.effects,
    },
    activity,
    rng,
  )
  messages.push(...progResult.messages)

  // Season Engine — atualiza toda a liga na semana avançada
  // Guarda a temporada anterior para o History Engine arquivar no roll
  const previousSeason = state.season
  const seasonResult = processWeeklySeason(
    {
      ...state,
      status,
      injury,
      gm: gmAfterBalance,
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

  // General Manager Engine — decisões automáticas das franquias
  const gmResult = processWeeklyGm(
    {
      ...state,
      injury,
      season: seasonResult.season,
      currentWeek: calendar.currentWeek,
      currentSeason: calendar.currentSeason,
      gm: gmAfterBalance,
    },
    {
      week: calendar.currentWeek,
      phase: seasonResult.phase,
      seasonRolled: calendar.seasonRolled,
      rng,
    },
  )
  messages.push(...gmResult.messages)

  // Contract Engine — renovação, FA, opções, buyout, extensões
  const contractResult = processWeeklyContracts(
    {
      ...state,
      player,
      status,
      gm: gmResult.gm,
      season: seasonResult.season,
      contract: state.contract,
      contractEngine: state.contractEngine,
      pendingContractOffer: state.pendingContractOffer,
      currentTeamId: state.currentTeamId,
      relationships: relResult.relationships,
    },
    {
      week: calendar.currentWeek,
      seasonNumber: calendar.currentSeason,
      seasonRolled: calendar.seasonRolled,
      phase: seasonResult.phase,
      rng,
    },
  )
  messages.push(...contractResult.messages)

  // History Engine — arquivo permanente (antes do reset já capturado em previousSeason)
  const historyResult = processWeeklyHistory({
    leagueHistory: state.leagueHistory,
    previousSeason: calendar.seasonRolled ? previousSeason : null,
    seasonRolled: calendar.seasonRolled,
    weekResults: seasonResult.weekResults ?? [],
    week: calendar.currentWeek,
    seasonNumber: calendar.currentSeason,
    gmDecisions: gmResult.decisions ?? gmResult.summary?.decisions ?? [],
    gm: gmResult.gm,
  })
  messages.push(...historyResult.messages)

  // News Engine — manchetes da liga com base nos fatos da semana
  const newsResult = processWeeklyNews({
    week: calendar.currentWeek,
    seasonNumber: calendar.currentSeason,
    playerTeamId: state.currentTeamId,
    playerName: state.playerName ?? player?.nome,
    careerInjury: injury,
    seasonSummary: seasonResult.summary,
    gmSummary: gmResult.summary,
    gmState: gmResult.gm,
    previousSeason: { objectives: state.gm?.objectives ?? {} },
    newsFeed: state.newsFeed ?? [],
  })
  messages.push(...newsResult.messages)

  // impacto das notícias no status + relacionamentos
  for (const [k, v] of Object.entries(newsResult.deltas ?? {})) {
    if (!v) continue
    deltas[k] = (deltas[k] ?? 0) + v
  }
  const newsRel = applyEventToRelationships(
    relResult.relationships,
    newsResult.deltas ?? {},
    { reason: 'news' },
  )
  let statusWithNews = applyStatusDeltas(status, newsResult.deltas)
  statusWithNews = syncStatusFromRelationships(
    statusWithNews,
    newsRel.relationships,
  )
  const relationshipEffects = calculateRelationshipEffects(newsRel.relationships)
  const careerVariablesWithNews = syncLegacyCareerVariables(statusWithNews)

  let nextState = {
    ...state,
    player,
    playerStats,
    status: statusWithNews,
    careerVariables: careerVariablesWithNews,
    relationships: newsRel.relationships,
    relationshipEffects,
    playingTimeShare: relationshipEffects.playingTimeShare,
    contract: contractResult.contract,
    contractEngine: contractResult.contractEngine,
    pendingContractOffer: contractResult.pendingContractOffer,
    currentTeamId:
      contractResult.currentTeamId ?? state.currentTeamId,
    sponsorships,
    finance: finance.finance,
    injury,
    progression: progResult.nextProgression,
    season: seasonResult.season,
    gm: gmResult.gm,
    leagueHistory: historyResult.leagueHistory,
    weekNews: newsResult.weekNews,
    newsFeed: newsResult.newsFeed,
    currentWeek: calendar.currentWeek,
    currentSeason: calendar.currentSeason,
    lastEvent: messages[messages.length - 1] ?? activity.label,
    pendingEvent: null,
  }

  // Evita dois pendentes na mesma semana — contrato tem prioridade
  if (!nextState.pendingContractOffer) {
    const eventRoll = triggerEvent(
      nextState,
      { activityType: activity.type, activityId: activity.id },
      { rng },
    )

    if (eventRoll.triggered) {
      nextState = eventRoll.nextState
      messages.push(
        `Evento: ${eventRoll.event.categoriaLabel} — escolha pendente.`,
      )
    }
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
    contract: contractResult.contract,
    contracts: contractResult.summary,
    progression: {
      xpGain: progResult.xpGain,
      leveledUp: progResult.leveledUp,
      levelsGained: progResult.levelsGained,
      pointsGained: progResult.pointsGained,
      snapshot: progResult.nextProgression,
    },
    season: seasonResult.summary,
    gm: gmResult.summary,
    balance: balanceResult.summary,
    relationships: relResult.summary,
    historyEngine: historyResult.summary,
    news: newsResult.summary,
    weekNews: newsResult.weekNews,
    pendingEvent: nextState.pendingEvent,
    pendingContractOffer: nextState.pendingContractOffer,
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
