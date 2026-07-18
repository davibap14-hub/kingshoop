import { PERSONALITY_KEYS, PERSONALITY_LABELS } from '../personality/constants'
import {
  ATTRIBUTE_GROUPS,
  ATTRIBUTE_GROUP_KEYS,
  TENDENCY_KEYS,
  TENDENCY_LABELS,
} from './schema'

function avg(values) {
  if (!values.length) return 0
  return Math.round(values.reduce((sum, n) => sum + n, 0) / values.length)
}

function clamp01(n) {
  return Math.max(0, Math.min(100, Math.round(Number(n) || 0)))
}

function a(player, group, key, fallback = 50) {
  return player?.[group]?.[key] ?? fallback
}

/** Média de um grupo de atributos (ex.: fisico → 74). */
export function calcGroupRating(groupAttrs = {}) {
  return avg(Object.values(groupAttrs).filter((n) => typeof n === 'number'))
}

/**
 * Overall a partir dos 4 grupos.
 * Pode ser sobrescrito manualmente no registro.
 */
export function calcOverall(player) {
  const groupScores = ATTRIBUTE_GROUP_KEYS.map((groupKey) =>
    calcGroupRating(player[groupKey]),
  )
  return avg(groupScores)
}

/**
 * Deriva tendências 0–100 a partir de atributos, posição e arquétipo.
 * Valores explícitos em `raw.tendencias` sobrescrevem o derivado.
 */
export function deriveTendencies(player = {}) {
  const pos = player.posicao
  const isBig = pos === 'C' || pos === 'PF'
  const isGuard = pos === 'PG' || pos === 'SG'
  const scorer = player.arquetipo === 'scorer' ? 12 : 0
  const playmaker = player.arquetipo === 'playmaker' ? 12 : 0
  let overall = player.overall
  if (overall == null) overall = calcOverall(player)
  if (!overall) overall = 70

  return {
    shoot3: clamp01(
      a(player, 'arremesso', 'tresPontos') * 0.8 +
        (isGuard ? 12 : isBig ? -18 : 0) +
        scorer * 0.4,
    ),
    drive: clamp01(
      a(player, 'fisico', 'velocidade') * 0.45 +
        a(player, 'arremesso', 'bandeja') * 0.4 +
        (isBig ? -12 : 8),
    ),
    pass: clamp01(
      a(player, 'qi', 'passe') * 0.65 +
        a(player, 'qi', 'visao') * 0.3 +
        (pos === 'PG' ? 14 : 0) +
        playmaker,
    ),
    isolation: clamp01(
      overall * 0.35 +
        a(player, 'arremesso', 'midRange') * 0.3 +
        a(player, 'fisico', 'velocidade') * 0.25 +
        scorer,
    ),
    postUp: clamp01(
      a(player, 'fisico', 'forca') * 0.5 +
        a(player, 'arremesso', 'bandeja') * 0.25 +
        (isBig ? 22 : -22),
    ),
    fastBreak: clamp01(
      a(player, 'fisico', 'velocidade') * 0.65 +
        a(player, 'arremesso', 'bandeja') * 0.25 +
        (isGuard ? 10 : isBig ? -8 : 4),
    ),
    alleyOop: clamp01(
      a(player, 'fisico', 'impulsao') * 0.6 +
        a(player, 'arremesso', 'bandeja') * 0.25 +
        (isBig || pos === 'SF' ? 16 : -6),
    ),
    stepBack: clamp01(
      a(player, 'arremesso', 'tresPontos') * 0.4 +
        a(player, 'arremesso', 'midRange') * 0.4 +
        scorer,
    ),
    fadeaway: clamp01(
      a(player, 'arremesso', 'midRange') * 0.5 +
        a(player, 'fisico', 'forca') * 0.25 +
        (isBig ? 10 : 0) +
        scorer * 0.6,
    ),
  }
}

/** Mescla overrides com derivados e garante 0–100 em todas as chaves. */
export function normalizeTendencies(player, overrides = {}) {
  const derived = deriveTendencies(player)
  const out = {}
  for (const key of TENDENCY_KEYS) {
    const raw = overrides[key]
    out[key] = clamp01(raw != null ? raw : derived[key])
  }
  return out
}

/**
 * Deriva personalidade 0–100 a partir de arquétipo, overall e attrs.
 */
export function derivePersonality(player = {}) {
  const arch = player.arquetipo ?? 'versatil'
  let overall = player.overall
  if (overall == null) overall = calcOverall(player)
  if (!overall) overall = 70

  const starBoost = overall >= 84 ? 10 : overall >= 78 ? 5 : 0
  const young = (player.idade ?? 25) <= 23 ? 8 : 0
  const vet = (player.idade ?? 25) >= 30 ? 8 : 0

  const archMods = {
    playmaker: {
      lideranca: 14,
      lealdade: 8,
      ego: -6,
      disciplina: 6,
      confianca: 4,
    },
    scorer: {
      ego: 12,
      ambicao: 10,
      competitividade: 10,
      confianca: 8,
      lealdade: -6,
    },
    defender: {
      disciplina: 12,
      competitividade: 10,
      temperamento: -8,
      lideranca: 6,
    },
    athletic: {
      competitividade: 8,
      confianca: 6,
      temperamento: 6,
      disciplina: -4,
    },
    sharpshooter: {
      disciplina: 10,
      confianca: 8,
      ego: 4,
      temperamento: -4,
    },
    versatil: {
      disciplina: 4,
      lealdade: 4,
      ambicao: 4,
    },
  }

  const m = archMods[arch] ?? archMods.versatil

  return {
    competitividade: clamp01(
      48 +
        a(player, 'fisico', 'resistencia') * 0.2 +
        (m.competitividade ?? 0) +
        starBoost * 0.4,
    ),
    ego: clamp01(
      35 +
        overall * 0.25 +
        (player.popularidade ?? overall * 0.5) * 0.15 +
        (m.ego ?? 0) +
        starBoost,
    ),
    lideranca: clamp01(
      40 +
        a(player, 'qi', 'tomadaDecisao') * 0.25 +
        a(player, 'qi', 'visao') * 0.15 +
        (m.lideranca ?? 0) +
        vet,
    ),
    lealdade: clamp01(
      55 +
        (m.lealdade ?? 0) +
        vet * 0.8 -
        starBoost * 0.5 -
        young * 0.3,
    ),
    temperamento: clamp01(
      45 +
        (100 - a(player, 'qi', 'tomadaDecisao')) * 0.2 +
        (m.temperamento ?? 0) +
        (arch === 'athletic' ? 6 : 0),
    ),
    ambicao: clamp01(
      45 +
        (player.potencial ?? overall) * 0.2 +
        young +
        (m.ambicao ?? 0) +
        starBoost * 0.5,
    ),
    disciplina: clamp01(
      42 +
        a(player, 'fisico', 'resistencia') * 0.2 +
        a(player, 'qi', 'tomadaDecisao') * 0.15 +
        (m.disciplina ?? 0),
    ),
    confianca: clamp01(
      40 +
        overall * 0.3 +
        a(player, 'qi', 'tomadaDecisao') * 0.15 +
        (m.confianca ?? 0) +
        starBoost * 0.6,
    ),
  }
}

export function normalizePersonality(player, overrides = {}) {
  const derived = derivePersonality(player)
  const out = {}
  for (const key of PERSONALITY_KEYS) {
    const raw = overrides[key]
    out[key] = clamp01(raw != null ? raw : derived[key])
  }
  return out
}

/**
 * Normaliza um registro: overall + tendências + personalidade.
 */
export function normalizePlayer(raw) {
  const overall = raw.overall ?? calcOverall(raw)
  const base = {
    ...raw,
    overall,
    potencial: raw.potencial ?? Math.min(99, overall + 5),
    popularidade: raw.popularidade ?? Math.round(overall * 0.55),
  }
  return {
    ...base,
    tendencias: normalizeTendencies(base, raw.tendencias ?? {}),
    personalidade: normalizePersonality(base, raw.personalidade ?? {}),
  }
}

/** Formata salário / valor de mercado em USD curto. */
export function formatMoney(value) {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`
  }
  return `$${value}`
}

export function listFlatAttributes(player) {
  const rows = []
  for (const groupKey of ATTRIBUTE_GROUP_KEYS) {
    const group = ATTRIBUTE_GROUPS[groupKey]
    for (const key of group.keys) {
      rows.push({
        group: groupKey,
        groupLabel: group.label,
        key,
        label: group.labels[key],
        value: player[groupKey]?.[key] ?? 0,
      })
    }
  }
  return rows
}

/** Lista tendências para UI / debug. */
export function listTendencies(player) {
  const t = player?.tendencias ?? normalizeTendencies(player ?? {})
  return TENDENCY_KEYS.map((key) => ({
    key,
    label: TENDENCY_LABELS[key] ?? key,
    value: t[key] ?? 0,
  }))
}

/** Lista personalidade para UI / debug. */
export function listPersonality(player) {
  const p = player?.personalidade ?? normalizePersonality(player ?? {})
  return PERSONALITY_KEYS.map((key) => ({
    key,
    label: PERSONALITY_LABELS[key] ?? key,
    value: p[key] ?? 0,
  }))
}
