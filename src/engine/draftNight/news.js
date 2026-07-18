/**
 * Ticker de notícias em tempo real da Draft Night.
 */

import { getTeamById } from '../../data/teams'

export function buildDraftNightNews({
  picksSoFar = [],
  lastPick = null,
  nextTeamId = null,
  remaining = [],
  playerTeamId = null,
  seasonNumber = null,
} = {}) {
  const items = []

  if (seasonNumber != null) {
    items.push({
      id: 'open',
      tone: 'neutral',
      headline: `DRAFT ${seasonNumber} — transmissão especial`,
      detail: 'Mesa conectada · Mock Draft · relógio da escolha',
    })
  }

  if (nextTeamId && remaining.length) {
    const team = getTeamById(nextTeamId)
    const top = remaining[0]
    items.push({
      id: `clock-${nextTeamId}-${remaining.length}`,
      tone: 'alert',
      headline: `${(team?.short ?? nextTeamId).toUpperCase()} no relógio`,
      detail: top
        ? `Board aponta ${top.nome} (${top.posicao}) como favorito da mesa`
        : 'Board aberto — várias opções na mesa',
    })
  }

  if (lastPick) {
    const team = getTeamById(lastPick.teamId)
    const mock = lastPick.mockRank
    const delta =
      mock != null && lastPick.pickNumber != null
        ? mock - lastPick.pickNumber
        : 0
    let tone = 'pick'
    let detail = `${lastPick.posicao} · ${lastPick.universidade ?? 'College'}`
    if (delta >= 4) {
      tone = 'steal'
      detail = `Valor alto — era #${mock} no mock`
    } else if (delta <= -4) {
      tone = 'reach'
      detail = `Surpresa — mock #${mock} saindo em ${lastPick.pickNumber}`
    }
    items.unshift({
      id: `pick-${lastPick.pickNumber}`,
      tone,
      headline: `PICK ${lastPick.pickNumber}: ${team?.short ?? lastPick.teamId} → ${lastPick.prospectName}`,
      detail,
      aboutPlayerTeam: lastPick.teamId === playerTeamId,
    })
  }

  for (const pick of [...picksSoFar].reverse().slice(0, 5)) {
    if (lastPick && pick.pickNumber === lastPick.pickNumber) continue
    const team = getTeamById(pick.teamId)
    items.push({
      id: `hist-${pick.pickNumber}`,
      tone: 'wire',
      headline: `#${pick.pickNumber} ${team?.short ?? pick.teamId}: ${pick.prospectName}`,
      detail: `${pick.posicao}${pick.mockRank ? ` · mock #${pick.mockRank}` : ''}`,
      aboutPlayerTeam: pick.teamId === playerTeamId,
    })
  }

  if (remaining.length <= 3 && remaining.length > 0) {
    items.push({
      id: 'late',
      tone: 'neutral',
      headline: 'Board encolhe — poucas fichas na mesa',
      detail: remaining.map((p) => p.nome).join(' · '),
    })
  }

  return items.slice(0, 10)
}
