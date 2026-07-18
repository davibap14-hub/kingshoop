/**
 * Monta o Mock Draft — ranking público pré-seleção.
 * rank 1 = melhor prospect no consenso.
 */
export function buildMockDraft(prospects = [], rng = Math.random) {
  const scored = prospects.map((p, i) => {
    const base = (p.potencial ?? 70) * 0.62 + (p.overall ?? 70) * 0.38
    const noise = (rng() - 0.5) * 6
    return {
      prospect: p,
      score: base + noise,
      seed: i,
    }
  })

  scored.sort((a, b) => b.score - a.score)

  return scored.map((row, idx) => {
    const rank = idx + 1
    const p = row.prospect
    const notes = buildMockNote(p, rank)
    return {
      ...p,
      mockDraft: {
        rank,
        consensus: Math.round(row.score * 10) / 10,
        notes,
      },
    }
  })
}

function buildMockNote(prospect, rank) {
  const arch = prospect.arquetipo ?? 'twoWay'
  const uni = prospect.universidade ?? 'College'
  if (rank <= 3) {
    return `Projeção de top pick — ${arch} de ${uni} com teto alto.`
  }
  if (rank <= 8) {
    return `Lottery talent — ${prospect.posicao} com potencial ${prospect.potencial}.`
  }
  if (rank <= 14) {
    return `Primeira rodada sólida — impacto imediato possível.`
  }
  return `Projeto de desenvolvimento — idade ${prospect.idade}, upside ${prospect.potencial}.`
}

/**
 * Ordena a board atual pelo mock rank (fallback potencial).
 */
export function sortByMockRank(prospects = []) {
  return [...prospects].sort((a, b) => {
    const ra = a.mockDraft?.rank ?? 999
    const rb = b.mockDraft?.rank ?? 999
    if (ra !== rb) return ra - rb
    return (b.potencial ?? 0) - (a.potencial ?? 0)
  })
}
