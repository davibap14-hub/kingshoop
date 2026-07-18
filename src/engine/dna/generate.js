import { DNA_KEYS } from '../../data/dna/constants.js'
import { normalizeTendencies } from '../../data/players/utils.js'
import { getPersonality } from '../personality/traits.js'
import { clamp } from '../utils/math.js'

function clampStat(value) {
  return Math.round(clamp(Number(value) || 50, 1, 99))
}

function hashSeed(value) {
  const text = String(value ?? 'dna')
  let hash = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function seededUnit(seed, salt) {
  const x = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

function seededRange(seed, salt, min, max) {
  return min + seededUnit(seed, salt) * (max - min)
}

/**
 * Gera DNA estável a partir do id + posição/arquétipo/tendências/personalidade.
 * O mesmo jogador sempre produz o mesmo DNA âncora.
 */
export function generatePlayerDna(player) {
  const seed = hashSeed(player?.id ?? player?.nome ?? 'unknown')
  const personality = getPersonality(player)
  const tendencies = normalizeTendencies(player, player?.tendencias ?? {})
  const pos = player?.posicao ?? 'SG'
  const archetype = String(player?.arquetipo ?? '').toLowerCase()
  const isGuard = pos === 'PG' || pos === 'SG'
  const isBig = pos === 'C' || pos === 'PF'

  const base = {
    ritmo: clampStat(
      48 +
        (isGuard ? 8 : isBig ? -6 : 0) +
        tendencies.fastBreak * 0.12 +
        seededRange(seed, 1, -10, 10),
    ),
    agressividade: clampStat(
      42 +
        personality.competitividade * 0.22 +
        personality.temperamento * 0.12 +
        tendencies.isolation * 0.12 +
        seededRange(seed, 2, -8, 8),
    ),
    confianca: clampStat(
      46 + personality.confianca * 0.42 + seededRange(seed, 3, -8, 8),
    ),
    clutch: clampStat(
      44 +
        personality.confianca * 0.28 +
        personality.competitividade * 0.22 +
        seededRange(seed, 4, -7, 7),
    ),
    criatividade: clampStat(
      40 +
        tendencies.pass * 0.18 +
        (archetype.includes('playmaker') ? 14 : 0) +
        (archetype.includes('scorer') ? 8 : 0) +
        seededRange(seed, 5, -9, 9),
    ),
    consistencia: clampStat(
      52 +
        personality.disciplina * 0.28 +
        personality.lealdade * 0.08 -
        personality.ego * 0.08 +
        seededRange(seed, 6, -7, 7),
    ),
    tendenciaErros: clampStat(
      38 +
        (100 - personality.disciplina) * 0.22 +
        personality.temperamento * 0.12 +
        seededRange(seed, 7, -8, 8),
    ),
    assumirResponsabilidade: clampStat(
      42 +
        personality.lideranca * 0.28 +
        personality.ego * 0.18 +
        personality.confianca * 0.12 +
        seededRange(seed, 8, -8, 8),
    ),
    preferenciaInfiltracao: clampStat(
      40 +
        tendencies.drive * 0.45 +
        tendencies.postUp * 0.12 +
        seededRange(seed, 9, -7, 7),
    ),
    preferenciaArremesso: clampStat(
      40 +
        tendencies.shoot3 * 0.28 +
        tendencies.stepBack * 0.18 +
        tendencies.fadeaway * 0.12 +
        seededRange(seed, 10, -7, 7),
    ),
    preferenciaPasse: clampStat(
      38 + tendencies.pass * 0.48 + seededRange(seed, 11, -7, 7),
    ),
    preferenciaContraAtaque: clampStat(
      42 +
        tendencies.fastBreak * 0.45 +
        tendencies.drive * 0.12 +
        (isGuard ? 6 : 0) +
        seededRange(seed, 12, -8, 8),
    ),
  }

  // Soft balance so preference axes don't all max out.
  const prefSum =
    base.preferenciaInfiltracao +
    base.preferenciaArremesso +
    base.preferenciaPasse
  if (prefSum > 0) {
    const scale = 150 / prefSum
    base.preferenciaInfiltracao = clampStat(base.preferenciaInfiltracao * scale)
    base.preferenciaArremesso = clampStat(base.preferenciaArremesso * scale)
    base.preferenciaPasse = clampStat(base.preferenciaPasse * scale)
  }

  return Object.fromEntries(DNA_KEYS.map((key) => [key, clampStat(base[key] ?? 50)]))
}
