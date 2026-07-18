import {
  DEFAULT_SCOUTING_INVESTMENT,
  SCOUTING_INVESTMENT_MAX,
  SCOUTING_INVESTMENT_MIN,
} from '../../data/scouting'
import { clamp } from '../utils/math'

export function clampInvestment(value) {
  return clamp(
    Math.round(Number(value) || DEFAULT_SCOUTING_INVESTMENT),
    SCOUTING_INVESTMENT_MIN,
    SCOUTING_INVESTMENT_MAX,
  )
}

/**
 * Estado da Scouting Engine.
 * investment: { [teamId]: 0–100 }
 * reports: { [teamId]: { [playerId]: ScoutReport } }
 */
export function createScoutingState(overrides = {}) {
  return {
    investment: { ...(overrides.investment ?? {}) },
    reports: { ...(overrides.reports ?? {}) },
    lastUpdate: overrides.lastUpdate ?? null,
  }
}

export function getTeamInvestment(scouting, teamId) {
  return clampInvestment(
    scouting?.investment?.[teamId] ?? DEFAULT_SCOUTING_INVESTMENT,
  )
}

export function setTeamInvestment(scouting, teamId, value) {
  const next = createScoutingState(scouting)
  return {
    ...next,
    investment: {
      ...next.investment,
      [teamId]: clampInvestment(value),
    },
  }
}

export function getReport(scouting, teamId, playerId) {
  return scouting?.reports?.[teamId]?.[playerId] ?? null
}

export function setReport(scouting, teamId, playerId, report) {
  const next = createScoutingState(scouting)
  const teamReports = { ...(next.reports[teamId] ?? {}) }
  teamReports[playerId] = report
  return {
    ...next,
    reports: {
      ...next.reports,
      [teamId]: teamReports,
    },
  }
}
