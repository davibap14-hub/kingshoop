import { CHEMISTRY_SIM_WEIGHTS } from '../../data/chemistry'
import { ACTION_SET_BASE_WEIGHTS, HOME_FACTORS } from '../../data/simulation/constants'
import { boostToScoreFactor } from '../chemistry/effects'
import {
  pickBallHandler,
  pickCutter,
  pickHelpDefender,
  pickIndividualDefender,
  pickKickTarget,
  pickRebounder,
  pickScreener,
} from './actors'
import {
  attr,
  combineScore,
  contestedSelect,
  tendency,
  weightedSelect,
} from './weights'

/**
 * Escolhe o set ofensivo com pesos combinados
 * (attrs + tendências + contexto + química).
 * Nunca aleatório puro.
 */
export function chooseOffensiveSet({
  offensePlayers,
  ballHandler,
  context,
  rng,
}) {
  const handler = ballHandler
  const postPlayer = pickPostPlayer(offensePlayers, rng)
  const chem = context.chemistryEffects
  const cw = chem?.weights ?? CHEMISTRY_SIM_WEIGHTS
  const offChem = boostToScoreFactor(chem?.offenseEfficiency)
  const passChem = boostToScoreFactor(chem?.passBoost ?? chem?.aiPassBias)
  const cutChem = boostToScoreFactor(chem?.movementBoost ?? chem?.aiCutBias)
  const teamChem = chem?.teamChemistry ?? context.chemistry ?? 55

  const sets = [
    {
      id: 'pick_and_roll',
      score: combineScore([
        { value: ACTION_SET_BASE_WEIGHTS.pick_and_roll * 70, weight: 0.7 },
        { value: attr(handler, 'qi.tomadaDecisao'), weight: 0.8 },
        { value: tendency(handler, 'pass'), weight: 1.1 },
        { value: tendency(handler, 'drive'), weight: 0.7 },
        { value: tendency(postPlayer, 'alleyOop'), weight: 0.5 },
        { value: context.styleThreeBias * 100, weight: 0.25 },
        { value: passChem, weight: cw.setPassBias },
        { value: offChem, weight: cw.offenseEfficiency * 0.6 },
        { value: teamChem, weight: cw.aiDecision * 0.5 },
      ]),
    },
    {
      id: 'isolation',
      score: combineScore([
        { value: ACTION_SET_BASE_WEIGHTS.isolation * 70, weight: 0.6 },
        { value: tendency(handler, 'isolation'), weight: 1.5 },
        { value: tendency(handler, 'stepBack'), weight: 0.6 },
        { value: tendency(handler, 'fadeaway'), weight: 0.5 },
        { value: attr(handler, 'arremesso.midRange'), weight: 0.7 },
        { value: handler?.overall ?? 70, weight: 0.4 },
        // Iso sofre um pouco com química alta (preferência coletiva)
        { value: passChem, weight: cw.setPassBias * 0.35, invert: true },
        { value: teamChem, weight: cw.aiDecision * 0.35 },
      ]),
    },
    {
      id: 'drive',
      score: combineScore([
        { value: ACTION_SET_BASE_WEIGHTS.drive * 70, weight: 0.6 },
        { value: tendency(handler, 'drive'), weight: 1.5 },
        { value: attr(handler, 'fisico.velocidade'), weight: 0.9 },
        { value: attr(handler, 'arremesso.bandeja'), weight: 0.7 },
        { value: context.stylePace * 50, weight: 0.35 },
        { value: cutChem, weight: cw.setCutBias * 0.7 },
        { value: offChem, weight: cw.offenseEfficiency * 0.5 },
      ]),
    },
    {
      id: 'post_up',
      score: combineScore([
        { value: ACTION_SET_BASE_WEIGHTS.post_up * 70, weight: 0.55 },
        { value: tendency(postPlayer, 'postUp'), weight: 1.6 },
        { value: attr(postPlayer, 'fisico.forca'), weight: 0.9 },
        { value: attr(postPlayer, 'arremesso.bandeja'), weight: 0.6 },
        { value: postPlayer?.overall ?? 65, weight: 0.4 },
        {
          value: chem?.pairScoreBetween?.(handler?.id, postPlayer?.id) ?? 50,
          weight: cw.pass,
        },
        { value: offChem, weight: cw.offenseEfficiency * 0.45 },
      ]),
      meta: { postPlayer },
    },
    {
      id: 'cut',
      score: combineScore([
        { value: ACTION_SET_BASE_WEIGHTS.cut * 70, weight: 0.6 },
        { value: tendency(handler, 'pass'), weight: 1.3 },
        { value: attr(handler, 'qi.visao'), weight: 0.9 },
        { value: context.styleMotion * 80, weight: 0.45 },
        { value: cutChem, weight: cw.setCutBias },
        { value: passChem, weight: cw.setPassBias },
        { value: teamChem, weight: cw.aiDecision * 0.55 },
      ]),
    },
  ]

  if (context.allowFastBreak) {
    sets.push({
      id: 'fast_break',
      score: combineScore([
        { value: 70, weight: 0.7 },
        { value: tendency(handler, 'fastBreak'), weight: 1.6 },
        { value: attr(handler, 'fisico.velocidade'), weight: 1.0 },
        { value: context.transitionDefense, weight: 0.85, invert: true },
        { value: context.stylePace * 60, weight: 0.5 },
        { value: cutChem, weight: cw.movement * 0.6 },
      ]),
      mult: 1.25,
    })
  }

  return weightedSelect(sets, rng)
}

/** Escolhe o jogador de post com base na tendência Post Up. */
export function pickPostPlayer(offensePlayers, rng) {
  const entries = offensePlayers.map((p) => ({
    id: p.id,
    player: p,
    score: combineScore([
      { value: tendency(p, 'postUp'), weight: 1.5 },
      { value: attr(p, 'fisico.forca'), weight: 0.9 },
      { value: ['C', 'PF'].includes(p.posicao) ? 85 : 40, weight: 0.7 },
    ]),
  }))
  return weightedSelect(entries, rng)?.player ?? offensePlayers[0]
}

/**
 * Duelo ball handler vs defesa individual (+ chance de ajuda).
 * Química entra como peso (passe / movimentação / pressão) — sem RNG puro.
 */
export function resolveOnBallPressure({
  ballHandler,
  defender,
  helpDefender,
  isHome,
  chemistry = 55,
  chemistryEffects = null,
  rng,
}) {
  const cw = chemistryEffects?.weights ?? CHEMISTRY_SIM_WEIGHTS
  const teamChem = chemistryEffects?.teamChemistry ?? chemistry
  const passChem = boostToScoreFactor(chemistryEffects?.passBoost)
  const moveChem = boostToScoreFactor(chemistryEffects?.movementBoost)

  const attackScore = combineScore([
    { value: attr(ballHandler, 'qi.tomadaDecisao'), weight: 1.0 },
    { value: attr(ballHandler, 'fisico.velocidade'), weight: 0.9 },
    { value: tendency(ballHandler, 'drive'), weight: 0.55 },
    { value: tendency(ballHandler, 'pass'), weight: 0.45 },
    { value: ballHandler?.overall ?? 70, weight: 0.5 },
    { value: teamChem, weight: cw.onBallPressure },
    { value: passChem, weight: cw.pass * 0.55 },
    { value: moveChem, weight: cw.movement * 0.45 },
    { value: 50 + homeBoost(isHome, 'ballSecurity') * 100, weight: 0.35 },
  ])

  const defenseScore = combineScore([
    { value: attr(defender, 'defesa.perimetro'), weight: 1.2 },
    { value: attr(defender, 'defesa.roubo'), weight: 1.0 },
    { value: attr(defender, 'fisico.velocidade'), weight: 0.9 },
    { value: defender?.overall ?? 70, weight: 0.5 },
  ])

  const helpChem =
    chemistryEffects?.pairScoreBetween?.(defender?.id, helpDefender?.id) ?? 50

  const helpScore = combineScore([
    { value: attr(helpDefender, 'defesa.garrafao'), weight: 1.0 },
    { value: attr(helpDefender, 'qi.tomadaDecisao'), weight: 0.9 },
    { value: attr(helpDefender, 'defesa.roubo'), weight: 0.7 },
    { value: helpChem, weight: cw.defense * 0.7 },
  ])

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
 * Escolhe o estilo de finalização a partir das tendências do shooter.
 * @returns {{ shotType: string, action: string|null, label: string }}
 */
export function chooseFinishStyle({
  shooter,
  context = {},
  rng,
}) {
  const allowThree = context.allowThree !== false
  const allowAlley = Boolean(context.allowAlleyOop)
  const preferInside = Boolean(context.preferInside)

  const entries = [
    {
      id: 'drive_finish',
      shotType: 'layup',
      action: null,
      score: combineScore([
        { value: tendency(shooter, 'drive'), weight: preferInside ? 1.4 : 1.0 },
        { value: attr(shooter, 'arremesso.bandeja'), weight: 0.8 },
      ]),
    },
    {
      id: 'step_back',
      shotType: tendency(shooter, 'shoot3') >= tendency(shooter, 'stepBack')
        ? 'three'
        : 'two',
      action: 'step_back',
      score: combineScore([
        { value: tendency(shooter, 'stepBack'), weight: 1.4 },
        { value: attr(shooter, 'arremesso.midRange'), weight: 0.7 },
        { value: attr(shooter, 'arremesso.tresPontos'), weight: 0.55 },
      ]),
    },
    {
      id: 'fadeaway',
      shotType: 'two',
      action: 'fadeaway',
      score: combineScore([
        { value: tendency(shooter, 'fadeaway'), weight: 1.45 },
        { value: attr(shooter, 'arremesso.midRange'), weight: 0.9 },
      ]),
    },
  ]

  if (allowThree) {
    entries.push({
      id: 'shoot3',
      shotType: 'three',
      action: null,
      score: combineScore([
        { value: tendency(shooter, 'shoot3'), weight: 1.55 },
        { value: attr(shooter, 'arremesso.tresPontos'), weight: 0.85 },
      ]),
    })
  }

  if (allowAlley) {
    entries.push({
      id: 'alley_oop',
      shotType: 'alley_oop',
      action: 'alley_oop',
      score: combineScore([
        { value: tendency(shooter, 'alleyOop'), weight: 1.5 },
        { value: attr(shooter, 'fisico.impulsao'), weight: 1.0 },
        { value: attr(shooter, 'arremesso.bandeja'), weight: 0.7 },
        { value: context.passerPassTend ?? 50, weight: 0.8 },
      ]),
      mult: 1.1,
    })
  }

  if (context.allowPost) {
    entries.push({
      id: 'post',
      shotType: 'post',
      action: null,
      score: combineScore([
        { value: tendency(shooter, 'postUp'), weight: 1.5 },
        { value: attr(shooter, 'fisico.forca'), weight: 0.9 },
      ]),
    })
  }

  const pick = weightedSelect(entries, rng)
  return {
    id: pick?.id ?? 'drive_finish',
    shotType: pick?.shotType ?? 'two',
    action: pick?.action ?? null,
  }
}

/**
 * Resolve finalização / chute com pesos combinados + eficiência ofensiva da química.
 */
export function resolveShot({
  shooter,
  defender,
  helpDefender,
  shotType, // 'two' | 'three' | 'layup' | 'post' | 'alley_oop' | 'step_back' | 'fadeaway'
  isHome,
  openLook,
  chemistryEffects = null,
  assister = null,
  rng,
}) {
  const normalizedType =
    shotType === 'step_back'
      ? tendency(shooter, 'shoot3') >= 60
        ? 'three'
        : 'two'
      : shotType === 'fadeaway'
        ? 'two'
        : shotType

  const finishAttr =
    normalizedType === 'three'
      ? attr(shooter, 'arremesso.tresPontos')
      : normalizedType === 'layup' ||
          normalizedType === 'post' ||
          normalizedType === 'alley_oop'
        ? attr(shooter, 'arremesso.bandeja')
        : attr(shooter, 'arremesso.midRange')

  const tendencyBoost =
    normalizedType === 'three'
      ? tendency(shooter, 'shoot3')
      : normalizedType === 'alley_oop'
        ? tendency(shooter, 'alleyOop')
        : shotType === 'fadeaway'
          ? tendency(shooter, 'fadeaway')
          : shotType === 'step_back'
            ? tendency(shooter, 'stepBack')
            : normalizedType === 'post'
              ? tendency(shooter, 'postUp')
              : tendency(shooter, 'drive')

  const cw = chemistryEffects?.weights ?? CHEMISTRY_SIM_WEIGHTS
  const offChem = boostToScoreFactor(chemistryEffects?.offenseEfficiency)
  const pairChem =
    assister && chemistryEffects?.pairScoreBetween
      ? chemistryEffects.pairScoreBetween(assister.id, shooter.id)
      : chemistryEffects?.teamChemistry ?? 50

  const makeScore = combineScore([
    { value: finishAttr, weight: 1.25 },
    { value: tendencyBoost, weight: 0.85 },
    {
      value: attr(shooter, 'fisico.impulsao'),
      weight:
        normalizedType === 'layup' || normalizedType === 'alley_oop' ? 1.0 : 0.35,
    },
    { value: attr(shooter, 'qi.tomadaDecisao'), weight: 0.5 },
    { value: shooter?.overall ?? 70, weight: 0.45 },
    { value: openLook ? 88 : 52, weight: 0.95 },
    { value: 50 + homeBoost(isHome, 'finish') * 100, weight: 0.3 },
    { value: offChem, weight: cw.offenseEfficiency },
    { value: pairChem, weight: cw.pass * 0.45 },
  ])

  const perimeter =
    normalizedType === 'three' ||
    normalizedType === 'two' ||
    shotType === 'step_back' ||
    shotType === 'fadeaway'

  const contestScore = combineScore([
    {
      value: perimeter
        ? attr(defender, 'defesa.perimetro')
        : attr(defender, 'defesa.garrafao'),
      weight: 1.2,
    },
    { value: attr(defender, 'defesa.toco'), weight: 1.0 },
    { value: attr(defender, 'fisico.impulsao'), weight: 0.8 },
    {
      value: helpDefender ? attr(helpDefender, 'defesa.toco') : 40,
      weight: helpDefender ? 0.7 : 0.2,
    },
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
      {
        id: 'miss',
        score: combineScore([
          { value: contestScore * 100, weight: 1.0, scale: 100 },
          { value: makeScore * 100, weight: 0.85, scale: 100, invert: true },
        ]),
      },
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

  const isThree = normalizedType === 'three'
  const points =
    outcomes?.id === 'make'
      ? isThree
        ? 3
        : 2
      : outcomes?.id === 'foul'
        ? isThree
          ? resolveFtPoints(shooter, 3, rng)
          : resolveFtPoints(shooter, 2, rng)
        : 0

  return {
    outcome: outcomes?.id ?? 'miss',
    points,
    shotType: normalizedType,
    finishStyle: shotType,
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
