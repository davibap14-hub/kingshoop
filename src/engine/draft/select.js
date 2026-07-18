import { trait } from '../personality/traits'
import { getReport } from '../scouting/state.js'
import { getScoutedView } from '../scouting/report.js'
import { sortByMockRank } from './mock'

/**
 * Score do prospect para um time — usa visão scoutada (não potencial true).
 * Determinístico; baixa confiança reduz peso do upside.
 */
export function scoreProspectForTeam(prospect, sit, report = null) {
  if (!prospect || !sit) return 0

  const view = getScoutedView(prospect, report)
  const w = sit.weights ?? sit.personality?.weights ?? {}
  const objectiveId = sit.objectiveId
  const confidence = (view?.confidence ?? 10) / 100
  const overall = view?.overall ?? prospect.overall ?? 70
  const potencial = view?.potencial ?? prospect.potencial ?? 70

  let score = 0

  score += overall * (w.winNow ?? 1) * 0.9
  // Upside depende da confiança do scouting
  score += potencial * (w.potential ?? 1) * 1.15 * (0.5 + confidence * 0.5)
  score += Math.max(0, 24 - (prospect.idade ?? 20)) * (w.youth ?? 1) * 3

  if (sit.needs?.includes(prospect.posicao)) {
    score += 28
  }

  const mockRank = prospect.mockDraft?.rank ?? 20
  score += Math.max(0, 22 - mockRank) * 1.8

  // Personalidade: só se scouting revelou; senão usa traços true com peso baixo
  if (view?.personalidade) {
    score += ((view.personalidade.lideranca ?? 50) - 50) * 0.2
    score += ((view.personalidade.disciplina ?? 50) - 50) * 0.18
    score += ((view.personalidade.competitividade ?? 50) - 50) * 0.12
    score -= Math.max(0, (view.personalidade.ego ?? 50) - 65) * 0.15
  } else {
    score += (trait(prospect, 'lideranca') - 50) * 0.08
    score += (trait(prospect, 'disciplina') - 50) * 0.06
  }

  // Pontos fortes / fraquezas revelados
  for (const s of view?.strengths ?? []) {
    score += Math.max(0, (s.value ?? 50) - 70) * 0.12 * confidence
  }
  for (const wk of view?.weaknesses ?? []) {
    score -= Math.max(0, 45 - (wk.value ?? 50)) * 0.1 * confidence
  }

  if (objectiveId === 'economy' || sit.personalityId === 'financeira') {
    score -= (prospect.salario ?? 0) / 1_200_000
  }
  if (
    objectiveId === 'tank' ||
    objectiveId === 'development' ||
    sit.mode === 'rebuild'
  ) {
    score += Math.max(0, potencial - overall) * 1.35 * (0.55 + confidence * 0.45)
  }
  if (objectiveId === 'title' || objectiveId === 'playoffs') {
    score += overall * (w.starHunting ?? 1) * 0.35
  }

  const samePos = (sit.roster ?? []).filter(
    (p) => p.posicao === prospect.posicao,
  )
  if (samePos.length >= 2) score -= 12

  // Penaliza incerteza — times não apostam cego
  score -= (1 - confidence) * 14

  return score
}

/**
 * Escolhe o melhor prospect com base nos relatórios de scouting do time.
 * Sem aleatoriedade.
 */
export function selectProspectForTeam(board, sit, scouting = null) {
  if (!board?.length) return null

  const ranked = [...board]
    .map((p) => {
      const report = scouting
        ? getReport(scouting, sit.teamId, p.id)
        : null
      return { p, score: scoreProspectForTeam(p, sit, report) }
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      const ra = a.p.mockDraft?.rank ?? 999
      const rb = b.p.mockDraft?.rank ?? 999
      if (ra !== rb) return ra - rb
      return String(a.p.id).localeCompare(String(b.p.id))
    })

  return ranked[0]?.p ?? null
}

/**
 * Board para UI — valores scoutados do time (fog of war).
 */
export function getDraftBoard(draftClass = [], opts = {}) {
  const { scouting = null, teamId = null } = opts

  return sortByMockRank(draftClass).map((p, i) => {
    const report =
      scouting && teamId ? getReport(scouting, teamId, p.id) : null
    const view = getScoutedView(p, report)

    return {
      boardRank: i + 1,
      mockRank: p.mockDraft?.rank ?? i + 1,
      id: p.id,
      nome: p.nome,
      posicao: p.posicao,
      idade: p.idade,
      universidade: p.universidade,
      arquetipo: p.arquetipo,
      /** Estimativas de scouting — não necessariamente o true */
      overall: view?.overall ?? p.overall,
      potencial: view?.potencial ?? p.potencial,
      potentialRange: view?.potentialRange ?? null,
      confidence: view?.confidence ?? 0,
      grade: view?.grade ?? p.mockDraft?.consensus,
      strengths: view?.strengths ?? [],
      weaknesses: view?.weaknesses ?? [],
      personalidade: view?.personalidade ?? null,
      tendencias: view?.tendencias ?? null,
      scouted: Boolean(view?.scouted),
      mockDraft: p.mockDraft,
    }
  })
}
