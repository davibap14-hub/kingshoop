import { ATTRIBUTE_GROUPS } from '../../data/players/schema'
import { ARCHETYPES } from '../../data/constants/archetypes'
import { MIN_ENERGY_TO_TRAIN } from '../../data/constants/career'
import { clamp } from '../utils/math'
import { recomputePlayerOverall } from './state'

function pickTrainKeys(groupKey, rng) {
  const keys = ATTRIBUTE_GROUPS[groupKey]?.keys ?? []
  if (!keys.length) return []

  // 1–2 atributos do grupo evoluem por sessão
  const shuffled = [...keys].sort(() => rng() - 0.5)
  const count = rng() < 0.55 ? 2 : 1
  return shuffled.slice(0, count)
}

/**
 * Aplica treino no grupo escolhido. Retorna player + attributeDeltas.
 */
export function applyTraining(state, activity, rng = Math.random) {
  const groupKey = activity.group
  if (!groupKey || !ATTRIBUTE_GROUPS[groupKey]) {
    return { player: state.player, attributeDeltas: {}, messages: ['Treino inválido.'] }
  }

  const energy = state.status.energia
  const motivation = state.status.motivacao
  const bias =
    ARCHETYPES[state.archetypeId]?.growthBias?.[groupKey === 'qi' ? 'inteligencia' : groupKey] ??
    1

  let efficiency = 1
  if (energy < MIN_ENERGY_TO_TRAIN) efficiency *= 0.45
  if (motivation < 40) efficiency *= 0.75
  if (motivation >= 80) efficiency *= 1.15

  const keys = pickTrainKeys(groupKey, rng)
  const attributeDeltas = {}
  const messages = []
  const nextGroup = { ...state.player[groupKey] }

  for (const key of keys) {
    const gainRaw = (0.6 + rng() * 1.4) * bias * efficiency
    const gain = Math.max(1, Math.round(gainRaw))
    const prev = nextGroup[key] ?? 50
    const next = clamp(prev + gain, 0, 99)
    nextGroup[key] = next
    attributeDeltas[`${groupKey}.${key}`] = next - prev
    if (next > prev) {
      messages.push(
        `${ATTRIBUTE_GROUPS[groupKey].labels[key]}: ${prev} → ${next} (+${next - prev}).`,
      )
    }
  }

  if (!messages.length) {
    messages.push('Treino realizado, mas sem evolução perceptível.')
  }

  const player = recomputePlayerOverall({
    ...state.player,
    [groupKey]: nextGroup,
  })

  return { player, attributeDeltas, messages }
}

export function rangeRoll([min, max], rng) {
  return min + Math.floor(rng() * (max - min + 1))
}
