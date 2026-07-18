import { ACTIVITY_RELATIONSHIP_DELTAS } from '../../data/relationships'
import { applyRelationshipDeltas } from './core.js'
import { createRelationshipsState } from './state.js'

/**
 * Converte atividade semanal + vieses do catálogo em deltas de relacionamento.
 */
export function buildActivityRelationshipDeltas(activity, extras = {}) {
  const base = { ...(ACTIVITY_RELATIONSHIP_DELTAS[activity?.type] ?? {}) }
  const deltas = { ...base }

  if (activity?.coachBias) {
    deltas.coach = (deltas.coach ?? 0) + activity.coachBias
  }
  if (activity?.teammatesBias) {
    deltas.teammates = (deltas.teammates ?? 0) + activity.teammatesBias
  }

  // Popularidade da mídia → imprensa + torcida
  if (extras.popularityGain) {
    const half = Math.max(1, Math.round(extras.popularityGain / 2))
    deltas.press = (deltas.press ?? 0) + extras.popularityGain
    deltas.fans = (deltas.fans ?? 0) + half
  }

  // Química de personalidade → companheiros
  if (extras.chemDelta) {
    deltas.teammates = (deltas.teammates ?? 0) + extras.chemDelta
  }

  // Bom treino (houve evolução de atributo)
  if (activity?.type === 'train' && extras.trainingSuccess) {
    deltas.coach = (deltas.coach ?? 0) + 1
    deltas.agent = (deltas.agent ?? 0) + 1
  }

  // Treino coletivo (QI / defesa) reforça companheiros
  if (
    activity?.type === 'train' &&
    (activity.group === 'qi' || activity.group === 'defesa')
  ) {
    deltas.teammates = (deltas.teammates ?? 0) + 1
  }

  // Lesão abala confiança do coach / agente
  if (extras.injured) {
    deltas.coach = (deltas.coach ?? 0) - 2
    deltas.gm = (deltas.gm ?? 0) - 1
    deltas.fans = (deltas.fans ?? 0) - 1
  }

  return deltas
}

/**
 * Aplica efeitos de atividade aos relacionamentos.
 */
export function applyActivityToRelationships(
  relationships,
  activity,
  extras = {},
) {
  const deltas = buildActivityRelationshipDeltas(activity, extras)
  return applyRelationshipDeltas(
    createRelationshipsState(relationships),
    deltas,
    { reason: `activity:${activity?.id ?? activity?.type ?? 'unknown'}` },
  )
}
