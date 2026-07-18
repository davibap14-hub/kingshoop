import {
  BASE_XP_TO_LEVEL,
  EVOLUTION_POINTS_PER_LEVEL,
  MAX_LEVEL,
  WEEKLY_XP_BY_ACTIVITY,
  XP_GROWTH_RATE,
} from '../../data/progression/constants'
import { balanceXpGain } from '../balance'
import { applyPersonalityToXp } from '../personality/development'
import { clamp } from '../utils/math'

/** XP necessário para ir de `level` → `level + 1` */
export function xpRequiredForLevel(level) {
  if (level >= MAX_LEVEL) return Infinity
  return Math.round(BASE_XP_TO_LEVEL * XP_GROWTH_RATE ** (level - 1))
}

export function createProgressionState(overrides = {}) {
  const level = overrides.level ?? 1
  return {
    level,
    xp: overrides.xp ?? 0,
    xpToNext: overrides.xpToNext ?? xpRequiredForLevel(level),
    evolutionPoints: overrides.evolutionPoints ?? 0,
    totalXpEarned: overrides.totalXpEarned ?? 0,
    levelsGainedTotal: overrides.levelsGainedTotal ?? 0,
  }
}

/**
 * Calcula XP ganho na semana (gradual, depende da atividade e status).
 */
export function calcWeeklyXp(state, activity, rng = Math.random) {
  const table = WEEKLY_XP_BY_ACTIVITY[activity?.type] ?? { base: 12, bonus: 0 }
  let xp = table.base + Math.floor(rng() * (table.bonus + 1))

  const energy = state.status?.energia ?? 50
  const motivation = state.status?.motivacao ?? 50

  // Modificadores leves — evolução gradual, sem explosões
  if (energy >= 70) xp += 3
  if (energy < 25) xp = Math.round(xp * 0.65)
  if (motivation >= 75) xp += 2
  if (motivation < 30) xp = Math.round(xp * 0.8)
  if (state.injury) xp = Math.round(xp * 0.55)

  // Treino no grupo favorece um pouco mais de XP
  if (activity?.type === 'train') {
    xp += 2
  }

  xp = applyPersonalityToXp(xp, state.player)

  // Relationship Engine — coach / companheiros influenciam XP
  if (state.relationshipEffects?.xpMultiplier) {
    xp = Math.round(xp * state.relationshipEffects.xpMultiplier)
  }

  return balanceXpGain(xp, {
    player: state.player,
    progression: state.progression,
  })
}

/**
 * Aplica XP e resolve level-ups. Retorna progression + meta.
 */
export function applyXpGain(progression, xpGain) {
  if (!xpGain || xpGain <= 0) {
    return {
      progression: { ...progression },
      leveledUp: false,
      levelsGained: 0,
      pointsGained: 0,
      xpGain: 0,
      messages: [],
    }
  }

  let { level, xp, xpToNext, evolutionPoints, totalXpEarned, levelsGainedTotal } =
    progression

  xp += xpGain
  totalXpEarned += xpGain
  let levelsGained = 0
  let pointsGained = 0
  const messages = [`+${xpGain} XP.`]

  while (level < MAX_LEVEL && xp >= xpToNext) {
    xp -= xpToNext
    level += 1
    levelsGained += 1
    levelsGainedTotal += 1
    const pts = EVOLUTION_POINTS_PER_LEVEL
    evolutionPoints += pts
    pointsGained += pts
    xpToNext = xpRequiredForLevel(level)
    messages.push(`Level up! Nível ${level}. +${pts} ponto(s) de evolução.`)
  }

  if (level >= MAX_LEVEL) {
    xp = 0
    xpToNext = 0
  }

  return {
    progression: {
      level,
      xp,
      xpToNext,
      evolutionPoints,
      totalXpEarned,
      levelsGainedTotal,
    },
    leveledUp: levelsGained > 0,
    levelsGained,
    pointsGained,
    xpGain,
    messages,
  }
}

export function clampProgression(progression) {
  return {
    ...progression,
    level: clamp(progression.level, 1, MAX_LEVEL),
    evolutionPoints: Math.max(0, progression.evolutionPoints ?? 0),
    xp: Math.max(0, progression.xp ?? 0),
  }
}
