import { ACTION_SET_BASE_WEIGHTS, HOME_FACTORS } from '../../data/simulation/constants'
import {
  pickBallHandler,
  pickCutter,
  pickHelpDefender,
  pickIndividualDefender,
  pickKickTarget,
  pickRebounder,
  pickScreener,
} from './actors'
import { attr, combineScore, contestedSelect, weightedSelect } from './weights'

/**
 * Escolhe o set ofensivo com pesos combinados (attrs + base + contexto).
 */
export function chooseOffensiveSet({
  offensePlayers,
  ballHandler,
  context,
  rng,
}) {
  const handler = ballHandler
  const big = offensePlayers.find((p) => p.posicao === 'C' || p.posicao === 'PF')

  const sets = [
    {
      id: 'pick_and_roll',
      score: combineScore([
        { value: ACTION_SET_BASE_WEIGHTS.pick_and_roll * 70, weight: 0.8 },
        { value: attr(handler, 'qi.tomadaDecisao'), weight: 1.0 },
        { value: attr(handler, 'qi.passe'), weight: 0.9 },
        { value: attr(big, 'fisico.forca'), weight: 0.9 },
        { value: context.styleThreeBias * 100, weight: 0.3 },
      ]),
    },
    {
      id: 'isolation',
      score: combineScore([
        { value: ACTION_SET_BASE_WEIGHTS.isolation * 70, weight: 0.8 },
        { value: attr(handler, 'arremesso.midRange'), weight: 1.0 },
        { value: attr(handler, 'fisico.velocidade'), weight: 0.8 },
        { value: attr(handler, 'qi.tomadaDecisao'), weight: 0.7 },
        { value: handler?.overall ?? 70, weight: 0.6 },
      ]),
    },
    {
      id: 'drive',
      score: combineScore([
        { value: ACTION_SET_BASE_WEIGHTS.drive * 70, weight: 0.8 },
        { value: attr(handler, 'fisico.velocidade'), weight: 1.3 },
        { value: attr(handler, 'arremesso.bandeja'), weight: 1.1 },
        { value: attr(handler, 'fisico.impulsao'), weight: 0.7 },
        { value: context.stylePace * 50, weight: 0.4 },
      ]),
    },
    {
      id: 'post_up',
      score: combineScore([
        { value: ACTION_SET_BASE_WEIGHTS.post_up * 70, weight: 0.8 },
        { value: attr(big, 'fisico.forca'), weight: 1.3 },
        { value: attr(big, 'arremesso.bandeja'), weight: 0.9 },
        { value: attr(big, 'qi.tomadaDecisao'), weight: 0.6 },
        { value: big?.overall ?? 65, weight: 0.5 },
      ]),
      meta: { postPlayer: big },
    },
    {
      id: 'cut',
      score: combineScore([
        { value: ACTION_SET_BASE_WEIGHTS.cut * 70, weight: 0.8 },
        { value: attr(handler, 'qi.passe'), weight: 1.1 },
        { value: attr(handler, 'qi.visao'), weight: 1.0 },
        { value: context.styleMotion * 80, weight: 0.5 },
      ]),
    },
  ]

  if (context.allowFastBreak) {
    sets.push({
      id: 'fast_break',
      score: combineScore([
        { value: 75, weight: 1.0 },
        { value: attr(handler, 'fisico.velocidade'), weight: 1.4 },
        { value: attr(handler, 'arremesso.bandeja'), weight: 1.0 },
        { value: context.transitionDefense, weight: 0.9, invert: true },
        { value: context.stylePace * 60, weight: 0.6 },
      ]),
      mult: 1.25,
    })
  }

  return weightedSelect(sets, rng)
}

/**
 * Duelo ball handler vs defesa individual (+ chance de ajuda).
 */
export function resolveOnBallPressure({
  ballHandler,
  defender,
  helpDefender,
  isHome,
  rng,
}) {
  const attackScore = combineScore([
    { value: attr(ballHandler, 'qi.tomadaDecisao'), weight: 1.1 },
    { value: attr(ballHandler, 'fisico.velocidade'), weight: 1.0 },
    { value: attr(ballHandler, 'qi.passe'), weight: 0.7 },
    { value: ballHandler?.overall ?? 70, weight: 0.6 },
    { value: 50 + homeBoost(isHome, 'ballSecurity') * 100, weight: 0.4 },
  ])

  const defenseScore = combineScore([
    { value: attr(defender, 'defesa.perimetro'), weight: 1.2 },
    { value: attr(defender, 'defesa.roubo'), weight: 1.0 },
    { value: attr(defender, 'fisico.velocidade'), weight: 0.9 },
    { value: defender?.overall ?? 70, weight: 0.5 },
  ])

  const helpScore = combineScore([
    { value: attr(helpDefender, 'defesa.garrafao'), weight: 1.0 },
    { value: attr(helpDefender, 'qi.tomadaDecisao'), weight: 0.9 },
    { value: attr(helpDefender, 'defesa.roubo'), weight: 0.7 },
  ])

  // Ajuda entra como peso combinado no lado defensivo (não coin-flip)
  const helpCommit = contestedSelect(helpScore, 0.55, rng)
  const effectiveDefense =
    helpCommit.winner === 'a'
      ? combineScore([
          { value: defenseScore * 100, weight: 1.0, scale: 100 },
          { value: helpScore * 100, weight: 0.85, scale: 100 },
        ])
      : defenseScore

  const duel = contestedSelect(attackScore, effectiveDefense, rng)

  return {
    attackScore,
    defenseScore: effectiveDefense,
    helpCommitted: helpCommit.winner === 'a',
    helpDefender: helpCommit.winner === 'a' ? helpDefender : null,
    winner: duel.winner === 'a' ? 'offense' : 'defense',
    margin: duel.margin,
  }
}

function homeBoost(isHome, key) {
  return isHome ? HOME_FACTORS[key] ?? 0 : 0
}

/**
 * Resolve finalização / chute com pesos combinados.
 */
export function resolveShot({
  shooter,
  defender,
  helpDefender,
  shotType, // 'two' | 'three' | 'layup' | 'post'
  isHome,
  openLook,
  rng,
}) {
  const finishAttr =
    shotType === 'three'
      ? attr(shooter, 'arremesso.tresPontos')
      : shotType === 'layup' || shotType === 'post'
        ? attr(shooter, 'arremesso.bandeja')
        : attr(shooter, 'arremesso.midRange')

  const makeScore = combineScore([
    { value: finishAttr, weight: 1.4 },
    { value: attr(shooter, 'fisico.impulsao'), weight: shotType === 'layup' ? 0.9 : 0.4 },
    { value: attr(shooter, 'qi.tomadaDecisao'), weight: 0.6 },
    { value: shooter?.overall ?? 70, weight: 0.5 },
    { value: openLook ? 88 : 52, weight: 1.0 },
    { value: 50 + homeBoost(isHome, 'finish') * 100, weight: 0.35 },
  ])

  const contestScore = combineScore([
    {
      value:
        shotType === 'three' || shotType === 'two'
          ? attr(defender, 'defesa.perimetro')
          : attr(defender, 'defesa.garrafao'),
      weight: 1.2,
    },
    { value: attr(defender, 'defesa.toco'), weight: 1.0 },
    { value: attr(defender, 'fisico.impulsao'), weight: 0.8 },
    { value: helpDefender ? attr(helpDefender, 'defesa.toco') : 40, weight: helpDefender ? 0.7 : 0.2 },
    { value: 50 + homeBoost(!isHome, 'contest') * 100, weight: 0.3 },
  ])

  const blockScore = combineScore([
    { value: attr(defender, 'defesa.toco'), weight: 1.3 },
    { value: attr(defender, 'fisico.impulsao'), weight: 1.0 },
    { value: contestScore * 100, weight: 0.5, scale: 100 },
    { value: makeScore * 100, weight: 0.4, scale: 100, invert: true },
  ])

  const outcomes = weightedSelect(
    [
      { id: 'make', score: makeScore, mult: 1.0 },
      { id: 'miss', score: combineScore([
        { value: contestScore * 100, weight: 1.0, scale: 100 },
        { value: makeScore * 100, weight: 0.85, scale: 100, invert: true },
      ]) },
      { id: 'block', score: blockScore, mult: 0.55 },
      {
        id: 'foul',
        score: combineScore([
          { value: attr(defender, 'defesa.perimetro'), weight: 0.4, invert: true },
          { value: attr(shooter, 'fisico.forca'), weight: 0.8 },
          { value: contestScore * 100, weight: 0.6, scale: 100 },
          { value: 35, weight: 0.5 },
        ]),
        mult: 0.4,
      },
    ],
    rng,
  )

  const points =
    outcomes?.id === 'make'
      ? shotType === 'three'
        ? 3
        : 2
      : outcomes?.id === 'foul'
        ? shotType === 'three'
          ? resolveFtPoints(shooter, 3, rng)
          : resolveFtPoints(shooter, 2, rng)
        : 0

  return {
    outcome: outcomes?.id ?? 'miss',
    points,
    shotType,
    makeScore,
    contestScore,
  }
}

function resolveFtPoints(shooter, attempts, rng) {
  let made = 0
  for (let i = 0; i < attempts; i++) {
    const ftScore = combineScore([
      { value: attr(shooter, 'arremesso.lanceLivre'), weight: 1.5 },
      { value: attr(shooter, 'qi.tomadaDecisao'), weight: 0.4 },
      { value: shooter?.overall ?? 70, weight: 0.3 },
    ])
    const missScore = combineScore([
      { value: ftScore * 100, weight: 1, scale: 100, invert: true },
      { value: 40, weight: 0.5 },
    ])
    const pick = contestedSelect(ftScore, missScore, rng)
    if (pick.winner === 'a') made += 1
  }
  return made
}

/**
 * Rebound ofensivo vs defensivo — pesos combinados.
 */
export function resolveRebound({
  offensePlayers,
  defensePlayers,
  isHome,
  rng,
}) {
  const offPlayer = pickRebounder(offensePlayers, rng, { offensive: true })
  const defPlayer = pickRebounder(defensePlayers, rng, { offensive: false })

  const orbScore = combineScore([
    { value: attr(offPlayer, 'fisico.impulsao'), weight: 1.2 },
    { value: attr(offPlayer, 'fisico.forca'), weight: 1.1 },
    { value: attr(offPlayer, 'qi.tomadaDecisao'), weight: 0.5 },
    { value: 38 + homeBoost(isHome, 'finish') * 80, weight: 0.6 },
  ])

  const drbScore = combineScore([
    { value: attr(defPlayer, 'fisico.impulsao'), weight: 1.2 },
    { value: attr(defPlayer, 'fisico.forca'), weight: 1.0 },
    { value: attr(defPlayer, 'defesa.garrafao'), weight: 0.9 },
    { value: 55, weight: 0.7 },
  ])

  const duel = contestedSelect(orbScore, drbScore, rng)
  if (duel.winner === 'a') {
    return {
      type: 'offensive_rebound',
      player: offPlayer,
      keepsPossession: true,
    }
  }
  return {
    type: 'defensive_rebound',
    player: defPlayer,
    keepsPossession: false,
  }
}

export {
  pickBallHandler,
  pickIndividualDefender,
  pickHelpDefender,
  pickScreener,
  pickCutter,
  pickKickTarget,
}
