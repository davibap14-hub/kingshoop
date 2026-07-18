import { createLeagueHistory } from '../history/state.js'
import { detectDynasties, dynastyKey } from './detect.js'
import { applyDynastyReputation } from './effects.js'
import { createDynastyState, hydrateDynastyState } from './state.js'

/**
 * Dynasty Engine — avalia arquivo após History e atualiza estado.
 * Gera decisões (News), conquistas via metrics, e registro histórico.
 */
export function processWeeklyDynasty({
  dynasty,
  leagueHistory,
  seasonRolled = false,
  seasonNumber = 1,
  gm = null,
} = {}) {
  let state = hydrateDynastyState(dynasty)
  let history = createLeagueHistory(leagueHistory ?? {})
  const messages = []
  const decisions = []
  const events = []

  if (!seasonRolled) {
    return {
      dynasty: state,
      leagueHistory: history,
      gm,
      decisions,
      messages,
      events,
      summary: {
        activeCount: Object.keys(state.active ?? {}).length,
        evaluated: false,
      },
    }
  }

  // Evita reprocessar a mesma temporada arquivada
  if (state.lastEvaluatedSeason === seasonNumber - 1) {
    // seasonNumber já avançou; avaliamos com base no arquivo que inclui previousSeason
  }

  const detected = detectDynasties(history)
  const recognized = new Set(state.recognizedIds ?? [])
  const nextActive = { ...(state.active ?? {}) }

  for (const record of detected) {
    const prev = nextActive[record.teamId]
    const key = dynastyKey(record)
    const isNew = !recognized.has(record.id) && !recognized.has(key)
    const upgraded =
      prev &&
      tierRank(record.tier) > tierRank(prev.tier) &&
      record.toSeason >= (prev.toSeason ?? 0)

    if (!isNew && !upgraded && prev) {
      // Atualiza score contínuo
      nextActive[record.teamId] = {
        ...prev,
        ...record,
        id: prev.id,
        firstRecognizedAt: prev.firstRecognizedAt ?? prev.recognizedAt,
      }
      continue
    }

    if (isNew || upgraded) {
      state = applyDynastyReputation(state, record)
      const eventType = upgraded ? 'dynasty_upgrade' : 'dynasty_recognized'
      const event = {
        type: eventType,
        teamId: record.teamId,
        teamShort: record.teamShort,
        teamName: record.teamName,
        tier: record.tier,
        tierLabel: record.tierLabel,
        score: record.score,
        criteria: record.criteria,
        fromSeason: record.fromSeason,
        toSeason: record.toSeason,
        dynastyId: record.id,
        reason: upgraded
          ? `${record.teamShort} eleva a dinastia para ${record.tierLabel}`
          : `${record.teamShort} entra para a história como ${record.tierLabel}`,
        at: Date.now(),
      }
      events.push(event)
      decisions.push({
        type: eventType,
        teamId: record.teamId,
        teamShort: record.teamShort,
        teamName: record.teamName,
        tier: record.tier,
        tierLabel: record.tierLabel,
        score: record.score,
        criteria: record.criteria,
        dynastyId: record.id,
        reason: event.reason,
        at: event.at,
      })
      messages.push(`Dynasty Engine: ${event.reason}.`)

      nextActive[record.teamId] = {
        ...record,
        firstRecognizedAt: prev?.firstRecognizedAt ?? record.recognizedAt,
      }
      recognized.add(record.id)
      recognized.add(key)

      // History permanente
      history = appendDynastyToHistory(history, {
        ...record,
        eventType,
        archivedSeason: seasonNumber - 1,
      })
    }
  }

  // Remove dinastias que sumiram do limiar
  for (const teamId of Object.keys(nextActive)) {
    if (!detected.some((d) => d.teamId === teamId)) {
      const fallen = nextActive[teamId]
      delete nextActive[teamId]
      messages.push(
        `Dynasty Engine: ${fallen.teamShort} deixa de ser classificada como dinastia ativa.`,
      )
    }
  }

  state = {
    ...state,
    active: nextActive,
    recognizedIds: [...recognized].slice(-80),
    lastEvents: [...(state.lastEvents ?? []), ...events].slice(-24),
    lastEvaluatedSeason: seasonNumber - 1,
  }

  // Espelha aura no GM para Franchise AI
  let nextGm = gm
  if (gm) {
    nextGm = {
      ...gm,
      dynastyAura: Object.fromEntries(
        Object.entries(nextActive).map(([id, d]) => [
          id,
          {
            tier: d.tier,
            score: d.score,
            signingBias: d.signingBias,
            reputation: state.franchiseReputation?.[id] ?? 50,
          },
        ]),
      ),
      franchiseReputation: { ...(state.franchiseReputation ?? {}) },
    }
  }

  return {
    dynasty: state,
    leagueHistory: history,
    gm: nextGm,
    decisions,
    messages,
    events,
    summary: {
      activeCount: Object.keys(nextActive).length,
      evaluated: true,
      newEvents: events.length,
      active: Object.values(nextActive).map((d) => ({
        teamId: d.teamId,
        tier: d.tier,
        score: d.score,
      })),
    },
  }
}

function tierRank(tier) {
  if (tier === 'super') return 3
  if (tier === 'dynasty') return 2
  if (tier === 'rising') return 1
  return 0
}

function appendDynastyToHistory(history, record) {
  const dynasties = [...(history.dynasties ?? [])]
  const idx = dynasties.findIndex(
    (d) => d.teamId === record.teamId && d.tier === record.tier && d.toSeason === record.toSeason,
  )
  const entry = {
    id: record.id,
    teamId: record.teamId,
    teamShort: record.teamShort,
    teamName: record.teamName,
    tier: record.tier,
    tierLabel: record.tierLabel,
    score: record.score,
    fromSeason: record.fromSeason,
    toSeason: record.toSeason,
    criteria: record.criteria,
    eventType: record.eventType,
    archivedSeason: record.archivedSeason,
    at: Date.now(),
  }
  if (idx >= 0) dynasties[idx] = entry
  else dynasties.push(entry)
  return { ...history, dynasties }
}

/** Compat / testes */
export function createEmptyDynastyWeekly() {
  return processWeeklyDynasty({
    dynasty: createDynastyState(),
    leagueHistory: createLeagueHistory(),
    seasonRolled: false,
  })
}
