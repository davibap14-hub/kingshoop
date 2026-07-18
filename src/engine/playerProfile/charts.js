/**
 * Séries de gráficos derivadas de dados existentes (sem inventar OVR falso).
 */

import { ATTRIBUTE_GROUPS } from '../../data/players/schema'
import { listTendencies } from '../../data/players/utils'

export function buildAttributeRadar(player) {
  if (!player) return []
  return Object.values(ATTRIBUTE_GROUPS).map((group) => {
    const values = group.keys.map((k) => player[group.id]?.[k] ?? 50)
    const avg = values.reduce((s, v) => s + v, 0) / Math.max(1, values.length)
    return {
      label: group.label,
      value: Math.round(avg),
    }
  })
}

export function buildDetailedAttributes(player) {
  if (!player) return []
  const rows = []
  for (const group of Object.values(ATTRIBUTE_GROUPS)) {
    for (const key of group.keys) {
      rows.push({
        group: group.id,
        groupLabel: group.label,
        key,
        label: group.labels[key] ?? key,
        value: player[group.id]?.[key] ?? 50,
      })
    }
  }
  return rows
}

export function buildTendencyBars(player) {
  return listTendencies(player).map((t) => ({
    label: t.label,
    value: t.value,
  }))
}

/**
 * Evolução: XP acumulado das semanas + pico/atual de overall (fatos reais).
 */
export function buildEvolutionSeries({ history = [], careerStats = {}, player = null } = {}) {
  const weeks = [...(history ?? [])]
    .filter((h) => h.type === 'week' || h.week != null)
    .slice()
    .reverse()

  let xp = 0
  const xpSeries = []
  for (const entry of weeks) {
    const gain = entry.progression?.xpGain ?? 0
    xp += gain
    xpSeries.push({
      label: `T${entry.season ?? '?'} S${entry.week ?? '?'}`,
      value: xp,
      week: entry.week,
      season: entry.season,
    })
  }

  // Fallback se histórico vazio: totais da carreira
  if (!xpSeries.length && (careerStats.totalXpEarned ?? 0) > 0) {
    xpSeries.push({
      label: 'Carreira',
      value: careerStats.totalXpEarned,
    })
  }

  const overallMarkers = [
    {
      label: 'Pico OVR',
      value: careerStats.peakOverall ?? player?.overall ?? 0,
    },
    {
      label: 'Atual',
      value: player?.overall ?? careerStats.peakOverall ?? 0,
    },
  ]

  return {
    xp: xpSeries.slice(-16),
    overallMarkers,
    peakOverall: careerStats.peakOverall ?? null,
    currentOverall: player?.overall ?? null,
    peakPopularidade: careerStats.peakPopularidade ?? null,
    peakPatrimonio: careerStats.peakPatrimonio ?? null,
  }
}
