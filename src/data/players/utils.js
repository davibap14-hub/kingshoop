import { ATTRIBUTE_GROUPS, ATTRIBUTE_GROUP_KEYS } from './schema'

function avg(values) {
  if (!values.length) return 0
  return Math.round(values.reduce((sum, n) => sum + n, 0) / values.length)
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
 * Normaliza um registro: garante overall derivado se omitido.
 */
export function normalizePlayer(raw) {
  const overall = raw.overall ?? calcOverall(raw)
  return {
    ...raw,
    overall,
    potencial: raw.potencial ?? Math.min(99, overall + 5),
    popularidade: raw.popularidade ?? Math.round(overall * 0.55),
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
