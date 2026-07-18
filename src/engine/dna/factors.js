import { ensurePlayerDna } from './normalize.js'

function dnaOf(player) {
  return ensurePlayerDna(player)?.dna ?? null
}

/**
 * Contribuição do DNA para cada papel de decisão.
 * Dois jogadores com os mesmos atributos diferem aqui.
 */
export function dnaFactors(player, role) {
  const dna = dnaOf(player)
  if (!dna) return 50

  const score = (parts) => {
    const total = parts.reduce((s, [v, weight]) => s + v * weight, 0)
    const weightSum = parts.reduce((s, [, weight]) => s + weight, 0)
    return total / Math.max(1, weightSum)
  }

  switch (role) {
    case 'ball_handler':
      return score([
        [dna.ritmo, 0.22],
        [dna.criatividade, 0.2],
        [dna.preferenciaPasse, 0.18],
        [dna.assumirResponsabilidade, 0.16],
        [dna.confianca, 0.12],
        [100 - dna.tendenciaErros, 0.12],
      ])

    case 'cutter':
      return score([
        [dna.ritmo, 0.2],
        [dna.preferenciaInfiltracao, 0.28],
        [dna.agressividade, 0.18],
        [dna.criatividade, 0.14],
        [dna.confianca, 0.1],
        [100 - dna.tendenciaErros, 0.1],
      ])

    case 'receiver':
    case 'shoot':
      return score([
        [dna.preferenciaArremesso, 0.26],
        [dna.confianca, 0.18],
        [dna.consistencia, 0.16],
        [dna.clutch, 0.14],
        [dna.criatividade, 0.1],
        [100 - dna.tendenciaErros, 0.08],
        [dna.ritmo, 0.08],
      ])

    case 'screen':
    case 'screener':
      return score([
        [dna.assumirResponsabilidade, 0.28],
        [dna.consistencia, 0.22],
        [dna.agressividade, 0.16],
        [100 - dna.tendenciaErros, 0.14],
        [dna.ritmo, 0.1],
        [dna.confianca, 0.1],
      ])

    case 'isolation':
      return score([
        [dna.agressividade, 0.22],
        [dna.preferenciaInfiltracao, 0.2],
        [dna.confianca, 0.16],
        [dna.assumirResponsabilidade, 0.14],
        [dna.criatividade, 0.12],
        [dna.clutch, 0.1],
        [100 - dna.preferenciaPasse, 0.06],
      ])

    case 'drive':
      return score([
        [dna.preferenciaInfiltracao, 0.3],
        [dna.agressividade, 0.22],
        [dna.ritmo, 0.16],
        [dna.confianca, 0.14],
        [dna.criatividade, 0.1],
        [100 - dna.tendenciaErros, 0.08],
      ])

    case 'pass':
      return score([
        [dna.preferenciaPasse, 0.32],
        [dna.criatividade, 0.22],
        [dna.assumirResponsabilidade, 0.14],
        [dna.consistencia, 0.12],
        [100 - dna.tendenciaErros, 0.12],
        [dna.ritmo, 0.08],
      ])

    case 'steal':
      return score([
        [dna.agressividade, 0.3],
        [dna.ritmo, 0.18],
        [dna.confianca, 0.14],
        [100 - dna.tendenciaErros, 0.16],
        [dna.consistencia, 0.12],
        [dna.criatividade, 0.1],
      ])

    case 'contest':
      return score([
        [dna.agressividade, 0.22],
        [dna.consistencia, 0.2],
        [dna.assumirResponsabilidade, 0.18],
        [100 - dna.tendenciaErros, 0.16],
        [dna.confianca, 0.12],
        [dna.ritmo, 0.12],
      ])

    case 'rebound':
      return score([
        [dna.agressividade, 0.24],
        [dna.assumirResponsabilidade, 0.22],
        [dna.consistencia, 0.18],
        [dna.confianca, 0.14],
        [100 - dna.tendenciaErros, 0.12],
        [dna.ritmo, 0.1],
      ])

    default:
      return score([
        [dna.confianca, 0.25],
        [dna.consistencia, 0.25],
        [dna.ritmo, 0.2],
        [dna.criatividade, 0.15],
        [100 - dna.tendenciaErros, 0.15],
      ])
  }
}

/** Bias de set ofensivo pelo DNA do ball-handler (0–100). */
export function dnaSetBias(handler, setId) {
  if (!handler) return 50
  const dna = dnaOf(handler)
  if (!dna) return 50

  const map = {
    pick_and_roll:
      dna.preferenciaPasse * 0.35 +
      dna.criatividade * 0.25 +
      dna.ritmo * 0.15 +
      dna.assumirResponsabilidade * 0.1,
    isolation:
      dna.agressividade * 0.3 +
      dna.preferenciaInfiltracao * 0.22 +
      dna.confianca * 0.18 +
      dna.assumirResponsabilidade * 0.12,
    drive:
      dna.preferenciaInfiltracao * 0.35 +
      dna.agressividade * 0.2 +
      dna.ritmo * 0.18 +
      dna.criatividade * 0.1,
    post_up:
      dna.preferenciaInfiltracao * 0.22 +
      dna.assumirResponsabilidade * 0.22 +
      dna.confianca * 0.18 +
      dna.consistencia * 0.12,
    cut:
      dna.preferenciaPasse * 0.28 +
      dna.criatividade * 0.22 +
      dna.ritmo * 0.2 +
      dna.preferenciaInfiltracao * 0.12,
    fast_break:
      dna.preferenciaContraAtaque * 0.45 +
      dna.ritmo * 0.28 +
      dna.agressividade * 0.12,
  }

  return Math.max(1, Math.min(99, map[setId] ?? 50))
}

/** Multiplicadores de qualidade de execução (shoot / TO / etc.). */
export function dnaExecutionModifiers(player, context = {}) {
  const dna = dnaOf(player)
  if (!dna) {
    return {
      shotQuality: 1,
      turnoverRisk: 1,
      passQuality: 1,
      driveQuality: 1,
      pace: 1,
      transition: 1,
    }
  }

  const clutchBoost = context.clutch ? (dna.clutch - 50) * 0.0022 : 0
  const consistency = (dna.consistencia - 50) * 0.0018
  const confidence = (dna.confianca - 50) * 0.0015
  const errorRisk = (dna.tendenciaErros - 50) * 0.0025
  const creativity = (dna.criatividade - 50) * 0.0012

  return {
    shotQuality: 1 + clutchBoost + consistency + confidence + creativity * 0.4,
    turnoverRisk: 1 + errorRisk - consistency * 0.5,
    passQuality:
      1 + (dna.preferenciaPasse - 50) * 0.0018 + creativity,
    driveQuality:
      1 +
      (dna.preferenciaInfiltracao - 50) * 0.002 +
      (dna.agressividade - 50) * 0.0012,
    pace: 1 + (dna.ritmo - 50) * 0.0024,
    transition: 1 + (dna.preferenciaContraAtaque - 50) * 0.0022,
  }
}
