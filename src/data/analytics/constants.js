/**
 * Analytics Engine — constantes e catálogo de métricas avançadas.
 */

export const ANALYTICS_METRICS = {
  per: { id: 'per', label: 'PER', short: 'PER', higherIsBetter: true },
  tsPct: { id: 'tsPct', label: 'True Shooting %', short: 'TS%', higherIsBetter: true },
  efgPct: { id: 'efgPct', label: 'Effective FG %', short: 'eFG%', higherIsBetter: true },
  usgPct: { id: 'usgPct', label: 'Usage %', short: 'USG%', higherIsBetter: null },
  astPct: { id: 'astPct', label: 'Assist %', short: 'AST%', higherIsBetter: true },
  rebPct: { id: 'rebPct', label: 'Rebound %', short: 'REB%', higherIsBetter: true },
  ortg: { id: 'ortg', label: 'Offensive Rating', short: 'ORtg', higherIsBetter: true },
  drtg: { id: 'drtg', label: 'Defensive Rating', short: 'DRtg', higherIsBetter: false },
  netRtg: { id: 'netRtg', label: 'Net Rating', short: 'Net', higherIsBetter: true },
  winShares: { id: 'winShares', label: 'Win Shares', short: 'WS', higherIsBetter: true },
  pie: { id: 'pie', label: 'Player Impact Estimate', short: 'PIE', higherIsBetter: true },
}

export const ANALYTICS_METRIC_IDS = Object.keys(ANALYTICS_METRICS)

/** Referências de liga para normalização (PER ≈ 15, etc.) */
export const ANALYTICS_LEAGUE = {
  averagePer: 15,
  averageTsPct: 0.56,
  averageEfgPct: 0.52,
  averageORtg: 110,
  averageDRtg: 110,
  pointsPerPossession: 1.1,
  /** Minutos por jogador no sim 5v5 (jogo completo) */
  starterMinutes: 36,
  teamMinutes: 240,
}

/** Fator FT em possessions / TS% (NBA padrão) */
export const FTA_POSSESSION_FACTOR = 0.44
