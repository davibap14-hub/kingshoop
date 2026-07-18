import {
  ARCHETYPES,
  ARCHETYPE_LIST,
  DEFAULT_ARCHETYPE_ID,
} from '../../data/constants/archetypes'
import {
  DRAFT_CLASS_SIZE,
  DRAFT_FIRST_NAMES,
  DRAFT_LAST_NAMES,
  DRAFT_OVERALL_RANGE,
  DRAFT_POTENTIAL_BONUS,
  DRAFT_UNIVERSITIES,
} from '../../data/draft/constants'
import { POSITIONS } from '../../data/players/schema'
import { normalizePlayer } from '../../data/players/utils'
import { buildMockDraft } from './mock'

function randInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1))
}

function pick(list, rng) {
  return list[Math.floor(rng() * list.length)]
}

function jitter(base, rng, spread = 8) {
  return Math.max(25, Math.min(96, Math.round(base + (rng() - 0.5) * spread * 2)))
}

/**
 * Expande overall + arquétipo em grupos de atributos.
 */
function buildAttributes(archetypeId, overall, posicao, rng) {
  const arch = ARCHETYPES[archetypeId] ?? ARCHETYPES[DEFAULT_ARCHETYPE_ID]
  const base = arch.baseStats
  const scale = overall / 70

  const fisicoBase = Math.round(base.fisico * scale)
  const arremessoBase = Math.round(base.arremesso * scale)
  const defesaBase = Math.round(base.defesa * scale)
  const qiBase = Math.round(base.inteligencia * scale)

  const fisico = {
    velocidade: jitter(fisicoBase + (posicao === 'PG' || posicao === 'SG' ? 6 : 0), rng),
    impulsao: jitter(fisicoBase + (posicao === 'SF' || posicao === 'PF' ? 4 : 0), rng),
    forca: jitter(fisicoBase + (posicao === 'C' || posicao === 'PF' ? 8 : -4), rng),
    resistencia: jitter(fisicoBase, rng, 6),
  }

  const arremesso = {
    bandeja: jitter(arremessoBase + 2, rng),
    midRange: jitter(arremessoBase, rng),
    tresPontos: jitter(
      arremessoBase + (posicao === 'PG' || posicao === 'SG' || posicao === 'SF' ? 4 : -8),
      rng,
    ),
    lanceLivre: jitter(arremessoBase + 4, rng, 6),
  }

  const defesa = {
    perimetro: jitter(defesaBase + (posicao === 'C' ? -8 : 2), rng),
    garrafao: jitter(defesaBase + (posicao === 'C' || posicao === 'PF' ? 8 : -6), rng),
    roubo: jitter(defesaBase + (posicao === 'PG' || posicao === 'SG' ? 4 : -2), rng),
    toco: jitter(defesaBase + (posicao === 'C' ? 10 : -8), rng, 10),
  }

  const qi = {
    passe: jitter(qiBase + (posicao === 'PG' ? 10 : 0), rng),
    visao: jitter(qiBase + (archetypeId === 'playmaker' ? 8 : 0), rng),
    tomadaDecisao: jitter(qiBase, rng, 6),
  }

  return { fisico, arremesso, defesa, qi }
}

function buildName(rng, used) {
  for (let i = 0; i < 20; i++) {
    const nome = `${pick(DRAFT_FIRST_NAMES, rng)} ${pick(DRAFT_LAST_NAMES, rng)}`
    if (!used.has(nome)) {
      used.add(nome)
      return nome
    }
  }
  return `${pick(DRAFT_FIRST_NAMES, rng)} ${pick(DRAFT_LAST_NAMES, rng)} ${randInt(rng, 1, 99)}`
}

/**
 * Gera um prospect completo da Draft Engine.
 */
export function createProspect({ seasonNumber, index, rng = Math.random }) {
  const posicao = POSITIONS[index % POSITIONS.length]
  const archetype = pick(ARCHETYPE_LIST, rng)
  const arquetipo = archetype.id
  const [oMin, oMax] = DRAFT_OVERALL_RANGE
  const overall = randInt(rng, oMin, oMax)
  const [bMin, bMax] = DRAFT_POTENTIAL_BONUS
  const potencial = Math.min(97, overall + randInt(rng, bMin, bMax))
  const idade = randInt(rng, 18, 22)
  const universidade = pick(DRAFT_UNIVERSITIES, rng)
  const attrs = buildAttributes(arquetipo, overall, posicao, rng)
  const salario = 1_100_000 + Math.floor(rng() * 2_800_000) + (overall - 64) * 40_000

  return normalizePlayer({
    id: `draft_s${seasonNumber}_${index + 1}`,
    nome: 'Prospect', // preenchido pelo gerador da classe
    idade,
    posicao,
    universidade,
    arquetipo,
    overall,
    potencial,
    ...attrs,
    popularidade: 12 + Math.floor(rng() * 22) + Math.max(0, overall - 72),
    valorMercado: Math.round(salario * (3.5 + (potencial - overall) * 0.15)),
    salario,
    isProspect: true,
    draftYear: seasonNumber,
  })
}

/**
 * Gera a classe de draft do ano + Mock Draft.
 */
export function generateDraftClass(seasonNumber, rng = Math.random, opts = {}) {
  const classSize = opts.classSize ?? DRAFT_CLASS_SIZE
  const usedNames = new Set()
  const prospects = []

  for (let i = 0; i < classSize; i++) {
    const raw = createProspect({ seasonNumber, index: i, rng })
    prospects.push({
      ...raw,
      nome: buildName(rng, usedNames),
    })
  }

  // Ordena por potencial/overall antes do mock
  prospects.sort(
    (a, b) =>
      b.potencial * 0.65 +
      b.overall * 0.35 -
      (a.potencial * 0.65 + a.overall * 0.35),
  )

  return buildMockDraft(prospects, rng)
}
