import { DEFAULT_MEDICAL_STAFF, INJURY_SEVERITY } from '../../data/injuries'
import { TEAMS } from '../../data/teams'
import { playerDb } from '../../data/players'
import { pickWeighted } from '../utils/math'
import { INJURY_CATALOG } from '../../data/injuries'
import { createInjuryInstance } from './roll.js'
import { calcRecoveryWeeks } from './recovery.js'
import { createInjuryProfile } from './state.js'

/**
 * Tick semanal de lesões da liga usando a Injury Engine
 * (tipos, severidade, recuperação ponderada).
 */
export function processLeagueInjuries(injuries = [], rng = Math.random, opts = {}) {
  const messages = []
  let next = []
  const medicalStaff = opts.medicalStaff ?? DEFAULT_MEDICAL_STAFF

  for (const inj of injuries) {
    const profile = createInjuryProfile({
      medicalStaff: inj.medicalStaff ?? medicalStaff,
      condition: inj.condition ?? 60,
      fatigue: inj.fatigue ?? 40,
    })
    const active = {
      severity: inj.severity ?? 'moderate',
      treatment: inj.treatment ?? 'physio',
      weeksRemaining: inj.weeksRemaining ?? 1,
    }
    const recovery = calcRecoveryWeeks(active, profile, {
      age: inj.age ?? 27,
      rested: true,
    })
    const weeksRemaining = (inj.weeksRemaining ?? 1) - Math.max(1, recovery.weeks)

    if (weeksRemaining > 0) {
      next.push({ ...inj, weeksRemaining })
    } else {
      messages.push(`Retorno: ${inj.playerName} (${inj.teamShort}).`)
    }
  }

  const activeTeams = new Set(next.map((i) => i.teamId))

  for (const team of TEAMS) {
    if (activeTeams.has(team.id)) continue

    // Chance ponderada por “carga” da franquia (não coin-flip uniforme)
    const rosterSize = 12
    const chanceWeight = 7 + rosterSize * 0.3
    const safeWeight = 100
    if (rng() * (chanceWeight + safeWeight) > chanceWeight) continue

    const pool = playerDb.getAll()
    if (!pool.length) continue

    // Prefere jogadores com menor resistência / maior idade (pesos)
    const scored = pool.map((p) => ({
      player: p,
      weight: Math.max(
        0.5,
        (100 - (p.fisico?.resistencia ?? 60)) * 0.4 +
          Math.max(0, (p.idade ?? 25) - 28) * 3 +
          (100 - (p.overall ?? 70)) * 0.15 +
          5,
      ),
    }))
    const pick = pickWeighted(scored, 'weight', rng)?.player
    if (!pick) continue

    const type = pickWeighted(
      INJURY_CATALOG.map((t) => ({
        ...t,
        weight:
          (t.weight ?? 1) *
          ((INJURY_SEVERITY[t.severity]?.riskWeight ?? 1) *
            (pick.idade >= 32 && t.severity !== 'light' ? 1.3 : 1)),
      })),
      'weight',
      rng,
    )
    const instance = createInjuryInstance(
      type,
      { week: opts.week ?? null, seasonNumber: opts.seasonNumber ?? null, source: 'game' },
      rng,
    )
    if (!instance) continue

    next.push({
      id: instance.id,
      teamId: team.id,
      teamShort: team.short,
      playerId: pick.id,
      playerName: pick.nome,
      label: instance.label,
      severity: instance.severity,
      treatment: instance.treatment,
      treatmentLabel: instance.treatmentLabel,
      weeksRemaining: instance.weeksRemaining,
      weeksEstimated: instance.weeksEstimated,
      relapseChance: instance.relapseChance,
      age: pick.idade,
      condition: pick.fisico?.resistencia ?? 60,
      fatigue: 45,
      medicalStaff,
    })
    messages.push(
      `Lesão na liga: ${pick.nome} (${team.short}) — ${instance.label} [${INJURY_SEVERITY[instance.severity]?.label}] (${instance.weeksRemaining} sem.).`,
    )
    activeTeams.add(team.id)
  }

  return { injuries: next, messages }
}
