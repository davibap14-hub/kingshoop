import { SALARY_CAP, SALARY_FLOOR } from '../../data/gm/constants'

export function teamPayroll(contracts, teamId) {
  return Object.values(contracts ?? {})
    .filter((c) => c.teamId === teamId && c.yearsRemaining > 0)
    .reduce((sum, c) => sum + (c.yearlySalary ?? 0), 0)
}

export function capSpace(contracts, teamId, cap = SALARY_CAP) {
  return cap - teamPayroll(contracts, teamId)
}

export function isOverCap(contracts, teamId, cap = SALARY_CAP) {
  return capSpace(contracts, teamId, cap) < 0
}

export function capPressure(contracts, teamId, cap = SALARY_CAP) {
  const space = capSpace(contracts, teamId, cap)
  const used = teamPayroll(contracts, teamId)
  return {
    payroll: used,
    space,
    overCap: space < 0,
    underFloor: used < SALARY_FLOOR,
    usagePct: Math.round((used / cap) * 100),
  }
}

export function canAfford(contracts, teamId, yearlySalary, cap = SALARY_CAP) {
  return teamPayroll(contracts, teamId) + yearlySalary <= cap
}
