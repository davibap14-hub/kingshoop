/**
 * Free Agency Engine — visão agregada para a Interface.
 * Sem mutação (exceto actions em negotiate.js).
 */

import {
  FA_DEFAULT_FILTERS,
  FA_POSITIONS,
  FREE_AGENCY_VERSION,
} from '../../data/freeAgency'
import { getTeamById } from '../../data/teams'
import { summarizeOffer } from '../contracts'
import { resolveFranchiseObjective } from '../franchise/objective'
import { analyzeFranchise, resolvePlayer } from '../gm/situation'
import { getReport } from '../scouting/state.js'
import { getScoutedView } from '../scouting/report.js'
import { compareFreeAgents } from './compare.js'
import { buildFaHistory } from './history.js'
import { buildFranchiseInterest, interestForTeam } from './interest.js'
import { calcAskedSalary } from './negotiate.js'
import { buildFaRumors, buildMarketWire } from './rumors.js'

/**
 * Board de Free Agency com filtros, interesse, rumores e oferta pendente.
 */
export function getFreeAgencyView(state = {}, filters = {}) {
  const gm = state.gm
  if (!gm) {
    return {
      available: false,
      version: FREE_AGENCY_VERSION,
      message: 'Carreira não iniciada.',
      agents: [],
      filters: normalizeFilters(filters),
    }
  }

  const f = normalizeFilters(filters)
  const teamId = state.currentTeamId
  const seasonState = state.season ?? {}
  const seasonNumber = state.currentSeason ?? seasonState.seasonNumber ?? 1
  const team = teamId ? getTeamById(teamId) : null
  const sit = teamId
    ? analyzeFranchise(gm, teamId, seasonState)
    : null
  const resolved = teamId
    ? resolveFranchiseObjective(gm, teamId, seasonState)
    : null

  const agents = (gm.freeAgents ?? [])
    .map((id) => resolvePlayer(gm, id))
    .filter(Boolean)
    .map((p) =>
      presentAgent(p, {
        gm,
        teamId,
        seasonState,
        seasonNumber,
        sit,
        newsFeed: state.newsFeed,
        weekNews: state.weekNews,
        leagueHistory: state.leagueHistory,
      }),
    )
    .filter((a) => matchesFilters(a, f))
    .sort((a, b) => {
      if (b.teamInterest !== a.teamInterest) return b.teamInterest - a.teamInterest
      if (b.overall !== a.overall) return b.overall - a.overall
      return String(a.nome).localeCompare(String(b.nome))
    })

  const selectedId = f.selectedId && agents.some((a) => a.id === f.selectedId)
    ? f.selectedId
    : agents[0]?.id ?? null
  const selected = agents.find((a) => a.id === selectedId) ?? null

  const compareIds = (f.compareIds ?? []).filter((id) =>
    agents.some((a) => a.id === id),
  )
  let comparison = null
  if (compareIds.length >= 2) {
    const a = agents.find((x) => x.id === compareIds[0])
    const b = agents.find((x) => x.id === compareIds[1])
    comparison = compareFreeAgents(a, b)
  }

  const pending = gm.pendingFaOffer
    ? summarizeOffer(gm.pendingFaOffer)
    : null

  const marketRumors = buildMarketWire(agents.slice(0, 12), teamId)

  return {
    available: true,
    version: FREE_AGENCY_VERSION,
    message:
      agents.length > 0
        ? `${agents.length} free agent(s) no board filtrado.`
        : 'Nenhum FA com esses filtros.',
    teamId,
    teamShort: team?.short ?? null,
    teamName: team?.name ?? null,
    needs: sit?.needs ?? [],
    mode: sit?.mode ?? null,
    objectiveId: resolved?.objectiveId ?? null,
    freeAgentsTotal: (gm.freeAgents ?? []).length,
    filters: { ...f, selectedId, positions: FA_POSITIONS },
    agents,
    selected,
    comparison,
    pendingOffer: pending,
    marketRumors,
    cap: sit?.cap ?? null,
  }
}

function presentAgent(player, ctx) {
  const {
    gm,
    teamId,
    seasonState,
    seasonNumber,
    sit,
    newsFeed,
    weekNews,
    leagueHistory,
  } = ctx

  const report =
    gm.scouting && teamId
      ? getReport(gm.scouting, teamId, player.id)
      : null
  const view = getScoutedView(player, report)
  const askedSalary = calcAskedSalary(player, seasonNumber)
  const interest = buildFranchiseInterest(gm, player, seasonState, {
    playerTeamId: teamId,
  })
  const teamRow = interestForTeam(interest, teamId)
  const history = buildFaHistory(player.id, leagueHistory, gm)
  const rumors = buildFaRumors({
    newsFeed,
    weekNews,
    interest,
    player,
    playerTeamId: teamId,
  })

  const overall = view?.overall ?? player.overall ?? 70
  const potencial = view?.potencial ?? player.potencial ?? 70

  return {
    id: player.id,
    nome: player.nome,
    posicao: player.posicao,
    idade: player.idade ?? 28,
    overall,
    potencial,
    popularidade: player.popularidade ?? 40,
    arquetipo: player.arquetipo ?? null,
    universidade: player.universidade ?? null,
    askedSalary,
    askedSalaryLabel: formatMoney(askedSalary),
    baseSalary: player.salario ?? null,
    teamInterest: teamRow?.interest ?? 0,
    teamInterestLevel: teamRow?.level ?? 'none',
    fitsNeed: Boolean(sit?.needs?.includes(player.posicao)),
    scouted: Boolean(view?.scouted),
    confidence: view?.confidence ?? 0,
    grade: view?.grade ?? null,
    strengths: (view?.strengths ?? []).slice(0, 3),
    weaknesses: (view?.weaknesses ?? []).slice(0, 2),
    franchiseInterest: interest,
    history,
    rumors,
    headline: buildHeadline(player, {
      askedSalary,
      fitsNeed: sit?.needs?.includes(player.posicao),
      teamInterest: teamRow?.interest ?? 0,
    }),
  }
}

function matchesFilters(agent, f) {
  if (f.position && f.position !== 'ALL' && agent.posicao !== f.position) {
    return false
  }
  if (agent.idade < f.ageMin || agent.idade > f.ageMax) return false
  if (agent.overall < f.ovrMin || agent.overall > f.ovrMax) return false
  if (agent.askedSalary < f.salaryMin || agent.askedSalary > f.salaryMax) {
    return false
  }
  if (f.query) {
    const q = f.query.trim().toLowerCase()
    if (q && !String(agent.nome).toLowerCase().includes(q)) return false
  }
  return true
}

function normalizeFilters(filters = {}) {
  return {
    ...FA_DEFAULT_FILTERS,
    ...filters,
    ageMin: num(filters.ageMin, FA_DEFAULT_FILTERS.ageMin),
    ageMax: num(filters.ageMax, FA_DEFAULT_FILTERS.ageMax),
    ovrMin: num(filters.ovrMin, FA_DEFAULT_FILTERS.ovrMin),
    ovrMax: num(filters.ovrMax, FA_DEFAULT_FILTERS.ovrMax),
    salaryMin: num(filters.salaryMin, FA_DEFAULT_FILTERS.salaryMin),
    salaryMax: num(filters.salaryMax, FA_DEFAULT_FILTERS.salaryMax),
    position: filters.position ?? FA_DEFAULT_FILTERS.position,
    query: filters.query ?? '',
    selectedId: filters.selectedId ?? null,
    compareIds: Array.isArray(filters.compareIds)
      ? filters.compareIds.slice(0, 2)
      : [],
  }
}

function buildHeadline(player, { askedSalary, fitsNeed, teamInterest }) {
  if (fitsNeed && teamInterest >= 70) {
    return `${player.nome} é prioridade — encaixa na necessidade e está no radar.`
  }
  if ((player.potencial ?? 0) - (player.overall ?? 0) >= 10) {
    return `${player.nome}: upside alto por ${formatMoney(askedSalary)}/ano.`
  }
  return `${player.nome} pede ${formatMoney(askedSalary)} · ${player.posicao} · ${player.idade} anos.`
}

function formatMoney(n) {
  if (n == null) return '—'
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  return `$${Math.round(n / 1000)}K`
}

function num(v, fallback) {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}
