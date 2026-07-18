import { DNA_KEYS, DNA_WEEKLY_MAX_DELTA } from '../../data/dna/constants.js'
import { clamp } from '../utils/math.js'
import { clampDnaToAnchor, ensurePlayerDna } from './normalize.js'

function clampStat(value) {
  return Math.round(clamp(Number(value) || 50, 1, 99) * 10) / 10
}

function weekSeed(playerId, week) {
  const text = `${playerId ?? 'p'}:${week ?? 0}`
  let hash = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function unit(seed, salt) {
  const x = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

/**
 * Evolução lenta: micro-deltas semanais, presos à âncora.
 * O DNA nunca é reescrito — só se move um pouco.
 */
export function evolvePlayerDna(player, context = {}) {
  const withDnaPlayer = ensurePlayerDna(player)
  const { dna, dnaAnchor } = withDnaPlayer
  const seed = weekSeed(player?.id, context.week ?? 0)
  const next = { ...dna }
  const deltas = []

  DNA_KEYS.forEach((key, index) => {
    if (unit(seed, index + 1) > 0.42) return

    let delta = (unit(seed, index + 40) - 0.5) * DNA_WEEKLY_MAX_DELTA * 2

    if (key === 'confianca' && typeof context.gameGrade === 'number') {
      delta += (context.gameGrade - 70) * 0.012
    }
    if (key === 'clutch' && context.clutchMoment) {
      delta += context.clutchSuccess ? 0.35 : -0.2
    }
    if (key === 'consistencia' && typeof context.minutes === 'number') {
      delta += context.minutes > 32 ? 0.12 : context.minutes < 18 ? -0.08 : 0
    }
    if (key === 'agressividade' && context.highUsage) {
      delta += 0.15
    }
    if (key === 'tendenciaErros' && typeof context.turnovers === 'number') {
      delta += Math.min(0.35, context.turnovers * 0.04)
    }
    if (key === 'assumirResponsabilidade' && context.teamLeader) {
      delta += 0.18
    }
    if (key === 'preferenciaContraAtaque' && context.transitionHeavy) {
      delta += 0.12
    }
    if (key === 'ritmo' && context.transitionHeavy) {
      delta += 0.1
    }

    delta = Math.max(-DNA_WEEKLY_MAX_DELTA, Math.min(DNA_WEEKLY_MAX_DELTA, delta))
    if (Math.abs(delta) < 0.05) return

    const before = next[key]
    next[key] = before + delta
    deltas.push({ key, delta: Number(delta.toFixed(2)), from: before })
  })

  const clamped = clampDnaToAnchor(next, dnaAnchor)
  const applied = deltas
    .map((entry) => ({
      ...entry,
      to: clamped[entry.key],
    }))
    .filter((entry) => Math.abs(entry.to - entry.from) >= 0.05)

  return {
    player: {
      ...withDnaPlayer,
      dna: Object.fromEntries(
        DNA_KEYS.map((key) => [key, clampStat(clamped[key])]),
      ),
      dnaAnchor,
    },
    deltas: applied,
  }
}
