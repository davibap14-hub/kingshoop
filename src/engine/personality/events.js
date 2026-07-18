import { trait } from './traits'

/**
 * Multiplicador de peso do evento pela personalidade do jogador.
 */
export function calcEventWeightMultiplier(event, player) {
  if (!event || !player) return 1

  const cat = event.categoria
  const temper = trait(player, 'temperamento')
  const ego = trait(player, 'ego')
  const lealdade = trait(player, 'lealdade')
  const competitividade = trait(player, 'competitividade')
  const disciplina = trait(player, 'disciplina')
  const ambicao = trait(player, 'ambicao')

  let mult = 1

  switch (cat) {
    case 'midia':
      mult += (ego - 50) * 0.006
      break
    case 'companheiros':
      mult += (lealdade - 50) * 0.004 - (ego - 55) * 0.003
      break
    case 'treinador':
      mult += (disciplina - 50) * 0.003 - (temper - 55) * 0.004
      break
    case 'lesoes':
      mult += (temper - 50) * 0.003
      break
    case 'dinheiro':
    case 'patrocinio':
      mult += (ambicao - 50) * 0.004 + (ego - 50) * 0.002
      break
    case 'nba':
      mult += (competitividade - 50) * 0.004 + (ambicao - 50) * 0.003
      break
    case 'treino':
      mult += (disciplina - 50) * 0.005
      break
    case 'torcedores':
      mult += (ego - 50) * 0.003 + (competitividade - 50) * 0.002
      break
    default:
      break
  }

  return Math.max(0.45, Math.min(1.8, mult))
}

/**
 * Condições de personalidade em eventos (`condicoes.minEgo`, etc.).
 */
export function matchesPersonalityConditions(event, player) {
  const c = event?.condicoes ?? {}
  if (!player) return true

  const checks = [
    ['minCompetitividade', 'competitividade', true],
    ['maxCompetitividade', 'competitividade', false],
    ['minEgo', 'ego', true],
    ['maxEgo', 'ego', false],
    ['minLideranca', 'lideranca', true],
    ['maxLideranca', 'lideranca', false],
    ['minLealdade', 'lealdade', true],
    ['maxLealdade', 'lealdade', false],
    ['minTemperamento', 'temperamento', true],
    ['maxTemperamento', 'temperamento', false],
    ['minAmbicao', 'ambicao', true],
    ['maxAmbicao', 'ambicao', false],
    ['minDisciplina', 'disciplina', true],
    ['maxDisciplina', 'disciplina', false],
    ['minConfianca', 'confianca', true],
    ['maxConfianca', 'confianca', false],
  ]

  for (const [condKey, traitKey, isMin] of checks) {
    if (c[condKey] == null) continue
    const value = trait(player, traitKey)
    if (isMin && value < c[condKey]) return false
    if (!isMin && value > c[condKey]) return false
  }

  return true
}

/**
 * Score de afinidade da escolha com a personalidade (para ordenar / sugerir).
 */
export function scoreChoiceAffinity(choice, player) {
  if (!choice || !player) return 0
  const effects = choice.efeitos ?? {}
  let score = 0

  const ego = trait(player, 'ego')
  const lealdade = trait(player, 'lealdade')
  const disciplina = trait(player, 'disciplina')
  const ambicao = trait(player, 'ambicao')
  const competitividade = trait(player, 'competitividade')
  const temper = trait(player, 'temperamento')
  const confianca = trait(player, 'confianca')
  const lideranca = trait(player, 'lideranca')

  if (effects.popularidade) {
    score += effects.popularidade * ((ego - 40) / 60)
  }
  if (effects.dinheiro) {
    score += Math.sign(effects.dinheiro) * ((ambicao + ego - 90) / 80)
  }
  if (effects.relCompanheiros) {
    score += effects.relCompanheiros * ((lealdade + lideranca - 90) / 100)
  }
  if (effects.relTreinador) {
    score += effects.relTreinador * ((disciplina - 40) / 70)
  }
  if (effects.motivacao) {
    score += effects.motivacao * ((competitividade + confianca - 90) / 100)
  }
  if (effects.felicidade) {
    score += effects.felicidade * 0.4
  }

  const magnitude = Object.values(effects).reduce(
    (s, v) => s + Math.abs(Number(v) || 0),
    0,
  )
  if (temper >= 70 && magnitude >= 12) score += 1.2
  if (disciplina >= 70 && magnitude <= 8) score += 0.8

  return score
}

/**
 * Ordena escolhas do evento pela afinidade com a personalidade.
 */
export function sortChoicesByPersonality(escolhas = [], player) {
  return [...escolhas].sort(
    (a, b) => scoreChoiceAffinity(b, player) - scoreChoiceAffinity(a, player),
  )
}

/**
 * Ajusta deltas da escolha conforme personalidade.
 */
export function applyPersonalityToChoiceEffects(deltas = {}, player) {
  if (!player) return { ...deltas }

  const next = { ...deltas }
  const ego = trait(player, 'ego')
  const lealdade = trait(player, 'lealdade')
  const temper = trait(player, 'temperamento')
  const disciplina = trait(player, 'disciplina')

  if (next.relCompanheiros) {
    const mod = 1 + (lealdade - 50) * 0.004 - (ego - 55) * 0.003
    next.relCompanheiros = Math.round(next.relCompanheiros * mod)
  }
  if (next.relTreinador) {
    const mod = 1 + (disciplina - 50) * 0.004 - (temper - 55) * 0.003
    next.relTreinador = Math.round(next.relTreinador * mod)
  }
  if (next.motivacao && temper >= 70 && next.motivacao < 0) {
    next.motivacao = Math.round(next.motivacao * 1.2)
  }
  if (next.popularidade && ego >= 70) {
    next.popularidade = Math.round(next.popularidade * 1.15)
  }

  return next
}
