/**
 * Prêmios derivados de fatos já existentes (Analytics · News · History).
 * Não inventa manchetes — só rotula líderes com métricas reais.
 */

import { NBA_TV_MONTH_WEEKS } from '../../data/nbaTv'
import { resolvePlayer } from '../gm/situation'

/**
 * Jogador da Semana — líder de PER em analytics.lastWeek.
 */
export function derivePlayerOfWeek(analyticsView, opts = {}) {
  const top = analyticsView?.lastWeek?.leaders?.[0]
  if (!top) return null

  const per = top.advanced?.per ?? top.per ?? null
  return {
    id: top.playerId,
    playerId: top.playerId,
    playerName: top.playerName,
    teamId: top.teamId,
    teamShort: top.teamShort ?? top.teamId,
    week: analyticsView.lastWeek?.week ?? opts.week ?? null,
    seasonNumber: analyticsView.lastWeek?.seasonNumber ?? opts.seasonNumber ?? null,
    title: `${top.playerName} — Jogador da Semana`,
    reason:
      per != null
        ? `Líder de PER na semana (${per}).`
        : 'Melhor performance avançada da semana (Analytics Engine).',
    metric: 'PER',
    value: per,
    source: 'analytics.lastWeek',
  }
}

/**
 * Jogador do Mês — mais destaques em newsFeed (mvp / triple_double / record)
 * na janela de semanas; fallback para líder de PER da temporada.
 */
export function derivePlayerOfMonth({
  newsFeed = [],
  analyticsView = null,
  currentWeek = 1,
  seasonNumber = 1,
} = {}) {
  const windowStart = Math.max(1, currentWeek - NBA_TV_MONTH_WEEKS + 1)
  const counts = new Map()

  for (const n of newsFeed) {
    if (n.seasonNumber != null && n.seasonNumber !== seasonNumber) continue
    const w = n.week ?? 0
    if (w < windowStart || w > currentWeek) continue
    const cat = n.category
    if (cat !== 'mvp' && cat !== 'triple_double' && cat !== 'record' && cat !== 'award') {
      continue
    }
    const pid = n.refs?.playerId
    if (!pid) continue
    const prev = counts.get(pid) ?? {
      playerId: pid,
      playerName: extractNameFromTitle(n.title) ?? pid,
      teamId: n.refs?.teamId ?? null,
      score: 0,
      hits: 0,
    }
    const weight = cat === 'mvp' ? 3 : cat === 'triple_double' ? 2.5 : cat === 'record' ? 2 : 1.5
    prev.score += weight
    prev.hits += 1
    if (n.title && !prev.playerName) prev.playerName = extractNameFromTitle(n.title)
    counts.set(pid, prev)
  }

  let winner = [...counts.values()].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return String(a.playerId).localeCompare(String(b.playerId))
  })[0]

  if (!winner && analyticsView?.leagueLeaders?.[0]) {
    const lead = analyticsView.leagueLeaders[0]
    winner = {
      playerId: lead.playerId,
      playerName: lead.playerName,
      teamId: lead.teamId,
      score: lead.per ?? 0,
      hits: lead.games ?? 0,
      fromAnalytics: true,
    }
  }

  if (!winner) return null

  return {
    id: winner.playerId,
    playerId: winner.playerId,
    playerName: winner.playerName,
    teamId: winner.teamId,
    teamShort: winner.teamId,
    weekFrom: windowStart,
    weekTo: currentWeek,
    seasonNumber,
    title: `${winner.playerName} — Jogador do Mês`,
    reason: winner.fromAnalytics
      ? `Líder de PER da temporada (${winner.score}) — janela mensal ainda sem destaques na News Engine.`
      : `${winner.hits} destaque(s) na News Engine nas últimas ${NBA_TV_MONTH_WEEKS} semanas.`,
    metric: winner.fromAnalytics ? 'PER' : 'destaques',
    value: winner.fromAnalytics ? winner.score : winner.hits,
    source: winner.fromAnalytics ? 'analytics.leagueLeaders' : 'newsFeed',
  }
}

/**
 * Board de rookies — draftados recentes / idade de rookie + analytics.
 */
export function buildRookieBoard(gm, analyticsView, opts = {}) {
  const limit = opts.limit ?? 10
  if (!gm) return []

  const ids = new Set()
  const rows = []

  for (const p of gm.extraPlayers ?? []) {
    if (p.draftPick != null || p.draftedBy) {
      ids.add(p.id)
      rows.push(presentRookie(p, analyticsView))
    }
  }

  // Prospects ainda na classe
  for (const p of gm.draftClass ?? []) {
    if (ids.has(p.id)) continue
    ids.add(p.id)
    rows.push({
      ...presentRookie(p, analyticsView),
      status: 'prospect',
      statusLabel: 'Prospect · Draft class',
    })
  }

  // Idade de rookie em elencos (fallback)
  if (rows.length < limit) {
    for (const [teamId, roster] of Object.entries(gm.rosters ?? {})) {
      for (const id of roster) {
        if (ids.has(id)) continue
        const p = resolvePlayer(gm, id)
        if (!p || (p.idade ?? 99) > 23) continue
        if (p.draftPick == null && !p.draftedBy) continue
        ids.add(id)
        rows.push({
          ...presentRookie(p, analyticsView),
          teamId,
        })
        if (rows.length >= limit * 2) break
      }
    }
  }

  return rows
    .sort((a, b) => {
      if ((b.per ?? -1) !== (a.per ?? -1)) return (b.per ?? -1) - (a.per ?? -1)
      if ((b.potencial ?? 0) !== (a.potencial ?? 0)) {
        return (b.potencial ?? 0) - (a.potencial ?? 0)
      }
      return (a.draftPick ?? 99) - (b.draftPick ?? 99)
    })
    .slice(0, limit)
}

function presentRookie(p, analyticsView) {
  const season = analyticsView?.leagueLeaders?.find((l) => l.playerId === p.id)
  const career = analyticsView?.careerPlayer?.playerId === p.id
    ? analyticsView.careerPlayer
    : null
  const av = season ?? career
  return {
    id: p.id,
    playerId: p.id,
    playerName: p.nome,
    posicao: p.posicao,
    idade: p.idade,
    overall: p.overall,
    potencial: p.potencial,
    draftPick: p.draftPick ?? null,
    draftedBy: p.draftedBy ?? null,
    universidade: p.universidade ?? null,
    status: p.draftPick != null ? 'rookie' : 'rookie',
    statusLabel:
      p.draftPick != null
        ? `Rookie · pick #${p.draftPick}`
        : 'Rookie',
    teamId: av?.teamId ?? p.draftedBy ?? null,
    games: av?.games ?? 0,
    per: av?.per ?? av?.averages?.per ?? null,
    pts: av?.counting?.pts ?? null,
  }
}

function extractNameFromTitle(title) {
  if (!title || typeof title !== 'string') return null
  // "MVP da noite: Nome ..." / "Nome explode..."
  const m =
    title.match(/:\s*([A-ZÁÉÍÓÚÂÊÔÃÕ][\wÁÉÍÓÚáéíóúÂÊÔÃÕâêôãõ'’.-]+(?:\s+[A-ZÁÉÍÓÚÂÊÔÃÕ][\wÁÉÍÓÚáéíóúÂÊÔÃÕâêôãõ'’.-]+)?)/) ||
    title.match(/^([A-ZÁÉÍÓÚÂÊÔÃÕ][\wÁÉÍÓÚáéíóúÂÊÔÃÕâêôãõ'’.-]+(?:\s+[A-ZÁÉÍÓÚÂÊÔÃÕ][\wÁÉÍÓÚáéíóúÂÊÔÃÕâêôãõ'’.-]+)?)/)
  return m?.[1] ?? null
}
