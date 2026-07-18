import { getActivity, WEEKLY_ACTIVITIES } from '../../data/career/activities'
import { WEEKS_PER_SEASON } from '../../data/constants/career'
import { triggerStory } from '../story'
import { processWeeklyProgression } from '../progression'
import {
  calcTeammateChemistryDelta,
  sortActivitiesByPersonality,
  suggestWeeklyActivity,
} from '../personality'
import { processSeasonalBalance } from '../balance'
import { processWeeklyChemistry } from '../chemistry'
import {
  buildCoachEffects,
  deriveMedicalStaffFromCoach,
  ensureLeagueCoaches,
  getTeamCoach,
  mergeCoachIntoRelationshipEffects,
  processWeeklyCoaches,
} from '../coaches'
import { processWeeklyContracts } from '../contracts'
import { processWeeklyInjuries } from '../injuries'
import { processWeeklyNews } from '../news'
import { clamp } from '../utils/math'
import {
  applyEventToRelationships,
  applyRelationshipDelta,
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
import { processWeeklyAchievements } from '../achievements'
import { processWeeklyAnalytics } from '../analytics'
import { processWeeklyDna } from '../dna'
import { processWeeklyDefense } from '../defense'
import { processWeeklyFatigue } from '../fatigue'
import { processWeeklyPlaybooks } from '../playbook'
import { processWeeklyHistory } from '../history'
import { processWeeklySeason } from '../season'
import {
  applyLeagueExpansion,
  hydrateExpansionState,
} from '../expansion'
import { processWeeklyDynasty } from '../dynasty'
import { processWeeklyLegacy } from '../legacy'
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
      error: 'Resolva a história pendente antes de avançar a semana.',
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
  let injuryEngine = state.injuryEngine
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
  } else if (activity.type === 'rest') {
    deltas.energia += Math.abs(activity.energyCost)
    deltas.motivacao += 4
    messages.push('Descanso completo — corpo e mente recuperados.')
  } else if (activity.type === 'recovery') {
    deltas.energia += 15
    deltas.motivacao += 3
    messages.push('Sessão de fisioterapia intensiva.')
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

  // Coach Engine — staff médico e efeitos da decisão anterior
  const coachesEarly = ensureLeagueCoaches(state.gm?.coaches, {
    seasonNumber: state.currentSeason,
  })
  const careerCoachEarly = getTeamCoach(coachesEarly, state.currentTeamId)
  const lastCoachDecision =
    [...(coachesEarly.lastDecisions ?? [])]
      .reverse()
      .find((d) => d.teamId === state.currentTeamId) ?? null
  const earlyCoachEffects = careerCoachEarly
    ? buildCoachEffects(careerCoachEarly, lastCoachDecision)
    : null
  const medicalStaff =
    deriveMedicalStaffFromCoach(careerCoachEarly) ??
    clamp(
      Math.round(
        42 +
          (state.relationships?.coach ?? 50) * 0.28 +
          (priorRelEffects?.chemistryBonus ?? 0),
      ),
      28,
      92,
    )
  const projectedStatus = {
    ...state.status,
    energia: clamp(
      (state.status.energia ?? 70) + (deltas.energia ?? 0),
      0,
      100,
    ),
  }

  // Fatigue Engine — carga (viagem, B2B, minutos, overload) + recuperação
  const fatigueResult = processWeeklyFatigue({
    fatigue: state.fatigue,
    player,
    status: projectedStatus,
    activity,
    season: state.season,
    currentTeamId: state.currentTeamId,
    week: state.currentWeek,
    seasonNumber: state.currentSeason,
    playingTimeShare:
      state.playingTimeShare ?? priorRelEffects.playingTimeShare ?? 24,
    medicalStaff,
    seasonRolled: false,
  })
  let fatigue = fatigueResult.fatigue
  messages.push(...fatigueResult.messages)

  const injuryResult = processWeeklyInjuries({
    injuryEngine,
    injury,
    player,
    status: projectedStatus,
    activity,
    playingTimeShare:
      state.playingTimeShare ?? priorRelEffects.playingTimeShare ?? 24,
    medicalStaff,
    week: state.currentWeek,
    seasonNumber: state.currentSeason,
    fatigueComposite: fatigue.composite,
    fatigueInjuryBonus: fatigue.effects?.injuryChanceBonus ?? 0,
    rng,
  })
  injuryEngine = injuryResult.injuryEngine
  injury = injuryResult.injury
  messages.push(...injuryResult.messages)

  if (!state.injury && injury) {
    deltas.motivacao -= 8
    deltas.energia -= 10
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
    const seasonReset = processWeeklyFatigue({
      fatigue: fatigue,
      player,
      status,
      activity: { type: 'rest' },
      season: state.season,
      currentTeamId: state.currentTeamId,
      week: calendar.currentWeek,
      seasonNumber: calendar.currentSeason,
      playingTimeShare:
        state.playingTimeShare ?? priorRelEffects.playingTimeShare ?? 24,
      medicalStaff,
      seasonRolled: true,
    })
    fatigue = seasonReset.fatigue
    messages.push(...seasonReset.messages)
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

  // Progression Engine — XP semanal (Balance + Relationship + Coach)
  const progRelEffects = mergeCoachIntoRelationshipEffects(
    relResult.effects,
    earlyCoachEffects,
  )
  const progResult = processWeeklyProgression(
    {
      ...state,
      status,
      injury,
      fatigue,
      player,
      relationshipEffects: progRelEffects,
    },
    activity,
    rng,
  )
  messages.push(...progResult.messages)

  // Season Engine — atualiza toda a liga na semana avançada
  // Guarda a temporada anterior para o History Engine arquivar no roll
  const previousSeason = state.season
  let gmPipeline = gmAfterBalance
  let expansionState = hydrateExpansionState(state.expansion)
  let expansionDecisions = []

  // Expansion Engine — após N temporadas: novas franquias + Expansion Draft
  // Roda no roll, ANTES do reset do calendário da Season Engine
  if (calendar.seasonRolled) {
    const expansionResult = applyLeagueExpansion({
      gm: gmPipeline,
      expansion: expansionState,
      previousSeasonNumber:
        previousSeason?.seasonNumber ?? state.currentSeason,
      newSeasonNumber: calendar.currentSeason,
      rng,
    })
    gmPipeline = expansionResult.gm
    expansionState = expansionResult.expansion
    expansionDecisions = expansionResult.decisions ?? []
    messages.push(...(expansionResult.messages ?? []))
  }

  const seasonResult = processWeeklySeason(
    {
      ...state,
      status,
      injury,
      fatigue,
      gm: gmPipeline,
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

  // Momentum Engine — captura o jogo do time da carreira (última partida)
  const playerGame = (seasonResult.weekResults ?? []).find(
    (g) =>
      g.homeId === state.currentTeamId || g.awayId === state.currentTeamId,
  )
  const lastMomentum = playerGame?.momentum ?? state.lastMomentum ?? null
  if (playerGame?.momentum) {
    const h = playerGame.momentum.home?.value ?? 50
    const a = playerGame.momentum.away?.value ?? 50
    messages.push(
      `Momentum Engine: ${playerGame.homeShort} ${Math.round(h)} · ${playerGame.awayShort} ${Math.round(a)}.`,
    )
  }

  // General Manager Engine — decisões automáticas das franquias
  const gmResult = processWeeklyGm(
    {
      ...state,
      injury,
      season: seasonResult.season,
      currentWeek: calendar.currentWeek,
      currentSeason: calendar.currentSeason,
      gm: gmPipeline,
    },
    {
      week: calendar.currentWeek,
      phase: seasonResult.phase,
      seasonRolled: calendar.seasonRolled,
      rng,
    },
  )
  if (expansionDecisions.length) {
    gmResult.gm = {
      ...gmResult.gm,
      lastWeekDecisions: [
        ...expansionDecisions,
        ...(gmResult.gm.lastWeekDecisions ?? []),
      ],
      log: [...(gmResult.gm.log ?? []), ...expansionDecisions].slice(-80),
    }
    gmResult.decisions = [
      ...expansionDecisions,
      ...(gmResult.decisions ?? []),
    ]
    gmResult.summary = {
      ...gmResult.summary,
      decisions: gmResult.decisions,
      decisionsCount: gmResult.decisions.length,
      expansion: expansionState.expanded,
    }
  }
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

  // Chemistry Engine — pares (−100…+100): tempo, W/L, treino, discussões
  const chemResult = processWeeklyChemistry({
    chemistry: gmResult.gm?.chemistry,
    gm: gmResult.gm,
    weekResults: seasonResult.weekResults ?? [],
    activityType: activity.type,
    careerPlayerId: player?.id ?? 'career_player',
    careerTeamId: contractResult.currentTeamId ?? state.currentTeamId,
    eventTeammateDelta:
      relResult.summary?.applied?.teammates ?? chemDelta ?? 0,
    relationshipBonus: relResult.effects?.chemistryBonus ?? 0,
  })
  messages.push(...chemResult.messages)
  const gmWithChemistry = chemResult.gm ?? gmResult.gm

  // Coach Engine — decisões automáticas (minutos, foco, estilo, relação)
  const coachResult = processWeeklyCoaches({
    coaches: gmWithChemistry?.coaches,
    gm: gmWithChemistry,
    careerTeamId: contractResult.currentTeamId ?? state.currentTeamId,
    player,
    relationships: relResult.relationships,
    activityType: activity.type,
    trainingSuccess,
    injured: Boolean(injury),
    highFatigue: Boolean(fatigue?.effects?.highFatigue),
    weekResults: seasonResult.weekResults ?? [],
    week: calendar.currentWeek,
    seasonNumber: calendar.currentSeason,
    seasonRolled: calendar.seasonRolled,
    rng,
  })
  messages.push(...coachResult.messages)
  const gmWithCoaches = coachResult.gm ?? gmWithChemistry

  // Defensive Engine — preferências defensivas do coach
  const defenseResult = processWeeklyDefense({
    coaches: gmWithCoaches?.coaches,
    gm: gmWithCoaches,
  })
  messages.push(...defenseResult.messages)
  const gmWithDefense = defenseResult.gm ?? gmWithCoaches

  // Playbook Engine — garante jogadas por franquia (alinha ao coach)
  const playbookResult = processWeeklyPlaybooks({
    playbooks: gmWithDefense?.playbooks,
    gm: gmWithDefense,
    seasonRolled: calendar.seasonRolled,
  })
  messages.push(...playbookResult.messages)
  const gmWithPlaybooks = playbookResult.gm ?? gmWithDefense

  // Player DNA Engine — evolução lenta da identidade (preso à âncora)
  const dnaResult = processWeeklyDna({
    player,
    gm: gmWithPlaybooks,
    currentTeamId: contractResult.currentTeamId ?? state.currentTeamId,
    week: calendar.currentWeek,
    activityType: activity.type,
    weekResults: seasonResult.weekResults ?? [],
    playingTimeShare:
      state.playingTimeShare ?? priorRelEffects.playingTimeShare ?? 24,
  })
  player = dnaResult.player ?? player
  const gmWithDna = dnaResult.gm ?? gmWithPlaybooks
  messages.push(...dnaResult.messages)

  // Analytics Engine — estatísticas avançadas (PER, TS%, ratings, WS, PIE…)
  const analyticsResult = processWeeklyAnalytics({
    analytics: state.analytics,
    weekResults: seasonResult.weekResults ?? [],
    seasonNumber: calendar.currentSeason,
    seasonRolled: calendar.seasonRolled,
    careerPlayerId: player?.id ?? 'career_player',
  })
  messages.push(...analyticsResult.messages)

  // History Engine — arquivo permanente (antes do reset já capturado em previousSeason)
  const historyResult = processWeeklyHistory({
    leagueHistory: state.leagueHistory,
    previousSeason: calendar.seasonRolled ? previousSeason : null,
    seasonRolled: calendar.seasonRolled,
    weekResults: seasonResult.weekResults ?? [],
    week: calendar.currentWeek,
    seasonNumber: calendar.currentSeason,
    gmDecisions: gmResult.decisions ?? gmResult.summary?.decisions ?? [],
    gm: gmWithDna,
    expansion: expansionState,
  })
  messages.push(...historyResult.messages)

  // Dynasty Engine — detecta dinastias no arquivo (após History, antes de News)
  const dynastyResult = processWeeklyDynasty({
    dynasty: state.dynasty,
    leagueHistory: historyResult.leagueHistory,
    seasonRolled: calendar.seasonRolled,
    seasonNumber: calendar.currentSeason,
    gm: gmWithDna,
  })
  messages.push(...dynastyResult.messages)
  if (dynastyResult.decisions?.length) {
    gmResult.decisions = [
      ...(gmResult.decisions ?? []),
      ...dynastyResult.decisions,
    ]
    gmResult.summary = {
      ...gmResult.summary,
      decisions: gmResult.decisions,
      decisionsCount: gmResult.decisions.length,
      dynasty: dynastyResult.summary,
    }
  }
  const gmAfterDynasty = dynastyResult.gm ?? gmWithDna
  const leagueHistoryAfterDynasty = dynastyResult.leagueHistory
  const dynastyState = dynastyResult.dynasty

  // Legacy Engine — Legacy Score (após History/Dynasty, antes de News/Story)
  const legacyResult = processWeeklyLegacy({
    legacy: state.legacy,
    leagueHistory: leagueHistoryAfterDynasty,
    gm: gmAfterDynasty,
    analytics: analyticsResult.analytics,
    dynasty: dynastyState,
    player,
    status,
    seasonNumber: calendar.currentSeason,
    seasonRolled: calendar.seasonRolled,
  })
  messages.push(...legacyResult.messages)
  if (legacyResult.decisions?.length) {
    gmResult.decisions = [
      ...(gmResult.decisions ?? []),
      ...legacyResult.decisions,
    ]
    gmResult.summary = {
      ...gmResult.summary,
      decisions: gmResult.decisions,
      decisionsCount: gmResult.decisions.length,
      legacy: legacyResult.summary,
    }
  }
  const leagueHistoryAfterLegacy = legacyResult.leagueHistory
  const legacyState = legacyResult.legacy
  if (legacyResult.popularityDelta) {
    deltas.popularidade =
      (deltas.popularidade ?? 0) + legacyResult.popularityDelta
  }

  // News Engine — manchetes da liga com base nos fatos da semana
  const newsResult = processWeeklyNews({
    week: calendar.currentWeek,
    seasonNumber: calendar.currentSeason,
    playerTeamId: state.currentTeamId,
    playerName: state.playerName ?? player?.nome,
    careerInjury: injury,
    seasonSummary: seasonResult.summary,
    gmSummary: gmResult.summary,
    gmState: gmAfterDynasty,
    previousSeason: { objectives: state.gm?.objectives ?? {} },
    newsFeed: state.newsFeed ?? [],
  })
  messages.push(...newsResult.messages)

  // impacto das notícias no status + relacionamentos
  for (const [k, v] of Object.entries(newsResult.deltas ?? {})) {
    if (!v) continue
    deltas[k] = (deltas[k] ?? 0) + v
  }
  let newsRel = applyEventToRelationships(
    relResult.relationships,
    newsResult.deltas ?? {},
    { reason: 'news' },
  )
  // Coach → relação com atletas
  if (coachResult.effects?.relationDelta) {
    newsRel = {
      ...newsRel,
      relationships: applyRelationshipDelta(
        newsRel.relationships,
        'coach',
        coachResult.effects.relationDelta,
        { reason: 'coach_engine' },
      ).relationships,
    }
  }
  let statusWithNews = applyStatusDeltas(status, newsResult.deltas)
  statusWithNews = syncStatusFromRelationships(
    statusWithNews,
    newsRel.relationships,
  )
  if (coachResult.effects?.motivationAura) {
    statusWithNews = applyStatusDeltas(statusWithNews, {
      motivacao: coachResult.effects.motivationAura,
    })
  }
  const relationshipEffects = mergeCoachIntoRelationshipEffects(
    calculateRelationshipEffects(newsRel.relationships),
    coachResult.effects,
  )
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
    injuryEngine,
    fatigue,
    lastMomentum,
    expansion: expansionState,
    dynasty: dynastyState,
    legacy: legacyState,
    progression: progResult.nextProgression,
    season: seasonResult.season,
    gm: gmAfterDynasty,
    leagueHistory: leagueHistoryAfterLegacy,
    analytics: analyticsResult.analytics,
    weekNews: newsResult.weekNews,
    newsFeed: newsResult.newsFeed,
    currentWeek: calendar.currentWeek,
    currentSeason: calendar.currentSeason,
    lastEvent: messages[messages.length - 1] ?? activity.label,
    pendingEvent: null,
  }

  // Story Engine — história procedural (cadeias narrativas)
  // Evita dois pendentes na mesma semana — contrato tem prioridade
  if (!nextState.pendingContractOffer) {
    const storyRoll = triggerStory(
      nextState,
      { activityType: activity.type, activityId: activity.id },
      { rng },
    )

    if (storyRoll.triggered) {
      nextState = storyRoll.nextState
      const kind =
        storyRoll.mode === 'continuation' ? 'continuação' : 'nova história'
      messages.push(
        `Story Engine (${kind}): ${storyRoll.event.categoriaLabel} — escolha pendente.`,
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
    injuryEngine: injuryResult.summary,
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
    chemistry: chemResult.summary,
    coaches: coachResult.summary,
    scouting: gmResult.summary?.scouting ?? null,
    historyEngine: historyResult.summary,
    analytics: analyticsResult.summary,
    dna: dnaResult.summary,
    playbook: playbookResult.summary,
    defense: defenseResult.summary,
    fatigue: fatigueResult.summary,
    momentum: lastMomentum,
    expansion: {
      expanded: expansionState.expanded,
      expandedAtSeason: expansionState.expandedAtSeason,
      teamIds: expansionState.expansionTeamIds,
      calendarVersion: expansionState.calendarVersion,
      picks: expansionState.lastExpansionDraft?.picks?.length ?? 0,
    },
    dynasty: dynastyResult.summary,
    legacy: legacyResult.summary,
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

  // Achievement Engine — progresso + desbloqueios (após careerStats)
  const achResult = processWeeklyAchievements({
    achievements: nextState.achievements ?? state.achievements,
    state: nextState,
    effects,
  })
  nextState = achResult.state
  messages.push(...achResult.messages)
  effects.messages = messages
  effects.achievements = achResult.summary
  nextState.lastWeekResult = effects

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
