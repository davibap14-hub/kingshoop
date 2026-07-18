import { PERSONALITY_KEYS } from '../../data/personality/constants'
import { TENDENCY_KEYS, TENDENCY_LABELS } from '../../data/players/schema'
import { trait } from '../personality/traits'
import { clamp } from '../utils/math'

function attr(player, path, fallback = 50) {
  const [group, key] = path.split('.')
  const v = player?.[group]?.[key]
  return v == null ? fallback : Number(v)
}

function tendency(player, key) {
  return Number(player?.tendencias?.[key] ?? 50)
}

/**
 * Perfil verdadeiro do talento (potencial oculto = potencial real).
 * Pontos fortes / fraquezas derivados de attrs + tendências + personalidade.
 */
export function analyzeTrueProfile(player) {
  if (!player) {
    return {
      hiddenPotential: 70,
      overall: 70,
      personality: {},
      tendencies: {},
      strengths: [],
      weaknesses: [],
    }
  }

  const metrics = [
    { id: 'velocidade', label: 'Velocidade', value: attr(player, 'fisico.velocidade') },
    { id: 'impulsao', label: 'Impulsão', value: attr(player, 'fisico.impulsao') },
    { id: 'forca', label: 'Força', value: attr(player, 'fisico.forca') },
    { id: 'resistencia', label: 'Resistência', value: attr(player, 'fisico.resistencia') },
    { id: 'tresPontos', label: 'Arremesso de 3', value: attr(player, 'arremesso.tresPontos') },
    { id: 'midRange', label: 'Mid-range', value: attr(player, 'arremesso.midRange') },
    { id: 'bandeja', label: 'Finalização', value: attr(player, 'arremesso.bandeja') },
    { id: 'perimetro', label: 'Defesa perímetro', value: attr(player, 'defesa.perimetro') },
    { id: 'garrafao', label: 'Defesa garrafão', value: attr(player, 'defesa.garrafao') },
    { id: 'passe', label: 'Passe', value: attr(player, 'qi.passe') },
    { id: 'visao', label: 'Visão', value: attr(player, 'qi.visao') },
    { id: 'decisao', label: 'Tomada de decisão', value: attr(player, 'qi.tomadaDecisao') },
  ]

  // Tendências extremas viram forças/fraquezas de estilo
  for (const key of TENDENCY_KEYS ?? Object.keys(TENDENCY_LABELS ?? {})) {
    const label = TENDENCY_LABELS?.[key] ?? key
    const value = tendency(player, key)
    if (value >= 72) {
      metrics.push({ id: `tend_${key}`, label: `Tend. ${label}`, value })
    } else if (value <= 32) {
      metrics.push({
        id: `tend_low_${key}`,
        label: `Baixa tend. ${label}`,
        value: 100 - value,
        isWeakHint: true,
      })
    }
  }

  const sortedHigh = [...metrics].sort((a, b) => b.value - a.value)
  const sortedLow = [...metrics]
    .filter((m) => !m.isWeakHint)
    .sort((a, b) => a.value - b.value)

  const strengths = sortedHigh.slice(0, 4).map((m) => ({
    id: m.id,
    label: m.label,
    value: m.value,
  }))

  const weaknesses = [
    ...sortedLow.slice(0, 3).map((m) => ({
      id: m.id,
      label: m.label,
      value: m.value,
    })),
    ...metrics
      .filter((m) => m.isWeakHint)
      .slice(0, 2)
      .map((m) => ({ id: m.id, label: m.label, value: m.value })),
  ].slice(0, 4)

  // Personalidade problemática como fraqueza
  if (trait(player, 'ego') >= 75) {
    weaknesses.push({ id: 'ego', label: 'Ego elevado', value: trait(player, 'ego') })
  }
  if (trait(player, 'temperamento') >= 72) {
    weaknesses.push({
      id: 'temperamento',
      label: 'Temperamento difícil',
      value: trait(player, 'temperamento'),
    })
  }
  if (trait(player, 'disciplina') <= 35) {
    weaknesses.push({
      id: 'disciplina',
      label: 'Disciplina baixa',
      value: trait(player, 'disciplina'),
    })
  }
  if (trait(player, 'lideranca') >= 75) {
    strengths.push({
      id: 'lideranca',
      label: 'Liderança',
      value: trait(player, 'lideranca'),
    })
  }

  const personality = {}
  for (const key of PERSONALITY_KEYS) {
    personality[key] = trait(player, key)
  }

  const tendencies = {}
  const tendKeys = TENDENCY_KEYS ?? Object.keys(player.tendencias ?? {})
  for (const key of tendKeys) {
    tendencies[key] = tendency(player, key)
  }

  return {
    hiddenPotential: player.potencial ?? clamp((player.overall ?? 70) + 8, 50, 99),
    overall: player.overall ?? 70,
    age: player.idade ?? 20,
    personality,
    tendencies,
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 4),
  }
}
