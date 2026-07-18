import { trait } from '../personality/traits'
import { sortByMockRank } from './mock'

/**
 * Score do prospect para um time — necessidades + personalidade da franquia + mock.
 */
export function scoreProspectForTeam(prospect, sit) {
  if (!prospect || !sit) return 0

  const w = sit.personality?.weights ?? {}
  let score = 0

  score += (prospect.overall ?? 70) * (w.winNow ?? 1) * 0.9
  score += (prospect.potencial ?? 70) * (w.potential ?? 1) * 1.15
  score += Math.max(0, 24 - (prospect.idade ?? 20)) * (w.youth ?? 1) * 3

  if (sit.needs?.includes(prospect.posicao)) {
    score += 28
  }

  // Mock rank: melhores ranks valem mais
  const mockRank = prospect.mockDraft?.rank ?? 20
  score += Math.max(0, 22 - mockRank) * 1.8

  // Personalidade do prospect: liderança / disciplina agradam; ego alto afasta financeiras
  score += (trait(prospect, 'lideranca') - 50) * 0.15
  score += (trait(prospect, 'disciplina') - 50) * 0.12
  score += (trait(prospect, 'competitividade') - 50) * 0.1

  if (sit.personalityId === 'financeira') {
    score -= (prospect.salario ?? 0) / 1_200_000
    score -= (trait(prospect, 'ego') - 50) * 0.12
  }
  if (sit.personalityId === 'jovem' || sit.mode === 'rebuild') {
    score += (prospect.potencial - prospect.overall) * 1.2
  }
  if (sit.personalityId === 'contender' || sit.mode === 'contend') {
    score += (prospect.overall ?? 0) * (w.starHunting ?? 1) * 0.35
  }

  // Elenco já saturado na posição → penaliza
  const samePos = (sit.roster ?? []).filter((p) => p.posicao === prospect.posicao)
  if (samePos.length >= 2) score -= 12

  return score
}

/**
 * Escolhe o melhor prospect disponível para o time.
 */
export function selectProspectForTeam(board, sit, rng = Math.random) {
  if (!board?.length) return null

  const ranked = [...board]
    .map((p) => ({ p, score: scoreProspectForTeam(p, sit) }))
    .sort((a, b) => b.score - a.score)

  // 70% BPA/necessidade #1, 20% #2, 10% #3 (ruído humano)
  const roll = rng()
  const idx = roll < 0.7 ? 0 : roll < 0.9 ? 1 : 2
  return ranked[Math.min(idx, ranked.length - 1)]?.p ?? ranked[0]?.p
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
