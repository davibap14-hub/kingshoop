/**
 * Contexto vivo para geração procedural de histórias.
 */

import { getTeamById } from '../../data/teams'
import { getTeamCoach } from '../coaches/state.js'
import { resolvePlayer } from '../gm/situation'
import { trait } from '../personality/traits'
import { createStoryState } from './state.js'

/**
 * Coleta relacionamentos, personalidade, popularidade, desempenho,
 * time, cidade, patrocínios, treinador, companheiros e liga.
 */
export function gatherStoryContext(state = {}, activityContext = {}) {
  const teamId = state.currentTeamId
  const team = getTeamById(teamId) ?? {
    id: teamId,
    name: String(teamId),
    short: String(teamId).toUpperCase(),
    city: 'a cidade',
    conference: 'NBA',
  }

  const coach = getTeamCoach(state.gm?.coaches, teamId)
  const rosterIds = (state.gm?.rosters?.[teamId] ?? []).filter(
    (id) => id !== (state.player?.id ?? 'career_player'),
  )
  const teammates = rosterIds
    .map((id) => resolvePlayer(state.gm, id))
    .filter(Boolean)

  const teammate =
    teammates.find((p) => (p.overall ?? 0) >= 78) ??
    teammates[0] ??
    null

  const sponsors = state.sponsorships ?? []
  const sponsor = sponsors[0] ?? null

  const rel = state.relationships ?? {}
  const status = state.status ?? {}
  const player = state.player ?? {}
  const analytics = state.analytics?.season?.[player.id ?? 'career_player']

  const weekResults = state.season?.weekResults ?? state.lastWeekResult?.season?.weekResults ?? []
  const playerTeamResults = (weekResults.length
    ? weekResults
    : state.lastWeekResult?.season?.results ?? []
  ).filter(
    (r) => r.homeId === teamId || r.awayId === teamId,
  )

  let wins = 0
  let losses = 0
  for (const r of playerTeamResults) {
    if (r.winnerId === teamId) wins += 1
    else losses += 1
  }

  const standing = state.season?.standings?.[teamId]
  const seasonWins = standing?.wins ?? 0
  const seasonLosses = standing?.losses ?? 0

  const perfScore =
    (analytics?.averages?.per ?? 0) * 0.4 +
    (status.motivacao ?? 50) * 0.2 +
    (player.overall ?? 70) * 0.3 +
    (wins - losses) * 3

  const perfLabel =
    perfScore >= 55
      ? 'em alta'
      : perfScore >= 35
        ? 'estável'
        : 'sob pressão'

  const story = createStoryState(state.story)

  return {
    week: state.currentWeek ?? 1,
    season: state.currentSeason ?? 1,
    activityType: activityContext.activityType ?? null,
    activityId: activityContext.activityId ?? null,
    playerName: state.playerName ?? player.nome ?? 'Você',
    overall: player.overall ?? 70,
    popularidade: status.popularidade ?? player.popularidade ?? 50,
    energia: status.energia ?? 50,
    motivacao: status.motivacao ?? 50,
    felicidade: status.felicidade ?? 50,
    dinheiro: status.dinheiro ?? 0,
    injured: Boolean(state.injury),
    // personalidade
    ego: trait(player, 'ego'),
    temperamento: trait(player, 'temperamento'),
    lealdade: trait(player, 'lealdade'),
    ambicao: trait(player, 'ambicao'),
    disciplina: trait(player, 'disciplina'),
    competitividade: trait(player, 'competitividade'),
    lideranca: trait(player, 'lideranca'),
    confianca: trait(player, 'confianca'),
    // relacionamentos
    coachRel: rel.coach ?? status.relTreinador ?? 50,
    teammatesRel: rel.teammates ?? status.relCompanheiros ?? 50,
    fansRel: rel.fans ?? 50,
    pressRel: rel.press ?? 50,
    sponsorsRel: rel.sponsors ?? 50,
    gmRel: rel.gm ?? 50,
    // time / cidade / liga
    teamId: team.id,
    teamName: team.name,
    teamShort: team.short,
    city: team.city,
    conference: team.conference,
    seasonWins,
    seasonLosses,
    weekWins: wins,
    weekLosses: losses,
    perfLabel,
    perfScore,
    per: analytics?.averages?.per ?? null,
    // personagens
    coach: coach?.name ?? 'o técnico',
    coachId: coach?.id ?? null,
    teammate: teammate?.nome ?? 'um companheiro',
    teammateId: teammate?.id ?? null,
    sponsor: sponsor?.name ?? 'o patrocinador',
    sponsorCount: sponsors.length,
    // memória
    flags: story.flags,
    openChains: story.chains.filter((c) => c.open),
    story,
  }
}

/** Preenche {placeholders} em um padrão de texto. */
export function fillPattern(pattern, ctx) {
  if (!pattern) return ''
  return String(pattern).replace(/\{(\w+)\}/g, (_, key) => {
    const v = ctx[key]
    return v == null ? `{${key}}` : String(v)
  })
}
