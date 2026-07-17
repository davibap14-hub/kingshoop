import { SAVE_VERSION } from '../../data/save/constants'
import { createEmptyCareerStats, createEmptyHistory } from './history'

/**
 * Extrai o snapshot persistível do estado de carreira.
 * Inclui: jogador, time, temporada, atributos, eventos, histórico,
 * estatísticas e contratos.
 */
export function buildSaveSnapshot(state) {
  return {
    playerName: state.playerName,
    archetypeId: state.archetypeId,
    player: structuredCloneSafe(state.player),
    playerStats: structuredCloneSafe(state.playerStats),
    status: structuredCloneSafe(state.status),
    careerVariables: structuredCloneSafe(state.careerVariables),
    progression: structuredCloneSafe(state.progression),
    finance: structuredCloneSafe(state.finance),
    contract: structuredCloneSafe(state.contract),
    sponsorships: structuredCloneSafe(state.sponsorships ?? []),
    injury: structuredCloneSafe(state.injury),
    pendingEvent: structuredCloneSafe(state.pendingEvent),
    lastEventResult: structuredCloneSafe(state.lastEventResult),
    lastWeekResult: structuredCloneSafe(state.lastWeekResult),
    currentWeek: state.currentWeek,
    currentSeason: state.currentSeason,
    currentTeamId: state.currentTeamId,
    lastEvent: state.lastEvent,
    history: structuredCloneSafe(state.history ?? createEmptyHistory()),
    careerStats: structuredCloneSafe(
      state.careerStats ?? createEmptyCareerStats(),
    ),
    season: structuredCloneSafe(state.season),
  }
}

/**
 * Monta o payload completo de um save.
 */
export function createSavePayload(state, meta = {}) {
  const snapshot = buildSaveSnapshot(state)
  const now = Date.now()

  return {
    version: SAVE_VERSION,
    id: meta.id,
    name: meta.name ?? snapshot.playerName ?? 'Save',
    createdAt: meta.createdAt ?? now,
    updatedAt: now,
    auto: Boolean(meta.auto),
    snapshot,
    summary: buildSaveSummary(snapshot),
  }
}

/**
 * Resumo leve para listagem de slots.
 */
export function buildSaveSummary(snapshot) {
  return {
    playerName: snapshot.playerName,
    teamId: snapshot.currentTeamId,
    season: snapshot.currentSeason,
    week: snapshot.currentWeek,
    overall: snapshot.player?.overall ?? null,
    archetypeId: snapshot.archetypeId,
    dinheiro: snapshot.status?.dinheiro ?? 0,
    patrimonio: snapshot.finance?.patrimonio ?? 0,
    weeksPlayed: snapshot.careerStats?.weeksPlayed ?? 0,
    eventsResolved: snapshot.careerStats?.eventsResolved ?? 0,
  }
}

/**
 * Hidrata overrides para startCareer / createCareerState.
 */
export function hydrateSaveToOverrides(payload) {
  const snap = payload?.snapshot
  if (!snap) return null

  return {
    playerName: snap.playerName,
    archetypeId: snap.archetypeId,
    player: snap.player,
    playerStats: snap.playerStats,
    status: snap.status,
    careerVariables: snap.careerVariables,
    progression: snap.progression,
    finance: snap.finance,
    contract: snap.contract,
    sponsorships: snap.sponsorships,
    injury: snap.injury,
    pendingEvent: snap.pendingEvent,
    lastEventResult: snap.lastEventResult,
    lastWeekResult: snap.lastWeekResult,
    currentWeek: snap.currentWeek,
    currentSeason: snap.currentSeason,
    currentTeamId: snap.currentTeamId,
    lastEvent: snap.lastEvent,
    history: snap.history ?? createEmptyHistory(),
    careerStats: snap.careerStats ?? createEmptyCareerStats(),
    season: snap.season,
  }
}

export function validateSavePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { ok: false, error: 'Save inválido.' }
  }
  if (!payload.snapshot || typeof payload.snapshot !== 'object') {
    return { ok: false, error: 'Snapshot ausente.' }
  }
  if (!payload.id) {
    return { ok: false, error: 'Save sem id.' }
  }
  return { ok: true, error: null }
}

function structuredCloneSafe(value) {
  if (value == null) return value
  try {
    if (typeof structuredClone === 'function') {
      return structuredClone(value)
    }
  } catch {
    // fallback
  }
  return JSON.parse(JSON.stringify(value))
}
