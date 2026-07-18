/**
 * Rumores de free agency — News Engine + interesse sintetizado.
 */

import { FA_RUMOR_WINDOW } from '../../data/freeAgency'
import { getTeamById } from '../../data/teams'

export function buildFaRumors({
  newsFeed = [],
  weekNews = [],
  interest = [],
  player = null,
  playerTeamId = null,
} = {}) {
  const items = []

  const pool = [...(weekNews ?? []), ...(newsFeed ?? [])]
  for (const n of pool) {
    const cat = n.category ?? n.type
    if (cat !== 'signing' && cat !== 'rumor' && cat !== 'criticism') continue
    if (
      player &&
      n.refs?.playerId &&
      n.refs.playerId !== player.id &&
      !String(n.title ?? '').includes(player.nome ?? '')
    ) {
      continue
    }
    items.push({
      id: n.id ?? `news-${items.length}`,
      tone: cat === 'signing' ? 'signing' : cat === 'criticism' ? 'heat' : 'rumor',
      headline: n.title ?? n.headline ?? 'Rumor de mercado',
      detail: n.summary ?? n.detail ?? '',
      aboutPlayerTeam: Boolean(n.aboutPlayerTeam),
    })
  }

  if (player && interest.length) {
    const hot = interest.filter((i) => i.level === 'hot').slice(0, 3)
    for (const row of hot) {
      items.unshift({
        id: `interest-${player.id}-${row.teamId}`,
        tone: row.isPlayerTeam ? 'home' : 'rumor',
        headline: `${row.teamShort} intensifica contato por ${player.nome}`,
        detail: row.blurb,
        aboutPlayerTeam: row.teamId === playerTeamId,
      })
    }

    if (interest[0] && interest[0].level !== 'hot') {
      const top = interest[0]
      items.push({
        id: `radar-${player.id}`,
        tone: 'wire',
        headline: `Radar: ${top.teamShort} lidera interesse em ${player.nome}`,
        detail: top.fitsNeed
          ? `Necessidade clara de ${player.posicao}.`
          : 'Mercado ainda fluido.',
        aboutPlayerTeam: top.teamId === playerTeamId,
      })
    }
  }

  if (!items.length) {
    items.push({
      id: 'quiet',
      tone: 'wire',
      headline: 'Mercado calmo nesta janela',
      detail: 'Poucos rumores concretos — scouts ainda mapeiam o board.',
      aboutPlayerTeam: false,
    })
  }

  return items.slice(0, FA_RUMOR_WINDOW)
}

export function buildMarketWire(agents = [], playerTeamId = null) {
  const hot = agents
    .filter((a) => a.franchiseInterest?.[0]?.level === 'hot')
    .slice(0, 4)
  return hot.map((a) => {
    const lead = a.franchiseInterest[0]
    const team = getTeamById(lead.teamId)
    return {
      id: `wire-${a.id}`,
      tone: 'rumor',
      headline: `${team?.short ?? lead.teamId} mira ${a.nome}`,
      detail: `${a.posicao} · pedido $${formatMoney(a.askedSalary)}`,
      aboutPlayerTeam: lead.teamId === playerTeamId,
    }
  })
}

function formatMoney(n) {
  if (n == null) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  return `${Math.round(n / 1000)}K`
}
