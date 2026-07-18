/**
 * Fórmulas puras de estatísticas avançadas.
 * Sem Interface, sem store — apenas números in → métricas out.
 */

import {
  ANALYTICS_LEAGUE,
  FTA_POSSESSION_FACTOR,
} from '../../data/analytics'
import { clamp } from '../utils/math'

function n(v) {
  return Number(v) || 0
}

function round(v, digits = 1) {
  const f = 10 ** digits
  return Math.round(n(v) * f) / f
}

function pct(v, digits = 1) {
  return round(v * 100, digits)
}

/**
 * True Shooting % = PTS / (2 * (FGA + 0.44 * FTA))
 * @returns {number|null} 0–1
 */
export function trueShootingPct({ points, fga, fta } = {}) {
  const denom = 2 * (n(fga) + FTA_POSSESSION_FACTOR * n(fta))
  if (denom <= 0) return null
  return clamp(n(points) / denom, 0, 1.5)
}

/**
 * Effective FG % = (FGM + 0.5 * 3PM) / FGA
 * @returns {number|null} 0–1
 */
export function effectiveFgPct({ fgm, threePm, fga } = {}) {
  if (n(fga) <= 0) return null
  return clamp((n(fgm) + 0.5 * n(threePm)) / n(fga), 0, 1.5)
}

/**
 * Usage % — parcela das jogadas do time terminadas pelo atleta.
 */
export function usagePct({
  fga,
  fta,
  tov,
  minutes,
  teamMinutes,
  teamFga,
  teamFta,
  teamTov,
} = {}) {
  const mp = n(minutes)
  const tmMp = n(teamMinutes)
  const teamDenom = n(teamFga) + FTA_POSSESSION_FACTOR * n(teamFta) + n(teamTov)
  if (mp <= 0 || tmMp <= 0 || teamDenom <= 0) return null
  const playerTerm = n(fga) + FTA_POSSESSION_FACTOR * n(fta) + n(tov)
  return clamp((playerTerm * (tmMp / 5)) / (mp * teamDenom) * 100, 0, 100)
}

/**
 * Assist % — percentual de cestas de campo do time assistidas pelo jogador
 * enquanto estava em quadra (minutos iguais no sim 5v5).
 */
export function assistPct({ ast, minutes, teamMinutes, teamFgm, fgm } = {}) {
  const mp = n(minutes)
  const tmMp = n(teamMinutes)
  if (mp <= 0 || tmMp <= 0) return null
  const teammateFgm = n(teamFgm) - n(fgm)
  const denom = (mp / (tmMp / 5)) * n(teamFgm) - n(fgm)
  const d = denom > 0 ? denom : Math.max(0, teammateFgm)
  if (d <= 0) return n(ast) > 0 ? 100 : 0
  return clamp((n(ast) / d) * 100, 0, 100)
}

/**
 * Rebound % — percentual dos rebotes disponíveis capturados pelo jogador.
 */
export function reboundPct({
  reb,
  orb,
  drb,
  minutes,
  teamMinutes,
  teamReb,
  oppReb,
} = {}) {
  const mp = n(minutes)
  const tmMp = n(teamMinutes)
  const available = n(teamReb) + n(oppReb)
  const trb = n(reb) || n(orb) + n(drb)
  if (mp <= 0 || tmMp <= 0 || available <= 0) return null
  return clamp((trb * (tmMp / 5)) / (mp * available) * 100, 0, 100)
}

/**
 * Possessions estimadas (equipe ou jogador).
 */
export function estimatePossessions({ fga, fta, orb, tov } = {}) {
  return Math.max(0, n(fga) + FTA_POSSESSION_FACTOR * n(fta) - n(orb) + n(tov))
}

/**
 * Offensive Rating = 100 * pontos / possessions
 */
export function offensiveRating({ points, possessions } = {}) {
  const poss = n(possessions)
  if (poss <= 0) return null
  return round((n(points) / poss) * 100, 1)
}

/**
 * Defensive Rating = 100 * pontos do oponente / possessions do oponente
 */
export function defensiveRating({ oppPoints, oppPossessions } = {}) {
  const poss = n(oppPossessions)
  if (poss <= 0) return null
  return round((n(oppPoints) / poss) * 100, 1)
}

export function netRating(ortg, drtg) {
  if (ortg == null || drtg == null) return null
  return round(n(ortg) - n(drtg), 1)
}

/**
 * PER simplificado (Hollinger-inspired), normalizado para média de liga ≈ 15.
 */
export function playerEfficiencyRating(line = {}, context = {}) {
  const mp = n(line.minutes) || ANALYTICS_LEAGUE.starterMinutes
  if (mp <= 0) return null

  const fgm = n(line.fgm)
  const fga = n(line.fga)
  const ftm = n(line.ftm)
  const fta = n(line.fta)
  const threePm = n(line.threePm)
  const orb = n(line.orb)
  const drb = n(line.drb) || Math.max(0, n(line.reb) - orb)
  const ast = n(line.ast)
  const stl = n(line.stl)
  const blk = n(line.blk)
  const tov = n(line.tov)
  const pf = n(line.pf)

  const uPer =
    (fgm * 85.91 +
      stl * 53.897 +
      threePm * 51.757 +
      ftm * 46.845 +
      blk * 39.19 +
      orb * 39.19 +
      ast * 34.677 +
      drb * 14.707 -
      pf * 17.174 -
      (fta - ftm) * 20.091 -
      (fga - fgm) * 39.19 -
      tov * 53.897) /
    mp

  // Pace factor leve + âncora na média da liga
  const pace = n(context.paceFactor) || 1
  const aPer = uPer * pace
  const leagueAvg = n(context.leagueUPer) || 0.35
  const per =
    leagueAvg > 0
      ? (aPer / leagueAvg) * ANALYTICS_LEAGUE.averagePer
      : aPer * 40

  return round(clamp(per, 0, 40), 1)
}

/**
 * Player Impact Estimate (NBA.com).
 * @returns {number|null} 0–1
 */
export function playerImpactEstimate(line = {}, gameTotals = {}) {
  const player =
    n(line.pts) +
    n(line.fgm) +
    n(line.ftm) -
    n(line.fga) -
    n(line.fta) +
    n(line.drb) +
    0.5 * n(line.orb) +
    n(line.ast) +
    n(line.stl) +
    0.5 * n(line.blk) -
    n(line.pf) -
    n(line.tov)

  const denom = n(gameTotals.pieDenom)
  if (denom <= 0) return null
  return clamp(player / denom, -1, 1)
}

/**
 * Win Shares aproximados a partir de ORtg/DRtg e possessions.
 */
export function winShares({
  ortg,
  drtg,
  possessions,
  oppPossessions,
  minutes,
  teamMinutes,
} = {}) {
  const poss = n(possessions)
  const oppPoss = n(oppPossessions) || poss
  if (ortg == null || drtg == null || poss <= 0) return null

  const leagueO = ANALYTICS_LEAGUE.averageORtg
  const leagueD = ANALYTICS_LEAGUE.averageDRtg
  const marginal = 0.32 * ANALYTICS_LEAGUE.pointsPerPossession * 100

  const oProd = ((n(ortg) - leagueO) * poss) / 100
  const dProd = ((leagueD - n(drtg)) * oppPoss) / 100
  const mpShare =
    n(teamMinutes) > 0 ? n(minutes) / n(teamMinutes) : 1 / 5

  const ows = Math.max(0, oProd / marginal) * mpShare * 5
  const dws = Math.max(0, dProd / marginal) * mpShare * 5
  const ws = ows + dws

  return {
    ows: round(ows, 2),
    dws: round(dws, 2),
    winShares: round(ws, 2),
  }
}

/**
 * Calcula o pacote completo de métricas avançadas para uma linha de jogo.
 */
export function computeAdvancedStats(line = {}, ctx = {}) {
  const minutes = n(line.minutes) || ANALYTICS_LEAGUE.starterMinutes
  const teamMinutes = n(ctx.teamMinutes) || ANALYTICS_LEAGUE.teamMinutes

  const teamPoss =
    n(ctx.teamPossessions) ||
    estimatePossessions({
      fga: ctx.teamFga,
      fta: ctx.teamFta,
      orb: ctx.teamOrb,
      tov: ctx.teamTov,
    })
  const oppPoss =
    n(ctx.oppPossessions) ||
    estimatePossessions({
      fga: ctx.oppFga,
      fta: ctx.oppFta,
      orb: ctx.oppOrb,
      tov: ctx.oppTov,
    })

  // Possessions do jogador ≈ share de minutos × possessions do time
  const playerPoss =
    teamMinutes > 0 ? teamPoss * (minutes / teamMinutes) : teamPoss / 5

  const ts = trueShootingPct({
    points: line.pts,
    fga: line.fga,
    fta: line.fta,
  })
  const efg = effectiveFgPct({
    fgm: line.fgm,
    threePm: line.threePm,
    fga: line.fga,
  })
  const usg = usagePct({
    fga: line.fga,
    fta: line.fta,
    tov: line.tov,
    minutes,
    teamMinutes,
    teamFga: ctx.teamFga,
    teamFta: ctx.teamFta,
    teamTov: ctx.teamTov,
  })
  const ast = assistPct({
    ast: line.ast,
    minutes,
    teamMinutes,
    teamFgm: ctx.teamFgm,
    fgm: line.fgm,
  })
  const reb = reboundPct({
    reb: line.reb,
    orb: line.orb,
    drb: line.drb,
    minutes,
    teamMinutes,
    teamReb: ctx.teamReb,
    oppReb: ctx.oppReb,
  })

  // Possessions usadas pelo jogador (FGA + 0.44 FTA + TOV − ORB)
  const usedPoss = Math.max(
    estimatePossessions({
      fga: line.fga,
      fta: line.fta,
      orb: line.orb,
      tov: line.tov,
    }),
    1,
  )
  // Pontos produzidos ≈ PTS + 0.5*AST (crédito parcial de assistência)
  const pointsProduced = n(line.pts) + n(line.ast) * 0.5
  const ortg = offensiveRating({
    points: pointsProduced,
    possessions: usedPoss,
  })
  // DRtg: rating do time (proxy) ± impacto defensivo individual
  const teamDrtg = defensiveRating({
    oppPoints: ctx.oppPoints,
    oppPossessions: oppPoss,
  })
  const defImpact =
    (n(line.stl) * 1.2 + n(line.blk) * 0.9 + n(line.drb) * 0.15 - n(line.pf) * 0.3) /
    Math.max(minutes / 36, 0.5)
  const drtg =
    teamDrtg == null ? null : round(clamp(teamDrtg - defImpact, 80, 130), 1)

  const net = netRating(ortg, drtg)
  const pie = playerImpactEstimate(line, {
    pieDenom: ctx.pieDenom,
  })
  const per = playerEfficiencyRating(line, {
    paceFactor: ctx.paceFactor,
    leagueUPer: ctx.leagueUPer,
  })
  const ws = winShares({
    ortg,
    drtg,
    possessions: playerPoss,
    oppPossessions: playerPoss,
    minutes,
    teamMinutes,
  })

  return {
    per,
    tsPct: ts == null ? null : pct(ts, 1),
    efgPct: efg == null ? null : pct(efg, 1),
    usgPct: usg == null ? null : round(usg, 1),
    astPct: ast == null ? null : round(ast, 1),
    rebPct: reb == null ? null : round(reb, 1),
    ortg,
    drtg,
    netRtg: net,
    winShares: ws?.winShares ?? null,
    ows: ws?.ows ?? null,
    dws: ws?.dws ?? null,
    pie: pie == null ? null : pct(pie, 1),
    possessions: round(playerPoss, 1),
    minutes: round(minutes, 1),
  }
}

export { round as roundMetric, pct as pctMetric }
