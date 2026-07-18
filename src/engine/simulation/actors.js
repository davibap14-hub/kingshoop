import { CHEMISTRY_SIM_WEIGHTS } from '../../data/chemistry'
import { combineScore, weightedSelect, attr, tendency } from './weights'

/**
 * Escolhe ball handler com pesos combinados (QI, tendências, overall, química).
 */
export function pickBallHandler(players, rng, context = {}) {
  const chem = context.chemistryEffects
  const entries = players.map((p) => {
    // Química média do jogador com o resto do elenco (IA / decisão)
    let chemScore = 50
    if (chem?.pairScoreBetween) {
      const others = players.filter((o) => o.id !== p.id)
      if (others.length) {
        chemScore =
          others.reduce(
            (s, o) => s + chem.pairScoreBetween(p.id, o.id),
            0,
          ) / others.length
      }
    }
    return {
      id: p.id,
      player: p,
      score: combineScore([
        { value: tendency(p, 'pass'), weight: 1.15 },
        { value: tendency(p, 'isolation'), weight: 0.55 },
        { value: attr(p, 'qi.tomadaDecisao'), weight: 1.0 },
        { value: attr(p, 'qi.passe'), weight: 0.85 },
        { value: attr(p, 'qi.visao'), weight: 0.75 },
        { value: attr(p, 'fisico.velocidade'), weight: 0.65 },
        { value: p.overall ?? 70, weight: 0.6 },
        {
          value: chemScore,
          weight: chem?.weights?.aiDecision ?? CHEMISTRY_SIM_WEIGHTS.aiDecision,
        },
        {
          value:
            context.preferPerimeter && ['PG', 'SG', 'SF'].includes(p.posicao)
              ? 85
              : 50,
          weight: 0.35,
        },
      ]),
    }
  })
  return weightedSelect(entries, rng)?.player ?? players[0]
}

/**
 * Defensor individual — matchup por posição + perímetro/garrafão.
 */
export function pickIndividualDefender(defensePlayers, ballHandler, rng) {
  const entries = defensePlayers.map((p) => {
    const samePos = p.posicao === ballHandler?.posicao ? 90 : 55
    const perimeter =
      ballHandler?.posicao === 'C' || ballHandler?.posicao === 'PF'
        ? attr(p, 'defesa.garrafao')
        : attr(p, 'defesa.perimetro')
    return {
      id: p.id,
      player: p,
      score: combineScore([
        { value: perimeter, weight: 1.3 },
        { value: attr(p, 'fisico.velocidade'), weight: 0.9 },
        { value: attr(p, 'defesa.roubo'), weight: 0.6 },
        { value: samePos, weight: 0.8 },
        { value: p.overall ?? 70, weight: 0.5 },
      ]),
    }
  })
  return weightedSelect(entries, rng)?.player ?? defensePlayers[0]
}

/**
 * Ajuda defensiva — química entre defensores melhora a rotação.
 */
export function pickHelpDefender(
  defensePlayers,
  primaryDefender,
  rng,
  chemistryEffects = null,
) {
  const pool = defensePlayers.filter((p) => p.id !== primaryDefender?.id)
  if (!pool.length) return primaryDefender
  const w =
    chemistryEffects?.weights?.defense ?? CHEMISTRY_SIM_WEIGHTS.defense
  const entries = pool.map((p) => ({
    id: p.id,
    player: p,
    score: combineScore([
      { value: attr(p, 'defesa.garrafao'), weight: 1.0 },
      { value: attr(p, 'defesa.perimetro'), weight: 0.8 },
      { value: attr(p, 'qi.tomadaDecisao'), weight: 0.9 },
      { value: attr(p, 'fisico.impulsao'), weight: 0.6 },
      { value: p.overall ?? 70, weight: 0.5 },
      {
        value:
          chemistryEffects?.pairScoreBetween?.(primaryDefender?.id, p.id) ??
          50,
        weight: w,
      },
    ]),
  }))
  return weightedSelect(entries, rng)?.player ?? pool[0]
}

export function pickScreener(
  offensePlayers,
  ballHandler,
  rng,
  chemistryEffects = null,
) {
  const pool = offensePlayers.filter((p) => p.id !== ballHandler?.id)
  const w = chemistryEffects?.weights?.pass ?? CHEMISTRY_SIM_WEIGHTS.pass
  const entries = pool.map((p) => ({
    id: p.id,
    player: p,
    score: combineScore([
      { value: attr(p, 'fisico.forca'), weight: 1.2 },
      { value: attr(p, 'fisico.impulsao'), weight: 0.7 },
      { value: ['PF', 'C', 'SF'].includes(p.posicao) ? 88 : 45, weight: 0.9 },
      { value: p.overall ?? 70, weight: 0.4 },
      {
        value:
          chemistryEffects?.pairScoreBetween?.(ballHandler?.id, p.id) ?? 50,
        weight: w,
      },
    ]),
  }))
  return weightedSelect(entries, rng)?.player ?? pool[0]
}

export function pickCutter(
  offensePlayers,
  ballHandler,
  screener,
  rng,
  chemistryEffects = null,
) {
  const exclude = new Set([ballHandler?.id, screener?.id])
  const pool = offensePlayers.filter((p) => !exclude.has(p.id))
  const w =
    chemistryEffects?.weights?.movement ?? CHEMISTRY_SIM_WEIGHTS.movement
  const entries = pool.map((p) => ({
    id: p.id,
    player: p,
    score: combineScore([
      { value: attr(p, 'fisico.velocidade'), weight: 1.2 },
      { value: attr(p, 'qi.visao'), weight: 0.6 },
      { value: attr(p, 'arremesso.bandeja'), weight: 0.9 },
      { value: p.overall ?? 70, weight: 0.5 },
      {
        value:
          chemistryEffects?.pairScoreBetween?.(ballHandler?.id, p.id) ?? 50,
        weight: w,
      },
    ]),
  }))
  return weightedSelect(entries, rng)?.player ?? pool[0] ?? ballHandler
}

export function pickKickTarget(
  offensePlayers,
  ballHandler,
  rng,
  chemistryEffects = null,
) {
  const pool = offensePlayers.filter((p) => p.id !== ballHandler?.id)
  const w = chemistryEffects?.weights?.pass ?? CHEMISTRY_SIM_WEIGHTS.pass
  const entries = pool.map((p) => ({
    id: p.id,
    player: p,
    score: combineScore([
      { value: tendency(p, 'shoot3'), weight: 1.5 },
      { value: tendency(p, 'stepBack'), weight: 0.55 },
      { value: attr(p, 'arremesso.tresPontos'), weight: 1.0 },
      { value: attr(p, 'arremesso.midRange'), weight: 0.5 },
      { value: attr(p, 'qi.tomadaDecisao'), weight: 0.4 },
      { value: p.overall ?? 70, weight: 0.35 },
      {
        value:
          chemistryEffects?.pairScoreBetween?.(ballHandler?.id, p.id) ?? 50,
        weight: w,
      },
    ]),
  }))
  return weightedSelect(entries, rng)?.player ?? pool[0]
}

export function pickRebounder(players, rng, { offensive = false } = {}) {
  const entries = players.map((p) => ({
    id: p.id,
    player: p,
    score: combineScore([
      { value: attr(p, 'fisico.impulsao'), weight: 1.3 },
      { value: attr(p, 'fisico.forca'), weight: 1.1 },
      { value: attr(p, 'defesa.garrafao'), weight: offensive ? 0.4 : 0.9 },
      { value: ['C', 'PF'].includes(p.posicao) ? 90 : 50, weight: 0.8 },
      { value: p.overall ?? 70, weight: 0.4 },
    ]),
  }))
  return weightedSelect(entries, rng)?.player ?? players[0]
}

export function pickPasser(players, ballHandler, rng, chemistryEffects = null) {
  if (ballHandler) return ballHandler
  return pickBallHandler(players, rng, { chemistryEffects })
}
