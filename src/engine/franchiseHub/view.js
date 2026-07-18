/**
 * Franchise Hub Engine — visão completa da franquia.
 * Agrega Engines existentes; não recalcula regras de jogo.
 */

import {
  FRANCHISE_HUB_LIMITS,
  FRANCHISE_HUB_VERSION,
} from '../../data/franchiseHub'
import { GM_PERSONALITIES } from '../../data/gm/personalities'
import { getTeamById } from '../../data/teams'
import { getChemistryView } from '../chemistry'
import { getCoachView } from '../coaches'
import { getActiveDynasty, getFranchiseReputation } from '../dynasty/state.js'
import { resolveFranchiseObjective } from '../franchise/objective'
import { capPressure } from '../gm/cap'
import { analyzeFranchise } from '../gm/situation'
import { getGmView } from '../gm/weekly'
import { getHistoryView } from '../history'
import { buildLineupFromDb } from '../match/lineups'
import { getPlaybookView } from '../playbook'
import { getSeasonView } from '../season/state'
import { getTradeView } from '../trade'

/**
 * Portal da franquia do jogador (currentTeamId).
 * @param {object} state — snapshot da carreira
 */
export function getFranchiseHubView(state = {}) {
  const gm = state.gm
  const teamId = state.currentTeamId
  if (!gm || !teamId) {
    return {
      available: false,
      version: FRANCHISE_HUB_VERSION,
      message: 'Franquia indisponível — inicie a carreira.',
    }
  }

  const team = getTeamById(teamId)
  const seasonState = state.season ?? {}
  const sit = analyzeFranchise(gm, teamId, seasonState)
  const objective = resolveFranchiseObjective(gm, teamId, seasonState)
  const gmView = getGmView(gm, { teamId })
  const cap = capPressure(gm.contracts, teamId)
  const chemistry = getChemistryView({
    gm,
    currentTeamId: teamId,
    relationshipEffects: state.relationshipEffects,
    chemistry: state.gm?.chemistry,
  })
  const coach = getCoachView({
    gm,
    currentTeamId: teamId,
    currentSeason: state.currentSeason,
    coaches: state.gm?.coaches,
  })
  const playbook = getPlaybookView({
    gm,
    currentTeamId: teamId,
  })
  const trade = getTradeView({
    gm,
    currentTeamId: teamId,
    season: seasonState,
    currentSeason: state.currentSeason,
    lastWeekResult: state.lastWeekResult,
    weekEffects: state.weekEffects,
  })
  const season = getSeasonView(seasonState, {
    teamId,
    week: state.currentWeek,
  })
  const history = getHistoryView(state.leagueHistory)
  const lineup = buildLineupFromDb(teamId, {
    gm,
    chemistryBonus: state.relationshipEffects?.chemistryBonus ?? 0,
  })

  const personalityId = gm.personalities?.[teamId] ?? null
  const personality =
    (personalityId && GM_PERSONALITIES[personalityId]) || null

  const roster = buildRosterSection(gm, teamId, sit)
  const contracts = buildContractsSection(gm, roster.players)
  const rotation = buildRotationSection(lineup, coach, playbook)
  const patrimonio = buildPatrimonioSection(state, cap, sit)
  const historico = buildHistoricoSection(history, teamId, season, state.dynasty)

  return {
    available: true,
    version: FRANCHISE_HUB_VERSION,
    teamId,
    team: {
      id: teamId,
      short: team?.short ?? sit.teamShort ?? teamId,
      name: team?.name ?? teamId,
      city: team?.city ?? null,
      conference: team?.conference ?? null,
    },
    week: state.currentWeek ?? 1,
    seasonNumber: state.currentSeason ?? seasonState.seasonNumber ?? 1,
    record: season.teamRecord ?? {
      wins: sit.wins,
      losses: sit.losses,
      streakLabel: '—',
    },
    situation: {
      mode: sit.mode,
      avgOvr: sit.avgOvr,
      avgAge: sit.avgAge,
      avgPot: sit.avgPot,
      needs: sit.needs ?? [],
      rosterSize: sit.rosterSize,
      rosterGap: sit.rosterGap,
      phase: sit.phase,
    },
    roster,
    contracts,
    salaryCap: {
      payroll: cap.payroll,
      space: cap.space,
      usagePct: cap.usagePct,
      overCap: cap.overCap,
      underFloor: cap.underFloor,
      payrollLabel: formatMoney(cap.payroll),
      spaceLabel: formatMoney(cap.space),
    },
    chemistry: {
      teamChemistry: chemistry.teamChemistry,
      avgPair: chemistry.avgPair,
      passBoost: chemistry.passBoost,
      movementBoost: chemistry.movementBoost,
      defenseBoost: chemistry.defenseBoost,
      offenseEfficiency: chemistry.offenseEfficiency,
      bestPairs: chemistry.bestPairs ?? [],
      worstPairs: chemistry.worstPairs ?? [],
      effects: chemistry.effects,
    },
    rotation,
    coach: {
      coach: coach.coach,
      attributes: coach.attributes ?? [],
      decision: coach.decision,
      effects: coach.effects,
    },
    gm: {
      personalityId,
      personalityLabel: personality?.label ?? personalityId,
      personalityDescription: personality?.description ?? null,
      freeAgentsCount: gmView.freeAgentsCount,
      draftRemaining: gmView.draftRemaining,
      draftComplete: gmView.draftComplete,
      lastWeekDecisions: (gmView.lastWeekDecisions ?? [])
        .filter((d) => !d.teamId || d.teamId === teamId)
        .slice(0, FRANCHISE_HUB_LIMITS.decisions),
      recentLog: (gmView.recentLog ?? []).slice(0, FRANCHISE_HUB_LIMITS.decisions),
      leagueDecisions: (gmView.lastWeekDecisions ?? []).slice(
        0,
        FRANCHISE_HUB_LIMITS.decisions,
      ),
    },
    objectives: {
      current: {
        id: objective.objectiveId,
        label: objective.label,
        reason: objective.reason,
        score: objective.score,
      },
      stored: gmView.teamObjective ?? null,
      candidates: (objective.candidates ?? []).slice(0, 5).map((c) => ({
        id: c.id,
        label: c.label ?? c.id,
        score: c.score,
      })),
      dynastyBias: objective.dynastyBias ?? null,
    },
    draftPicks: {
      picks: (trade.draftPicks ?? []).slice(0, FRANCHISE_HUB_LIMITS.draftPicks),
      draftBoard: (gmView.draftBoard ?? []).slice(0, 6),
      lastDraft: gmView.lastDraft
        ? {
            seasonNumber: gmView.lastDraft.seasonNumber,
            pickCount: gmView.lastDraft.picks?.length ?? 0,
            teamPicks: (gmView.lastDraft.picks ?? []).filter(
              (p) => p.teamId === teamId,
            ),
          }
        : null,
    },
    patrimonio,
    historico,
    sources: {
      roster: 'GM · Franchise AI',
      contracts: 'GM · Contract',
      salaryCap: 'GM Cap',
      chemistry: 'Chemistry Engine',
      rotation: 'Match Lineups · Coach · Playbook',
      coach: 'Coach Engine',
      gm: 'GM Engine',
      objectives: 'Franchise AI',
      draftPicks: 'Trade Engine · Draft',
      patrimonio: 'Finance · Cap',
      historico: 'History · Dynasty · Season',
    },
  }
}

function buildRosterSection(gm, teamId, sit) {
  const players = (sit.roster ?? [])
    .map((p) => {
      const c = gm.contracts?.[p.id]
      return {
        id: p.id,
        nome: p.nome,
        posicao: p.posicao,
        idade: p.idade,
        overall: p.overall,
        potencial: p.potencial,
        popularidade: p.popularidade ?? null,
        arquetipo: p.arquetipo ?? null,
        salario: c?.yearlySalary ?? p.salario ?? null,
        yearsRemaining: c?.yearsRemaining ?? null,
        draftedBy: p.draftedBy ?? null,
        draftPick: p.draftPick ?? null,
      }
    })
    .sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))
    .slice(0, FRANCHISE_HUB_LIMITS.roster)

  return {
    count: players.length,
    avgOvr: sit.avgOvr,
    avgAge: sit.avgAge,
    needs: sit.needs ?? [],
    players,
  }
}

function buildContractsSection(gm, players) {
  const rows = players.map((p) => {
    const c = gm.contracts?.[p.id]
    return {
      playerId: p.id,
      playerName: p.nome,
      posicao: p.posicao,
      yearlySalary: c?.yearlySalary ?? p.salario ?? 0,
      yearsRemaining: c?.yearsRemaining ?? 0,
      salaryLabel: formatMoney(c?.yearlySalary ?? p.salario ?? 0),
    }
  })
  const total = rows.reduce((s, r) => s + (r.yearlySalary ?? 0), 0)
  return {
    rows,
    total,
    totalLabel: formatMoney(total),
    count: rows.length,
  }
}

function buildRotationSection(lineup, coach, playbook) {
  const starters = (lineup?.players ?? []).map((p) => ({
    id: p.id,
    nome: p.nome,
    posicao: p.posicao,
    overall: p.overall,
  }))
  const benchHint = coach.decision?.minutes ?? coach.effects?.playingTimeShare

  return {
    starters,
    minutesTarget: benchHint ?? null,
    styleLabel:
      coach.decision?.styleLabel ?? coach.coach?.preferredStyleLabel ?? null,
    playbook: {
      available: Boolean(playbook?.available !== false && playbook?.playCount),
      playCount: playbook?.playCount ?? 0,
      categories: playbook?.categories ?? [],
      coachName: playbook?.coachName ?? coach.coach?.name ?? null,
      topPlays: (playbook?.plays ?? [])
        .slice(0, FRANCHISE_HUB_LIMITS.playbook)
        .map((p) => ({
          id: p.id,
          name: p.name,
          categoryLabel: p.categoryLabel,
          priority: p.priority,
        })),
    },
  }
}

function buildPatrimonioSection(state, cap, sit) {
  const finance = state.finance ?? {}
  const status = state.status ?? {}
  const sponsorships = state.sponsorships ?? []
  const sponsorIncome = sponsorships.reduce(
    (s, sp) => s + (sp.weeklyIncome ?? sp.income ?? 0),
    0,
  )

  return {
    playerPatrimonio: finance.patrimonio ?? 0,
    playerPatrimonioLabel: formatMoney(finance.patrimonio ?? 0),
    cash: status.dinheiro ?? 0,
    cashLabel: formatMoney(status.dinheiro ?? 0),
    luxuryLevel: finance.luxuryLevel ?? null,
    investments: (finance.investments ?? []).length,
    sponsorships: sponsorships.length,
    sponsorIncomeWeekly: sponsorIncome,
    sponsorIncomeLabel: formatMoney(sponsorIncome),
    franchisePayroll: cap.payroll,
    franchisePayrollLabel: formatMoney(cap.payroll),
    franchiseSpace: cap.space,
    franchiseSpaceLabel: formatMoney(cap.space),
    franchiseMode: sit.mode,
    note:
      'Patrimônio pessoal (Finance Engine) · folha e teto da franquia (GM Cap).',
  }
}

function buildHistoricoSection(history, teamId, season, dynastyState) {
  const team = getTeamById(teamId)
  const short = team?.short

  const champions = (history.champions ?? [])
    .filter((c) => c.teamId === teamId || c.teamShort === short)
    .slice(0, FRANCHISE_HUB_LIMITS.history)

  const awards = (history.awards ?? [])
    .filter((a) => a.teamId === teamId || a.teamShort === short)
    .slice(0, FRANCHISE_HUB_LIMITS.history)

  const dynasty = getActiveDynasty(dynastyState, teamId)
  const reputation = getFranchiseReputation(dynastyState, teamId)

  return {
    record: season.teamRecord ?? null,
    champions,
    awards,
    seasonsArchived: history.seasonsCount ?? 0,
    dynasty: dynasty
      ? {
          tier: dynasty.tier,
          titles: dynasty.titles ?? dynasty.championships ?? null,
          label: dynasty.label ?? dynasty.tierLabel ?? dynasty.tier,
        }
      : null,
    reputation,
    latestSeason: history.latestSeason
      ? {
          season: history.latestSeason.season,
          championTeamId: history.latestSeason.championTeamId,
        }
      : null,
  }
}

function formatMoney(n) {
  if (n == null || Number.isNaN(n)) return '—'
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (abs >= 1000) return `$${Math.round(n / 1000)}K`
  return `$${Math.round(n)}`
}
