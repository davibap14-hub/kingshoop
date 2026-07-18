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

function clampTendency(n) {
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
    shoot3: clampTendency(
      a(player, 'arremesso', 'tresPontos') * 0.8 +
        (isGuard ? 12 : isBig ? -18 : 0) +
        scorer * 0.4,
    ),
    drive: clampTendency(
      a(player, 'fisico', 'velocidade') * 0.45 +
        a(player, 'arremesso', 'bandeja') * 0.4 +
        (isBig ? -12 : 8),
    ),
    pass: clampTendency(
      a(player, 'qi', 'passe') * 0.65 +
        a(player, 'qi', 'visao') * 0.3 +
        (pos === 'PG' ? 14 : 0) +
        playmaker,
    ),
    isolation: clampTendency(
      overall * 0.35 +
        a(player, 'arremesso', 'midRange') * 0.3 +
        a(player, 'fisico', 'velocidade') * 0.25 +
        scorer,
    ),
    postUp: clampTendency(
      a(player, 'fisico', 'forca') * 0.5 +
        a(player, 'arremesso', 'bandeja') * 0.25 +
        (isBig ? 22 : -22),
    ),
    fastBreak: clampTendency(
      a(player, 'fisico', 'velocidade') * 0.65 +
        a(player, 'arremesso', 'bandeja') * 0.25 +
        (isGuard ? 10 : isBig ? -8 : 4),
    ),
    alleyOop: clampTendency(
      a(player, 'fisico', 'impulsao') * 0.6 +
        a(player, 'arremesso', 'bandeja') * 0.25 +
        (isBig || pos === 'SF' ? 16 : -6),
    ),
    stepBack: clampTendency(
      a(player, 'arremesso', 'tresPontos') * 0.4 +
        a(player, 'arremesso', 'midRange') * 0.4 +
        scorer,
    ),
    fadeaway: clampTendency(
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
    out[key] = clampTendency(raw != null ? raw : derived[key])
  }
  return out
}

/**
 * Normaliza um registro: overall + tendências 0–100.
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
