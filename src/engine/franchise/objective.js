import {
  FRANCHISE_OBJECTIVES,
  PERSONALITY_DEFAULT_OBJECTIVE,
} from '../../data/franchise/objectives'
import { analyzeFranchise } from '../gm/situation'

/**
 * Resolve o objetivo atual da franquia a partir de resultados.
 * Determinístico — sem RNG.
 */
export function resolveFranchiseObjective(gm, teamId, seasonState = {}) {
  const sit = analyzeFranchise(gm, teamId, seasonState)
  const week = seasonState.currentWeek ?? seasonState.week ?? 1
  const phase = seasonState.phase ?? 'regular'
  const baseId =
    PERSONALITY_DEFAULT_OBJECTIVE[sit.personalityId] ?? 'playoffs'

  const candidates = scoreObjectiveCandidates(sit, { week, phase, baseId })
  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.id.localeCompare(b.id)
  })

  const best = candidates[0]
  const objective = FRANCHISE_OBJECTIVES[best.id] ?? FRANCHISE_OBJECTIVES.playoffs

  return {
    teamId,
    objectiveId: objective.id,
    objective,
    label: objective.label,
    reason: best.reason,
    score: best.score,
    candidates: candidates.map((c) => ({
      id: c.id,
      score: Math.round(c.score * 10) / 10,
      reason: c.reason,
    })),
    situation: sit,
    weights: objective.weights,
  }
}

function scoreObjectiveCandidates(sit, ctx) {
  const { week, phase, baseId } = ctx
  const winPct = sit.winPct ?? 0
  const games = (sit.wins ?? 0) + (sit.losses ?? 0)
  const late = week >= 28 || phase === 'playoffs' || phase === 'play_in'
  const mid = week >= 14
  const early = week <= 10

  const list = []

  // Tank
  {
    let score = baseId === 'tank' ? 42 : 18
    let reason = 'perfil de reconstrução'
    if (winPct < 0.32 && games >= 10) {
      score += 38
      reason = 'campanha fraca — maximizar draft'
    }
    if (sit.avgOvr < 72) {
      score += 16
      reason = 'elenco abaixo do nível competitivo'
    }
    if (late && winPct < 0.4) score += 12
    if (sit.avgAge <= 24 && sit.avgPot >= 84) score -= 8
    list.push({ id: 'tank', score, reason })
  }

  // Playoffs
  {
    let score = baseId === 'playoffs' ? 44 : 22
    let reason = 'busca estabilidade de pós-temporada'
    if (winPct >= 0.45 && winPct < 0.68 && games >= 8) {
      score += 30
      reason = 'na disputa de playoffs'
    }
    if (sit.avgOvr >= 75 && sit.avgOvr < 82) score += 12
    if (mid && winPct >= 0.5) score += 10
    if (sit.cap.usagePct > 98) score -= 6
    list.push({ id: 'playoffs', score, reason })
  }

  // Título
  {
    let score = baseId === 'title' ? 46 : 16
    let reason = 'janela de título aberta'
    if (winPct >= 0.62 && sit.avgOvr >= 79) {
      score += 40
      reason = 'elenco elite e campanha forte'
    }
    if (sit.avgOvr >= 82) score += 14
    if (late && winPct >= 0.58) score += 12
    if (winPct < 0.45 && games >= 14) {
      score -= 28
      reason = 'fora da janela de título'
    }
    if (early && baseId === 'title' && sit.avgOvr >= 78) score += 8
    list.push({ id: 'title', score, reason })
  }

  // Desenvolvimento
  {
    let score = baseId === 'development' ? 44 : 20
    let reason = 'núcleo jovem em formação'
    if (sit.avgAge <= 24.8 && sit.avgPot >= 81) {
      score += 34
      reason = 'idade baixa e alto potencial'
    }
    if (winPct >= 0.35 && winPct <= 0.55) score += 10
    if (sit.avgOvr >= 80 && winPct >= 0.6) score -= 18
    list.push({ id: 'development', score, reason })
  }

  // Economia
  {
    let score = baseId === 'economy' ? 44 : 18
    let reason = 'disciplina financeira'
    if (sit.cap.overCap || sit.cap.usagePct >= 94) {
      score += 42
      reason = 'pressão de salary cap'
    }
    if (sit.cap.usagePct >= 88) score += 12
    if (sit.mode === 'cap_crunch') {
      score += 20
      reason = 'modo cap crunch'
    }
    if (sit.cap.space > 25_000_000 && baseId !== 'economy') score -= 10
    list.push({ id: 'economy', score, reason })
  }

  return list
}

/**
 * Atualiza objetivos de todas as franquias no estado GM.
 */
export function updateAllFranchiseObjectives(gm, seasonState = {}) {
  const objectives = { ...(gm.objectives ?? {}) }
  const teamIds = Object.keys(gm.rosters ?? {})
  const log = []

  for (const teamId of teamIds) {
    const resolved = resolveFranchiseObjective(gm, teamId, seasonState)
    const prev = objectives[teamId]?.objectiveId
    objectives[teamId] = {
      objectiveId: resolved.objectiveId,
      label: resolved.label,
      reason: resolved.reason,
      updatedWeek: seasonState.currentWeek ?? seasonState.week ?? null,
      score: resolved.score,
    }
    if (prev && prev !== resolved.objectiveId) {
      log.push({
        teamId,
        from: prev,
        to: resolved.objectiveId,
        reason: resolved.reason,
      })
    }
  }

  return { gm: { ...gm, objectives }, changes: log, objectives }
}

export function getFranchiseObjective(gm, teamId) {
  const id = gm.objectives?.[teamId]?.objectiveId
  if (id && FRANCHISE_OBJECTIVES[id]) {
    return {
      ...gm.objectives[teamId],
      objective: FRANCHISE_OBJECTIVES[id],
      weights: FRANCHISE_OBJECTIVES[id].weights,
    }
  }
  return null
}
