import { MOMENTUM_EFFECT_LABELS } from '../../data/momentum/constants.js'
import { buildMomentumEffects, listMomentumEffectRows } from './effects.js'
import { createGameMomentum } from './state.js'

/**
 * View somente leitura — último momentum de partida (carreira / semana).
 */
export function getMomentumView(state = {}) {
  const snap =
    state.lastMomentum ??
    state.lastWeekResult?.momentum ??
    state.weekEffects?.momentum ??
    null

  if (!snap) {
    return {
      available: false,
      home: null,
      away: null,
      rivalry: 0,
      lastEvents: [],
      message: 'Jogue uma partida para ver o momentum psicológico.',
    }
  }

  const homeFx = buildMomentumEffects(snap.home?.value ?? 50)
  const awayFx = buildMomentumEffects(snap.away?.value ?? 50)

  return {
    available: true,
    home: {
      teamId: snap.home?.teamId,
      teamName: snap.homeName ?? snap.home?.teamId,
      value: homeFx.value,
      effects: listMomentumEffectRows(homeFx).map((r) => ({
        ...r,
        label: MOMENTUM_EFFECT_LABELS[r.key],
      })),
      makeStreak: snap.home?.makeStreak ?? 0,
      missStreak: snap.home?.missStreak ?? 0,
      threeStreak: snap.home?.threeStreak ?? 0,
    },
    away: {
      teamId: snap.away?.teamId,
      teamName: snap.awayName ?? snap.away?.teamId,
      value: awayFx.value,
      effects: listMomentumEffectRows(awayFx).map((r) => ({
        ...r,
        label: MOMENTUM_EFFECT_LABELS[r.key],
      })),
      makeStreak: snap.away?.makeStreak ?? 0,
      missStreak: snap.away?.missStreak ?? 0,
      threeStreak: snap.away?.threeStreak ?? 0,
    },
    rivalry: snap.rivalry ?? 0,
    timeouts: snap.timeoutCount ?? { home: 0, away: 0 },
    lastEvents: snap.lastEvents ?? [],
    isPlayoff: Boolean(snap.isPlayoff),
  }
}

export function summarizeMomentumForSave(state, homeName, awayName) {
  if (!state) return null
  const base = state.home ? state : createGameMomentum()
  return {
    home: { ...base.home },
    away: { ...base.away },
    homeName,
    awayName,
    rivalry: base.rivalry,
    timeoutCount: base.timeoutCount,
    lastEvents: (base.lastEvents ?? []).slice(-8),
    isPlayoff: base.isPlayoff,
  }
}
