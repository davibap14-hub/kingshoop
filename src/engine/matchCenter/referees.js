/**
 * Escala árbitros a partir do catálogo (determinístico por gameId).
 */

import {
  REFEREE_CREW,
  REFEREE_ROLE_LABELS,
} from '../../data/matchCenter'

function hashString(str) {
  let h = 0
  const s = String(str ?? '')
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0
  }
  return h
}

/**
 * Seleciona 3 árbitros (1 crew chief + 2 umpires) sem repetir.
 */
export function assignRefereeCrew(gameId) {
  const chiefs = REFEREE_CREW.filter((r) => r.role === 'crew_chief')
  const umpires = REFEREE_CREW.filter((r) => r.role === 'umpire')
  const h = hashString(gameId)

  const chief = chiefs[h % chiefs.length]
  const u1 = umpires[h % umpires.length]
  const u2 = umpires[(h + 3) % umpires.length]
  const second = u2.id === u1.id ? umpires[(h + 1) % umpires.length] : u2

  return [chief, u1, second].filter(Boolean).map((r) => ({
    id: r.id,
    name: r.name,
    role: r.role,
    roleLabel: REFEREE_ROLE_LABELS[r.role] ?? r.role,
    style: r.style,
    tendency: r.tendency,
  }))
}
