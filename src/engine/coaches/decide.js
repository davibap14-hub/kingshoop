import {
  COACH_DECISION_WEIGHTS,
  PRACTICE_FOCI,
} from '../../data/coaches'
import { TEAM_STYLES } from '../../data/ai/styles'
import { rankStylesForRoster } from '../ai/profile'
import { combineScore, weightedSelect } from '../simulation/weights'
import { clamp } from '../utils/math'
import { normalizeCoach } from './state.js'

/**
 * Decide o foco de treino da semana — pesos de atributos + resultados.
 * Nunca escolha uniforme.
 */
export function decidePracticeFocus(coach, context = {}, rng = Math.random) {
  const c = normalizeCoach(coach)
  const w = COACH_DECISION_WEIGHTS.practiceFocus
  const losses = Number(context.recentLosses) || 0
  const wins = Number(context.recentWins) || 0

  const entries = [
    {
      id: PRACTICE_FOCI.offense.id,
      label: PRACTICE_FOCI.offense.label,
      score: combineScore([
        { value: c.offensiveSystem, weight: w.offensiveSystem },
        { value: wins * 12, weight: w.recentWins },
        { value: 50, weight: 0.3 },
      ]),
    },
    {
      id: PRACTICE_FOCI.defense.id,
      label: PRACTICE_FOCI.defense.label,
      score: combineScore([
        { value: c.defensiveSystem, weight: w.defensiveSystem },
        { value: losses * 18, weight: w.recentLosses },
        { value: c.rigor, weight: 0.45 },
      ]),
    },
    {
      id: PRACTICE_FOCI.development.id,
      label: PRACTICE_FOCI.development.label,
      score: combineScore([
        { value: c.development, weight: w.development },
        { value: c.youthTrust, weight: 0.7 },
        { value: context.hasYoungRoster ? 80 : 40, weight: 0.5 },
      ]),
    },
    {
      id: PRACTICE_FOCI.conditioning.id,
      label: PRACTICE_FOCI.conditioning.label,
      score: combineScore([
        { value: c.rigor, weight: w.rigor },
        { value: losses * 10, weight: 0.4 },
        { value: context.highFatigue ? 85 : 45, weight: 0.55 },
      ]),
    },
    {
      id: PRACTICE_FOCI.morale.id,
      label: PRACTICE_FOCI.morale.label,
      score: combineScore([
        { value: c.motivation, weight: w.motivation },
        { value: losses * 14, weight: 0.5 },
        { value: context.lowMorale ? 88 : 42, weight: 0.6 },
      ]),
    },
  ]

  const pick = weightedSelect(entries, rng)
  return {
    focusId: pick?.id ?? 'offense',
    label: pick?.label ?? 'Ataque',
    score: pick?.score ?? 0.5,
  }
}

/**
 * Decide minutos-alvo do jogador de carreira (0–40).
 * Pesos: juventude, rotação, rigor, relação, idade.
 */
export function decidePlayingTime(coach, context = {}) {
  const c = normalizeCoach(coach)
  const w = COACH_DECISION_WEIGHTS.minutes
  const age = Number(context.age) || 22
  const relCoach = Number(context.coachRelationship) || 55
  const overall = Number(context.overall) || 70
  const isYoung = age <= 23

  const youthScore = isYoung ? c.youthTrust : 100 - c.youthTrust * 0.35
  const rotationScore = c.rotation
  // Rigor alto exige desempenho; overall baixo perde minutos
  const rigorGate = clamp(
    50 + (overall - 70) * 2 + (c.rigor - 50) * 0.3,
    20,
    95,
  )

  const score = combineScore([
    { value: youthScore, weight: w.youthTrust },
    { value: rotationScore, weight: w.rotation },
    { value: rigorGate, weight: w.rigor },
    { value: relCoach, weight: w.relationship },
    { value: c.development, weight: isYoung ? w.development : 0.2 },
    { value: clamp(100 - Math.abs(age - 27) * 4, 30, 100), weight: w.age },
  ])

  // Base 18–36 min a partir do score 0–1
  const minutes = clamp(Math.round(18 + score * 18), 12, 38)
  return {
    minutes,
    minutesModifier: clamp(minutes / 28, 0.55, 1.35),
    score,
    reasons: {
      youthTrust: c.youthTrust,
      rotation: c.rotation,
      rigor: c.rigor,
      relationship: relCoach,
    },
  }
}

/**
 * Decide estilo de jogo: blend coach preferredStyle × fit do elenco.
 * Pesos — sem coin flip entre estilos.
 */
export function decideTeamStyle(coach, players = [], rng = Math.random) {
  const c = normalizeCoach(coach)
  const w = COACH_DECISION_WEIGHTS.style
  const ranked = rankStylesForRoster(players)

  const entries = ranked.map((r) => {
    const preferred = r.id === c.preferredStyleId ? 90 : 45
    const offAlign =
      c.preferredStyleId === 'defensivo'
        ? c.defensiveSystem
        : c.offensiveSystem
    return {
      id: r.id,
      label: r.label,
      fit: r.fit,
      score: combineScore([
        { value: r.fit, weight: w.rosterFit },
        { value: preferred, weight: 1.15 },
        {
          value: r.id === 'defensivo' ? c.defensiveSystem : offAlign,
          weight: w.offensiveSystem,
        },
        {
          value: r.id === 'defensivo' ? c.defensiveSystem : 50,
          weight: w.defensiveSystem * (r.id === 'defensivo' ? 1 : 0.3),
        },
      ]),
    }
  })

  // Se não há ranked, usa preferred
  if (!entries.length) {
    const style = TEAM_STYLES[c.preferredStyleId] ?? TEAM_STYLES.fast_pace
    return {
      styleId: style.id,
      style,
      fit: 55,
      auto: true,
      reason: `Coach ${c.name}: estilo preferido ${style.label}.`,
    }
  }

  const pick = weightedSelect(entries, rng)
  const style = TEAM_STYLES[pick?.id] ?? TEAM_STYLES[c.preferredStyleId]
  return {
    styleId: style.id,
    style,
    fit: pick?.fit ?? 50,
    auto: true,
    reason: `${c.name} optou por ${style.label} (sistema OF ${c.offensiveSystem} / DF ${c.defensiveSystem}).`,
  }
}

/**
 * Delta semanal na relação coach↔atleta (determinístico por pesos).
 */
export function decideRelationDelta(coach, context = {}) {
  const c = normalizeCoach(coach)
  const w = COACH_DECISION_WEIGHTS.relationDelta
  const activityType = context.activityType ?? null
  const focusId = context.focusId ?? null

  let delta = 0
  // Motivação alta eleva; rigor alto sem desempenho tensiona
  delta += Math.round(((c.motivation - 50) * w.motivation) / 12)
  delta += Math.round(((c.development - 50) * w.development) / 14)

  if (context.trainingSuccess) {
    delta += c.rigor >= 70 ? 2 : 1
  } else if (activityType === 'train' && context.trainingSuccess === false) {
    delta -= c.rigor >= 75 ? 2 : 1
  }

  if (activityType === 'coach') delta += 3
  if (activityType === 'rest' && c.rigor >= 70) delta -= 1
  if (focusId === 'morale') delta += 1
  if (focusId === 'conditioning' && c.rigor >= 80) delta -= 1

  if (context.injured) delta -= Math.round(c.rigor / 40)

  return clamp(delta, -4, 5)
}

/**
 * Pacote completo de decisões automáticas da semana.
 */
export function decideCoachWeek(coach, context = {}, rng = Math.random) {
  const practice = decidePracticeFocus(coach, context, rng)
  const minutes = decidePlayingTime(coach, context)
  const style = decideTeamStyle(coach, context.players ?? [], rng)
  const relationDelta = decideRelationDelta(coach, {
    ...context,
    focusId: practice.focusId,
  })

  return {
    practiceFocus: practice,
    playingTime: minutes,
    style,
    relationDelta,
    setBias: { ...(normalizeCoach(coach).setBias ?? {}) },
    coachId: coach?.id,
    coachName: coach?.name,
    week: context.week ?? null,
  }
}
