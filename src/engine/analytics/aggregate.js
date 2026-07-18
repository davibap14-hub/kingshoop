/**
 * Agregação de métricas avançadas (temporada / carreira).
 */

import { ANALYTICS_LEAGUE } from '../../data/analytics'
import {
  createPlayerAnalytics,
  emptyCountingTotals,
} from './state.js'
import { computeAdvancedStats, estimatePossessions } from './metrics.js'

function pieNumer(line) {
  return (
    (line.pts ?? 0) +
    (line.fgm ?? 0) +
    (line.ftm ?? 0) -
    (line.fga ?? 0) -
    (line.fta ?? 0) +
    (line.drb ?? 0) +
    0.5 * (line.orb ?? 0) +
    (line.ast ?? 0) +
    (line.stl ?? 0) +
    0.5 * (line.blk ?? 0) -
    (line.pf ?? 0) -
    (line.tov ?? 0)
  )
}

/**
 * Acumula linhas de jogo analisadas em um mapa season/career.
 */
export function accumulateAnalyticsMap(map, gamePlayers, { seasonNumber } = {}) {
  const next = { ...map }

  for (const row of gamePlayers) {
    const id = row.playerId
    if (!id) continue

    const prev = createPlayerAnalytics(next[id])
    const t = { ...emptyCountingTotals(), ...prev.totals }
    const adv = row.advanced ?? {}
    const minutes = row.minutes ?? ANALYTICS_LEAGUE.starterMinutes

    t.games += 1
    t.minutes += minutes
    t.pts += row.pts ?? 0
    t.reb += row.reb ?? 0
    t.orb += row.orb ?? 0
    t.drb += row.drb ?? 0
    t.ast += row.ast ?? 0
    t.stl += row.stl ?? 0
    t.blk += row.blk ?? 0
    t.tov += row.tov ?? 0
    t.pf += row.pf ?? 0
    t.fgm += row.fgm ?? 0
    t.fga += row.fga ?? 0
    t.threePm += row.threePm ?? 0
    t.threePa += row.threePa ?? 0
    t.ftm += row.ftm ?? 0
    t.fta += row.fta ?? 0
    t.winShares += adv.winShares ?? 0

    // contexto de time guardado para recomputar % de temporada
    // (média ponderada aproximada via somas)
    if (row._teamCtx) {
      t.teamFgm += row._teamCtx.teamFgm ?? 0
      t.teamFga += row._teamCtx.teamFga ?? 0
      t.teamFta += row._teamCtx.teamFta ?? 0
      t.teamTov += row._teamCtx.teamTov ?? 0
      t.teamReb += row._teamCtx.teamReb ?? 0
      t.teamOrb += row._teamCtx.teamOrb ?? 0
      t.oppReb += row._teamCtx.oppReb ?? 0
      t.oppPoints += row._teamCtx.oppPoints ?? 0
      t.teamPossessions += row._teamCtx.teamPossessions ?? 0
      t.oppPossessions += row._teamCtx.oppPossessions ?? 0
      t.pieDenom += row._teamCtx.pieDenom ?? 0
    }
    t.pieNumer += pieNumer(row)

    const averages = recomputeAveragesFromTotals(t)

    next[id] = {
      ...prev,
      playerId: id,
      playerName: row.playerName ?? prev.playerName,
      teamId: row.teamId ?? prev.teamId,
      season: seasonNumber ?? prev.season,
      totals: t,
      averages,
      lastGame: {
        ...adv,
        pts: row.pts,
        reb: row.reb,
        ast: row.ast,
      },
    }
  }

  return next
}

/**
 * Recalcula pacote avançado a partir de totais acumulados.
 */
export function recomputeAveragesFromTotals(totals) {
  const t = totals
  if (!t?.games) return emptyAdvancedFromNull()

  const minutes = t.minutes || t.games * ANALYTICS_LEAGUE.starterMinutes
  const teamMinutes = t.games * ANALYTICS_LEAGUE.teamMinutes

  const teamPoss =
    t.teamPossessions ||
    estimatePossessions({
      fga: t.teamFga,
      fta: t.teamFta,
      orb: t.teamOrb,
      tov: t.teamTov,
    })
  const oppPoss = t.oppPossessions || teamPoss

  const advanced = computeAdvancedStats(
    {
      pts: t.pts,
      reb: t.reb,
      orb: t.orb,
      drb: t.drb,
      ast: t.ast,
      stl: t.stl,
      blk: t.blk,
      tov: t.tov,
      pf: t.pf,
      fgm: t.fgm,
      fga: t.fga,
      threePm: t.threePm,
      ftm: t.ftm,
      fta: t.fta,
      minutes,
    },
    {
      teamMinutes,
      teamFga: t.teamFga || t.fga,
      teamFta: t.teamFta || t.fta,
      teamTov: t.teamTov || t.tov,
      teamFgm: t.teamFgm || t.fgm,
      teamReb: t.teamReb || t.reb,
      teamOrb: t.teamOrb || t.orb,
      oppReb: t.oppReb || t.reb,
      oppPoints: t.oppPoints,
      teamPossessions: teamPoss,
      oppPossessions: oppPoss,
      pieDenom: t.pieDenom || Math.max(1, Math.abs(t.pieNumer) * 10),
    },
  )

  // Win Shares acumulados (não a média do pacote)
  return {
    ...advanced,
    winShares: Math.round((t.winShares ?? 0) * 100) / 100,
    pie:
      t.pieDenom > 0
        ? Math.round((t.pieNumer / t.pieDenom) * 1000) / 10
        : advanced.pie,
  }
}

function emptyAdvancedFromNull() {
  return {
    per: null,
    tsPct: null,
    efgPct: null,
    usgPct: null,
    astPct: null,
    rebPct: null,
    ortg: null,
    drtg: null,
    netRtg: null,
    winShares: null,
    pie: null,
  }
}

/**
 * Anexa contexto de time nas linhas do analyzeGameBox para agregação.
 */
export function attachTeamContext(analyzedGame) {
  const teams = analyzedGame.teams ?? {}
  return (analyzedGame.players ?? []).map((row) => {
    const team = teams[row.teamId]
    const oppId = Object.keys(teams).find((id) => id !== row.teamId)
    const opp = teams[oppId]
    return {
      ...row,
      _teamCtx: {
        teamFgm: team?.fgm ?? 0,
        teamFga: team?.fga ?? 0,
        teamFta: team?.fta ?? 0,
        teamTov: team?.tov ?? 0,
        teamReb: team?.reb ?? 0,
        teamOrb: team?.orb ?? 0,
        oppReb: opp?.reb ?? 0,
        oppPoints: opp?.points ?? 0,
        teamPossessions: team?.possessions ?? 0,
        oppPossessions: opp?.possessions ?? 0,
        pieDenom:
          (analyzedGame.players ?? []).length > 0
            ? // reconstruído na agregação via pieNumer; denom do jogo ≈ soma |contrib|
              Math.abs(
                (analyzedGame.players ?? []).reduce(
                  (s, p) => s + pieNumer(p),
                  0,
                ),
              ) || 1
            : 1,
      },
    }
  })
}
