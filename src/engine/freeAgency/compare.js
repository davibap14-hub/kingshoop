/**
 * Comparação entre free agents.
 */

export function compareFreeAgents(a, b) {
  if (!a || !b) return null

  const axes = [
    { key: 'overall', label: 'Overall', a: a.overall ?? 0, b: b.overall ?? 0 },
    { key: 'potencial', label: 'Potencial', a: a.potencial ?? 0, b: b.potencial ?? 0 },
    {
      key: 'idade',
      label: 'Idade (menor melhor)',
      a: a.idade ?? 30,
      b: b.idade ?? 30,
      invert: true,
    },
    {
      key: 'popularidade',
      label: 'Popularidade',
      a: a.popularidade ?? 0,
      b: b.popularidade ?? 0,
    },
    {
      key: 'salary',
      label: 'Pedido (menor melhor)',
      a: a.askedSalary ?? a.salario ?? 0,
      b: b.askedSalary ?? b.salario ?? 0,
      invert: true,
    },
    {
      key: 'interest',
      label: 'Interesse da sua franquia',
      a: a.teamInterest ?? 0,
      b: b.teamInterest ?? 0,
    },
  ].map((axis) => {
    const aWins = axis.invert ? axis.a < axis.b : axis.a > axis.b
    const bWins = axis.invert ? axis.b < axis.a : axis.b > axis.a
    return {
      ...axis,
      edge: aWins ? 'a' : bWins ? 'b' : 'tie',
    }
  })

  const aScore = axes.filter((x) => x.edge === 'a').length
  const bScore = axes.filter((x) => x.edge === 'b').length

  return {
    a: brief(a),
    b: brief(b),
    axes,
    verdict:
      aScore === bScore
        ? 'Empate técnico — o fit da franquia decide.'
        : aScore > bScore
          ? `${a.nome} leva a comparação no papel.`
          : `${b.nome} leva a comparação no papel.`,
  }
}

function brief(p) {
  return {
    id: p.id,
    nome: p.nome,
    posicao: p.posicao,
    overall: p.overall,
    potencial: p.potencial,
    idade: p.idade,
    popularidade: p.popularidade,
    askedSalary: p.askedSalary,
  }
}
