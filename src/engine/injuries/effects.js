import { LEAGUE_INJURY_FATIGUE } from '../../data/injuries'
import { clamp } from '../utils/math'

/**
 * Reduções temporárias de atributos da lesão ativa.
 * paths: "fisico.velocidade" → nested patch.
 */
export function getInjuryAttributeModifiers(active) {
  if (!active?.attributeReductions) return {}
  return { ...active.attributeReductions }
}

/**
 * Aplica reduções temporárias a um jogador (cópia).
 * Não muta o permanente — uso em simulação / preview.
 */
export function applyInjuryToPlayer(player, active) {
  if (!player || !active?.attributeReductions) return player

  const next = {
    ...player,
    fisico: { ...(player.fisico ?? {}) },
    arremesso: { ...(player.arremesso ?? {}) },
    defesa: { ...(player.defesa ?? {}) },
    qi: { ...(player.qi ?? {}) },
  }

  for (const [path, delta] of Object.entries(active.attributeReductions)) {
    const [group, key] = path.split('.')
    if (!group || !key || !next[group]) continue
    next[group] = {
      ...next[group],
      [key]: clamp(Math.round((next[group][key] ?? 50) + delta), 1, 99),
    }
  }

  return next
}

/**
 * Fadiga de simulação por lesões ativas no elenco da liga.
 */
export function injuryFatigueForTeam(injuries, teamId) {
  const count = (injuries ?? []).filter((i) => i.teamId === teamId).length
  return count * LEAGUE_INJURY_FATIGUE
}

/**
 * Fadiga extra do jogador de carreira quando lesionado.
 */
export function careerInjurySimFatigue(active, profile) {
  if (!active) return 0
  const sev =
    active.severity === 'severe' ? 18 : active.severity === 'moderate' ? 12 : 8
  const fatigueExtra = Math.round((profile?.fatigue ?? 0) * 0.08)
  return sev + fatigueExtra
}
