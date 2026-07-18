import { trait } from '../personality/traits'
import { sortByMockRank } from './mock'

/**
 * Score do prospect para um time — objetivo da Franchise AI + necessidades + mock.
 * Determinístico.
 */
export function scoreProspectForTeam(prospect, sit) {
  if (!prospect || !sit) return 0

  const w = sit.weights ?? sit.personality?.weights ?? {}
  const objectiveId = sit.objectiveId
  let score = 0

  score += (prospect.overall ?? 70) * (w.winNow ?? 1) * 0.9
  score += (prospect.potencial ?? 70) * (w.potential ?? 1) * 1.15
  score += Math.max(0, 24 - (prospect.idade ?? 20)) * (w.youth ?? 1) * 3

  if (sit.needs?.includes(prospect.posicao)) {
    score += 28
  }

  const mockRank = prospect.mockDraft?.rank ?? 20
  score += Math.max(0, 22 - mockRank) * 1.8

  score += (trait(prospect, 'lideranca') - 50) * 0.15
  score += (trait(prospect, 'disciplina') - 50) * 0.12
  score += (trait(prospect, 'competitividade') - 50) * 0.1

  if (objectiveId === 'economy' || sit.personalityId === 'financeira') {
    score -= (prospect.salario ?? 0) / 1_200_000
    score -= (trait(prospect, 'ego') - 50) * 0.12
  }
  if (
    objectiveId === 'tank' ||
    objectiveId === 'development' ||
    sit.mode === 'rebuild'
  ) {
    score += ((prospect.potencial ?? 70) - (prospect.overall ?? 70)) * 1.35
  }
  if (objectiveId === 'title' || objectiveId === 'playoffs') {
    score += (prospect.overall ?? 0) * (w.starHunting ?? 1) * 0.35
  }

  const samePos = (sit.roster ?? []).filter(
    (p) => p.posicao === prospect.posicao,
  )
  if (samePos.length >= 2) score -= 12

  return score
}

/**
 * Escolhe o melhor prospect (maior score). Empate: mock rank, depois id.
 * Sem aleatoriedade.
 */
export function selectProspectForTeam(board, sit /*, rng */) {
  if (!board?.length) return null

  const ranked = [...board]
    .map((p) => ({ p, score: scoreProspectForTeam(p, sit) }))
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
 * Board pública ordenada por mock (para UI).
 */
export function getDraftBoard(draftClass = []) {
  return sortByMockRank(draftClass).map((p, i) => ({
    boardRank: i + 1,
    mockRank: p.mockDraft?.rank ?? i + 1,
    id: p.id,
    nome: p.nome,
    posicao: p.posicao,
    idade: p.idade,
    universidade: p.universidade,
    arquetipo: p.arquetipo,
    overall: p.overall,
    potencial: p.potencial,
    personalidade: p.personalidade,
    mockDraft: p.mockDraft,
  }))
}
