/**
 * Visão read-only da Story Engine.
 * Agrega DTO para a Interface (visual novel) — sem alterar geração/resolução.
 */

import { STORY_SEEDS_BY_ID, STORY_THEMES } from '../../data/story'
import { createStoryState } from './state.js'
import { listOpenChains } from './memory.js'

export function getStoryView(state = {}) {
  const story = createStoryState(state.story)
  const open = listOpenChains(story)
  const recent = (story.history ?? []).slice(0, 8)
  const pending = state.pendingEvent ?? null

  return {
    openChains: open.map((c) => mapOpenChain(c, story)),
    flags: story.flags,
    recent,
    counts: {
      open: open.length,
      told: story.storiesTold ?? 0,
      resolved: story.storiesResolved ?? 0,
      flags: Object.keys(story.flags ?? {}).length,
    },
    tip: 'Histórias procedurais em cadeias — decisões passadas alteram o futuro.',
    pending: pending
      ? {
          id: pending.id,
          title: pending.title ?? pending.texto,
          theme: pending.categoriaLabel,
          isContinuation: Boolean(pending.isContinuation),
        }
      : null,
    /** DTO rico para a Interface visual novel */
    novel: buildNovelView(state, story, pending, open),
  }
}

function mapOpenChain(c, story) {
  const seed = STORY_SEEDS_BY_ID[c.seedId]
  return {
    id: c.id,
    title: c.title,
    theme: c.theme,
    themeLabel: STORY_THEMES[c.theme]?.label ?? c.theme,
    stage: c.stage,
    maxStages: c.maxStages,
    dueWeek: c.dueWeek,
    lastChoiceId: c.lastChoiceId,
    characters: c.characters ?? {},
    chapters: buildChainChapters({
      seed,
      currentStage: c.stage,
      maxStages: c.maxStages ?? seed?.stages?.length ?? 1,
      chainId: c.id,
      history: story.history ?? [],
      pending: null,
      title: c.title,
    }),
  }
}

function buildNovelView(state, story, pending, open) {
  if (pending) {
    return {
      mode: 'active',
      episode: buildActiveEpisode(pending, story),
      openChains: open.map((c) => mapOpenChain(c, story)),
      recent: (story.history ?? []).slice(0, 6),
    }
  }

  const last = state.lastEventResult ?? null
  if (last) {
    return {
      mode: 'resolved',
      result: {
        title: last.choiceLabel,
        categoria: last.categoria,
        continuation: last.continuation,
        deltas: last.deltas ?? {},
        continued: Boolean(last.continued),
        chainId: last.chainId,
        messages: last.messages ?? [],
      },
      openChains: open.map((c) => mapOpenChain(c, story)),
      recent: (story.history ?? []).slice(0, 6),
    }
  }

  return {
    mode: 'idle',
    openChains: open.map((c) => mapOpenChain(c, story)),
    recent: (story.history ?? []).slice(0, 8),
    counts: {
      open: open.length,
      resolved: story.storiesResolved ?? 0,
    },
  }
}

function buildActiveEpisode(pending, story) {
  const seed = STORY_SEEDS_BY_ID[pending.seedId]
  const stage = pending.stage ?? 0
  const maxStages = pending.maxStages ?? seed?.stages?.length ?? 1
  const themeId = pending.theme ?? pending.categoria
  const themeLabel =
    pending.categoriaLabel ?? STORY_THEMES[themeId]?.label ?? themeId

  const cast = buildCast(pending.characters, seed?.roles)
  const choices = (pending.escolhas ?? []).map((c) => mapChoice(c))
  const stakes = buildStakes(choices)

  return {
    id: pending.id,
    seedId: pending.seedId,
    chainId: pending.chainId,
    title: pending.title ?? pending.texto,
    context: pending.context ?? '',
    description: pending.description ?? '',
    continuation: pending.continuation ?? '',
    themeId,
    themeLabel,
    artKey: themeId,
    stage,
    maxStages,
    chapterLabel: `Capítulo ${stage + 1} de ${maxStages}`,
    isContinuation: Boolean(pending.isContinuation),
    mandatory: true,
    cast,
    stakes,
    choices,
    chapters: buildChainChapters({
      seed,
      currentStage: stage,
      maxStages,
      chainId: pending.chainId,
      history: story.history ?? [],
      pending,
      title: pending.title ?? pending.texto,
    }),
    meta: pending.meta ?? {},
  }
}

function buildCast(characters = {}, roles = []) {
  const cast = []
  const push = (id, name, role, tone) => {
    if (!name) return
    cast.push({
      id: id ?? role,
      name,
      role,
      tone,
      initials: initialsOf(name),
    })
  }

  if (roles.includes('coach') || characters.coach) {
    push(characters.coachId, characters.coach, 'Treinador', 'coach')
  }
  if (roles.includes('teammate') || characters.teammate) {
    push(characters.teammateId, characters.teammate, 'Companheiro', 'teammate')
  }
  if (roles.includes('sponsor') || characters.sponsor) {
    push('sponsor', characters.sponsor, 'Patrocínio', 'sponsor')
  }
  if (characters.city) {
    push('city', characters.city, 'Cidade', 'city')
  }

  // Sempre inclui o MyPLAYER como protagonista
  cast.unshift({
    id: 'myplayer',
    name: 'Você',
    role: 'Protagonista',
    tone: 'player',
    initials: 'EU',
  })

  return cast
}

function buildChainChapters({
  seed,
  currentStage,
  maxStages,
  chainId,
  history,
  pending,
  title,
}) {
  const chainHistory = (history ?? [])
    .filter((h) => h.chainId === chainId)
    .slice()
    .reverse() // cronológico

  const total = maxStages || seed?.stages?.length || 1
  const chapters = []

  for (let i = 0; i < total; i += 1) {
    if (pending && i === currentStage) {
      chapters.push({
        index: i,
        label: `Cap. ${i + 1}`,
        status: 'current',
        title: pending.title ?? title,
        summary: pending.context ?? pending.description ?? '',
        choiceLabel: null,
      })
      continue
    }

    if (i < currentStage || (!pending && i < currentStage)) {
      const past = chainHistory[i] ?? null
      chapters.push({
        index: i,
        label: `Cap. ${i + 1}`,
        status: 'past',
        title: past?.title ?? title ?? `Capítulo ${i + 1}`,
        summary: past
          ? `Escolha: ${past.choiceLabel}`
          : 'Capítulo já vivido nesta carreira.',
        choiceLabel: past?.choiceLabel ?? null,
        week: past?.week ?? null,
        season: past?.season ?? null,
      })
      continue
    }

    // Futuro
    chapters.push({
      index: i,
      label: `Cap. ${i + 1}`,
      status: 'future',
      title: `Capítulo ${i + 1}`,
      summary: 'Ainda não escrito — suas escolhas moldam este ato.',
      choiceLabel: null,
    })
  }

  return chapters
}

function mapChoice(choice) {
  const efeitos = choice.efeitos ?? {}
  const consequences = Object.entries(efeitos).map(([key, value]) => ({
    key,
    value,
    label: effectLabel(key),
    tone: value > 0 ? 'good' : value < 0 ? 'bad' : 'neutral',
  }))
  const rewards = consequences.filter((c) => c.value > 0)
  const risks = consequences.filter((c) => c.value < 0)

  return {
    id: choice.id,
    label: choice.label,
    texto: choice.texto ?? '',
    tags: choice.tags ?? [],
    continue: choice.continue,
    continues: choice.continue === 'next',
    consequences,
    rewards,
    risks,
    efeitos,
  }
}

function buildStakes(choices) {
  const map = new Map()
  for (const choice of choices) {
    for (const c of choice.consequences) {
      const prev = map.get(c.key) ?? {
        key: c.key,
        label: c.label,
        min: c.value,
        max: c.value,
      }
      prev.min = Math.min(prev.min, c.value)
      prev.max = Math.max(prev.max, c.value)
      map.set(c.key, prev)
    }
  }
  const all = [...map.values()]
  return {
    consequences: all,
    rewards: all.filter((s) => s.max > 0),
    risks: all.filter((s) => s.min < 0),
  }
}

function effectLabel(key) {
  const labels = {
    relTreinador: 'Rel. Treinador',
    relCompanheiros: 'Rel. Companheiros',
    relImprensa: 'Rel. Imprensa',
    relFas: 'Rel. Fãs',
    motivacao: 'Motivação',
    energia: 'Energia',
    felicidade: 'Felicidade',
    popularidade: 'Popularidade',
    dinheiro: 'Dinheiro',
    fama: 'Fama',
  }
  return labels[key] ?? key
}

function initialsOf(name) {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?'
}
