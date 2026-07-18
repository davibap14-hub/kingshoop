/**
 * Geração procedural de histórias a partir de sementes + contexto + memória.
 */

import {
  STORY_BASE_CHANCE,
  STORY_SEEDS,
  STORY_THEME_COOLDOWN,
  STORY_THEMES,
} from '../../data/story'
import { pickWeighted } from '../utils'
import { fillPattern, gatherStoryContext } from './context.js'
import {
  findDueChain,
  listOpenChains,
  scoreSeedAgainstMemory,
} from './memory.js'
import { createStoryState } from './state.js'

let _seq = 0

function nextStoryId(week, season, rng = Math.random) {
  _seq += 1
  return `story_s${season}_w${week}_${_seq}_${Math.floor(rng() * 1e5)}`
}

function pick(arr, rng) {
  if (!arr?.length) return null
  return arr[Math.floor(rng() * arr.length)]
}

function mergeEffects(choice) {
  const efeitos = { ...(choice.efeitos ?? {}) }
  for (const [k, v] of Object.entries(choice.efeitosExtra ?? {})) {
    efeitos[k] = (efeitos[k] ?? 0) + v
  }
  return efeitos
}

/**
 * Compõe uma história completa (título, descrição, contexto, escolhas, continuação).
 */
export function composeStoryFromSeed({
  seed,
  stageIndex,
  ctx,
  chain = null,
  rng = Math.random,
}) {
  const stage = seed.stages[stageIndex]
  if (!stage) return null

  const title = fillPattern(pick(seed.titlePatterns, rng), ctx)
  const context = fillPattern(pick(stage.contextPatterns, rng), ctx)
  const description = fillPattern(pick(stage.descriptionPatterns, rng), ctx)

  // Tom da descrição muda com flags da cadeia
  const flagNotes = []
  const flags = { ...ctx.flags, ...(chain?.flags ?? {}) }
  if (flags.lockerFeud > 0) flagNotes.push('A rivalidade no vestiário ainda está aberta.')
  if (flags.coachClash > 0) flagNotes.push('O atrito com o técnico continua influenciando o clima.')
  if (flags.mediaVillain > 0) flagNotes.push('A persona polêmica ainda ecoa na mídia.')
  if (flags.titlePromise > 0) flagNotes.push('Sua promessa de título segue na narrativa da liga.')
  if (flags.cityHero > 0) flagNotes.push(`${ctx.city} ainda te trata como rosto local.`)

  const continuationHint =
    stageIndex < seed.stages.length - 1
      ? 'Esta decisão abre o próximo capítulo desta história.'
      : 'Este pode ser o desfecho desta cadeia — mas as flags seguem vivas.'

  const escolhas = stage.choices.map((c) => {
    const label = fillPattern(pick(c.labels, rng), ctx)
    const efeitos = mergeEffects(c)
    const continues =
      c.continue === 'next' && stageIndex < seed.stages.length - 1
    return {
      id: c.id,
      label,
      texto: continues
        ? 'A história continua em semanas futuras.'
        : 'Fecha este arco (flags podem gerar novas cadeias).',
      efeitos,
      tags: c.tags ?? [],
      continue: continues ? 'next' : 'close',
      flags: c.flags ?? {},
    }
  })

  const storyId = chain?.pendingStoryId ?? nextStoryId(ctx.week, ctx.season, rng)

  return {
    id: storyId,
    seedId: seed.id,
    chainId: chain?.id ?? `chain_${storyId}`,
    theme: seed.theme,
    categoria: seed.theme,
    categoriaLabel: STORY_THEMES[seed.theme]?.label ?? seed.theme,
    title,
    /** compat UI antiga */
    texto: title,
    description,
    context: [context, ...flagNotes].filter(Boolean).join(' '),
    continuation: continuationHint,
    stage: stageIndex,
    maxStages: seed.stages.length,
    isContinuation: Boolean(chain),
    efeitos: {},
    escolhas,
    characters: {
      coachId: ctx.coachId,
      teammateId: ctx.teammateId,
      coach: ctx.coach,
      teammate: ctx.teammate,
      sponsor: ctx.sponsor,
      city: ctx.city,
      teamId: ctx.teamId,
    },
    meta: {
      week: ctx.week,
      season: ctx.season,
      activityType: ctx.activityType,
      perfLabel: ctx.perfLabel,
    },
  }
}

/**
 * Seleciona continuação de cadeia devida OU inicia nova cadeia.
 */
export function generateStory(state, activityContext = {}, rng = Math.random) {
  const ctx = gatherStoryContext(state, activityContext)
  const storyState = createStoryState(state.story)

  // 1) Prioriza continuação de cadeia narrativa
  const due = findDueChain(storyState, ctx.week)
  if (due) {
    const seed = STORY_SEEDS.find((s) => s.id === due.seedId)
    if (seed && due.stage < seed.stages.length) {
      const composed = composeStoryFromSeed({
        seed,
        stageIndex: due.stage,
        ctx: {
          ...ctx,
          ...due.characters,
          coach: due.characters?.coach ?? ctx.coach,
          teammate: due.characters?.teammate ?? ctx.teammate,
          flags: { ...ctx.flags, ...due.flags },
        },
        chain: due,
        rng,
      })
      if (composed) {
        return { story: composed, mode: 'continuation', chain: due, ctx }
      }
    }
  }

  // 2) Chance de nova história
  const openCount = listOpenChains(storyState).length
  const chance =
    STORY_BASE_CHANCE *
    (openCount >= 3 ? 0.55 : 1) *
    (ctx.energia < 25 ? 0.7 : 1)
  if (rng() > chance) {
    return { story: null, mode: 'none', chain: null, ctx }
  }

  // 3) Escolhe semente por peso contextual (não catálogo fixo de eventos)
  const eligible = STORY_SEEDS.filter((seed) => {
    const last = storyState.themeCooldowns?.[seed.theme]
    if (last != null && ctx.week - last < STORY_THEME_COOLDOWN) return false
    if (seed.roles?.includes('sponsor') && ctx.sponsorCount === 0) {
      // ainda pode gerar com sponsor genérico, só reduz depois
    }
    if (seed.roles?.includes('teammate') && !ctx.teammateId && ctx.teammate === 'um companheiro') {
      // ok — usa placeholder
    }
    return true
  }).map((seed) => ({
    seed,
    weight:
      (STORY_THEMES[seed.theme]?.weight ?? 1) *
      scoreSeedAgainstMemory(seed, ctx),
  }))

  if (!eligible.length) {
    return { story: null, mode: 'none', chain: null, ctx }
  }

  const picked = pickWeighted(eligible, 'weight', rng)
  const seed = picked?.seed
  if (!seed) return { story: null, mode: 'none', chain: null, ctx }

  const composed = composeStoryFromSeed({
    seed,
    stageIndex: 0,
    ctx,
    chain: null,
    rng,
  })

  return { story: composed, mode: 'new', chain: null, ctx }
}

/**
 * Resume UI-compatível (+ campos novos da Story Engine).
 */
export function summarizeStoryForUi(story) {
  if (!story) return null
  return {
    id: story.id,
    seedId: story.seedId,
    chainId: story.chainId,
    theme: story.theme,
    categoria: story.categoria ?? story.theme,
    categoriaLabel: story.categoriaLabel,
    title: story.title,
    texto: story.title ?? story.texto,
    description: story.description,
    context: story.context,
    continuation: story.continuation,
    stage: story.stage,
    maxStages: story.maxStages,
    isContinuation: Boolean(story.isContinuation),
    efeitos: story.efeitos ?? {},
    escolhas: (story.escolhas ?? []).map((c) => ({
      id: c.id,
      label: c.label,
      texto: c.texto,
      efeitos: c.efeitos ?? {},
      tags: c.tags ?? [],
      continue: c.continue,
      flags: c.flags ?? {},
    })),
    characters: story.characters ?? {},
    meta: story.meta ?? {},
  }
}
