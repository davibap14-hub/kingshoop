import {
  SCOUT_REVEAL_THRESHOLDS,
  SCOUTING_CONFIDENCE_MAX,
  SCOUTING_CONFIDENCE_MIN,
  SCOUTING_MAX_ERROR,
} from '../../data/scouting'
import { PERSONALITY_LABELS } from '../../data/personality/constants'
import { TENDENCY_LABELS } from '../../data/players/schema'
import { clamp } from '../utils/math'
import { hashString } from '../coaches/generate.js'
import { analyzeTrueProfile } from './profile.js'
import { clampInvestment } from './state.js'

/**
 * Ruído determinístico −1…+1 a partir de seed (sem Math.random).
 */
function signedNoise(seed) {
  const h = hashString(seed)
  return ((h % 2001) / 1000) - 1
}

/**
 * Confiança do relatório a partir do investimento (0–100).
 */
export function calcScoutConfidence(investment, opts = {}) {
  const inv = clampInvestment(investment)
  const focus = Number(opts.focusBonus) || 0
  const raw = inv * 0.82 + focus * 0.18
  return clamp(Math.round(raw), SCOUTING_CONFIDENCE_MIN, SCOUTING_CONFIDENCE_MAX)
}

/**
 * Erro máximo residual (pontos de rating) dado investimento.
 * Quanto maior o investimento, menor o erro.
 */
export function calcScoutError(investment) {
  const inv = clampInvestment(investment)
  const accuracy = inv / 100
  return Math.max(1, Math.round(SCOUTING_MAX_ERROR * (1 - accuracy ** 1.15)))
}

function blurValue(trueValue, error, seed) {
  const offset = Math.round(signedNoise(seed) * error)
  return clamp(Math.round(trueValue + offset), 40, 99)
}

function revealCount(thresholds, confidence) {
  let count = 0
  for (const row of thresholds) {
    if (confidence >= row.minConfidence) count = row.count
  }
  return count
}

/**
 * Gera relatório de scouting para um time sobre um jogador/prospect.
 * Informações ficam mais precisas com maior investimento.
 */
export function buildScoutReport(player, teamId, investment, opts = {}) {
  if (!player?.id) return null

  const trueProfile = analyzeTrueProfile(player)
  const confidence = calcScoutConfidence(investment, opts)
  const error = calcScoutError(investment)
  const seedBase = `${teamId}|${player.id}|scout|${opts.week ?? 0}`

  const overallEstimate = blurValue(
    trueProfile.overall,
    error,
    `${seedBase}|ovr`,
  )
  const potentialEstimate = blurValue(
    trueProfile.hiddenPotential,
    error + 2,
    `${seedBase}|pot`,
  )

  // Faixa de potencial oculto — estreita com mais scouting
  const rangePad = Math.max(1, Math.round(error * 0.85))
  const potentialRange = [
    clamp(potentialEstimate - rangePad, 45, 99),
    clamp(potentialEstimate + rangePad, 45, 99),
  ]

  const strengthCount = revealCount(
    SCOUT_REVEAL_THRESHOLDS.strengths,
    confidence,
  )
  const weaknessCount = revealCount(
    SCOUT_REVEAL_THRESHOLDS.weaknesses,
    confidence,
  )

  const strengths = trueProfile.strengths.slice(0, strengthCount).map((s) => ({
    ...s,
    value:
      confidence >= 70
        ? s.value
        : blurValue(s.value, Math.ceil(error * 0.6), `${seedBase}|str|${s.id}`),
  }))

  const weaknesses = trueProfile.weaknesses
    .slice(0, weaknessCount)
    .map((w) => ({
      ...w,
      value:
        confidence >= 70
          ? w.value
          : blurValue(w.value, Math.ceil(error * 0.6), `${seedBase}|wk|${w.id}`),
    }))

  let personalityEstimate = null
  if (confidence >= SCOUT_REVEAL_THRESHOLDS.personality) {
    personalityEstimate = {}
    for (const [key, value] of Object.entries(trueProfile.personality)) {
      personalityEstimate[key] = blurValue(
        value,
        Math.ceil(error * 0.75),
        `${seedBase}|per|${key}`,
      )
    }
  }

  let tendenciesEstimate = null
  if (confidence >= SCOUT_REVEAL_THRESHOLDS.tendencies) {
    tendenciesEstimate = {}
    for (const [key, value] of Object.entries(trueProfile.tendencies)) {
      tendenciesEstimate[key] = blurValue(
        value,
        Math.ceil(error * 0.7),
        `${seedBase}|ten|${key}`,
      )
    }
  }

  // Grade pública A–C baseada na estimativa (não no true)
  const gradeScore = potentialEstimate * 0.6 + overallEstimate * 0.4
  const grade =
    gradeScore >= 88 ? 'A' : gradeScore >= 80 ? 'B+' : gradeScore >= 74 ? 'B' : gradeScore >= 68 ? 'C+' : 'C'

  return {
    playerId: player.id,
    playerName: player.nome,
    posicao: player.posicao,
    idade: player.idade,
    isProspect: Boolean(player.isProspect),
    overallEstimate,
    potentialEstimate,
    potentialRange,
    /** potencial oculto — só engine interna; UI não deve exibir o true */
    _truePotential: trueProfile.hiddenPotential,
    _trueOverall: trueProfile.overall,
    strengths,
    weaknesses,
    personalityEstimate,
    tendenciesEstimate,
    personalityLabels: PERSONALITY_LABELS,
    tendencyLabels: TENDENCY_LABELS,
    confidence,
    errorBand: error,
    grade,
    investment: clampInvestment(investment),
    week: opts.week ?? null,
    seasonNumber: opts.seasonNumber ?? null,
  }
}

/**
 * Visão “o que a franquia acredita” — para Draft/FA AI.
 * Sem relatório: usa mock/overall público com baixa confiança.
 */
export function getScoutedView(player, report, opts = {}) {
  if (!player) return null

  if (report) {
    return {
      id: player.id,
      nome: player.nome,
      posicao: player.posicao,
      idade: player.idade,
      overall: report.overallEstimate,
      potencial: report.potentialEstimate,
      potentialRange: report.potentialRange,
      personalidade: report.personalityEstimate ?? null,
      tendencias: report.tendenciesEstimate ?? null,
      strengths: report.strengths,
      weaknesses: report.weaknesses,
      confidence: report.confidence,
      grade: report.grade,
      salario: player.salario,
      mockDraft: player.mockDraft,
      scouted: true,
      // verdadeiros só para sistemas que explicitamente peçam
      _true: {
        overall: player.overall,
        potencial: player.potencial,
      },
    }
  }

  // Fallback: consenso público (mock) — impreciso
  const mockRank = player.mockDraft?.rank ?? 15
  const publicOvr = clamp(
    Math.round(78 - mockRank * 0.9 + (opts.publicNoise ?? 0)),
    60,
    86,
  )
  const publicPot = clamp(publicOvr + 8, 66, 92)

  return {
    id: player.id,
    nome: player.nome,
    posicao: player.posicao,
    idade: player.idade,
    overall: publicOvr,
    potencial: publicPot,
    potentialRange: [publicPot - 10, publicPot + 10],
    personalidade: null,
    tendencias: null,
    strengths: [],
    weaknesses: [],
    confidence: SCOUTING_CONFIDENCE_MIN,
    grade: player.mockDraft?.consensus ?? '—',
    salario: player.salario,
    mockDraft: player.mockDraft,
    scouted: false,
    _true: {
      overall: player.overall,
      potencial: player.potencial,
    },
  }
}
