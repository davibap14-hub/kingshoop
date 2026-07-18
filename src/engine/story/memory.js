/**
 * Memória narrativa — flags e histórico influenciam o futuro.
 */

import {
  STORY_HISTORY_LIMIT,
  STORY_MAX_OPEN_CHAINS,
} from '../../data/story'
import { createChainRecord, createStoryState } from './state.js'

export function getFlag(story, key) {
  return Number(createStoryState(story).flags?.[key] ?? 0)
}

export function applyFlagDeltas(flags, deltas = {}) {
  const next = { ...flags }
  for (const [key, value] of Object.entries(deltas)) {
    if (!value) continue
    next[key] = (Number(next[key]) || 0) + Number(value)
    if (next[key] === 0) delete next[key]
  }
  return next
}

export function listOpenChains(story) {
  return createStoryState(story).chains.filter((c) => c.open)
}

export function findDueChain(story, week) {
  const open = listOpenChains(story)
  const due = open
    .filter((c) => c.dueWeek != null && c.dueWeek <= week)
    .sort((a, b) => (a.dueWeek ?? 0) - (b.dueWeek ?? 0))
  return due[0] ?? null
}

export function upsertChain(story, chain) {
  const state = createStoryState(story)
  const chains = [...state.chains]
  const idx = chains.findIndex((c) => c.id === chain.id)
  const record = createChainRecord(chain)
  if (idx >= 0) chains[idx] = record
  else chains.unshift(record)

  // Limita abertas
  let openCount = 0
  for (let i = 0; i < chains.length; i += 1) {
    if (!chains[i].open) continue
    openCount += 1
    if (openCount > STORY_MAX_OPEN_CHAINS) {
      chains[i] = { ...chains[i], open: false }
    }
  }

  return { ...state, chains }
}

export function appendStoryHistory(story, entry) {
  const state = createStoryState(story)
  const history = [entry, ...state.history].slice(0, STORY_HISTORY_LIMIT)
  return { ...state, history }
}

/**
 * Peso extra de um seed com base em flags / relações / desempenho.
 */
export function scoreSeedAgainstMemory(seed, ctx) {
  let score = 1
  const flags = ctx.flags ?? {}

  // Continuidade temática por flags
  const themeBoosts = {
    companheiros: (flags.lockerFeud ?? 0) + (flags.lockerLeader ?? 0),
    treinador: (flags.coachClash ?? 0) + (flags.coachBuyIn ?? 0),
    patrocinios: (flags.sponsorRenegotiate ?? 0) + (flags.sponsorCold ?? 0),
    popularidade: (flags.mediaVillain ?? 0) + (flags.mediaFriendly ?? 0),
    desempenho: (flags.volumeShooter ?? 0) + (flags.clutchReputation ?? 0),
    cidade: (flags.cityHero ?? 0) + (flags.cityDistant ?? 0),
    liga: (flags.titlePromise ?? 0) + (flags.teamNarrative ?? 0),
    personalidade: (flags.selfAware ?? 0) + (flags.defiantPersona ?? 0),
    relacionamentos: (flags.allyCoach ?? 0) + (flags.allyTeammates ?? 0),
    time: (flags.winNow ?? 0) + (flags.franchiseFace ?? 0),
  }
  score += (themeBoosts[seed.theme] ?? 0) * 0.35

  // Contexto vivo
  if (seed.theme === 'treinador' && ctx.coachRel < 40) score += 1.2
  if (seed.theme === 'companheiros' && ctx.teammatesRel < 45) score += 1.1
  if (seed.theme === 'popularidade' && ctx.popularidade >= 60) score += 0.8
  if (seed.theme === 'desempenho' && ctx.perfLabel === 'sob pressão') score += 1.3
  if (seed.theme === 'desempenho' && ctx.perfLabel === 'em alta') score += 0.9
  if (seed.theme === 'patrocinios' && ctx.sponsorCount > 0) score += 1
  if (seed.theme === 'patrocinios' && ctx.sponsorCount === 0) score *= 0.35
  if (seed.theme === 'cidade') score += ctx.fansRel < 40 ? 0.8 : 0.4
  if (seed.theme === 'liga' && ctx.week >= 8) score += 0.6

  // Personalidade
  if (seed.theme === 'personalidade') score += Math.abs(ctx.ego - 50) * 0.01
  if (ctx.ego > 70 && ['popularidade', 'liga', 'desempenho'].includes(seed.theme)) {
    score += 0.5
  }
  if (ctx.lealdade > 70 && ['companheiros', 'relacionamentos', 'time'].includes(seed.theme)) {
    score += 0.5
  }

  // Evita repetir seed recente
  const recent = (ctx.story?.history ?? []).slice(0, 8)
  if (recent.some((h) => h.seedId === seed.id)) score *= 0.25

  return Math.max(0.05, score)
}
