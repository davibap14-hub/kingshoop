/**
 * Decisão de set ofensivo / PnR / isolamento — Decision Engine.
 * Preferência: Playbook Engine (melhor jogada da franquia por posse).
 */

import { CHEMISTRY_SIM_WEIGHTS } from '../../data/chemistry'
import { ACTION_SET_BASE_WEIGHTS } from '../../data/simulation/constants'
import { DECISION_IDS } from '../../data/decision'
import { COACH_CATEGORY_BIAS, DEFAULT_CATEGORY_BIAS } from '../../data/playbook/constants.js'
import { boostToScoreFactor } from '../chemistry/effects'
import { decidePlaybookPlay } from '../playbook/decide.js'
import { combineScore } from '../simulation/weights'
import { decide } from './decide.js'
import { dnaSetBias } from '../dna/factors.js'
import { attr, situationBundle, tendency } from './factors.js'
import { decidePostPlayer } from './roles.js'

/**
 * Escolhe o set ofensivo com todos os fatores situacionais.
 * Se houver playbook da franquia, a Playbook Engine decide a jogada.
 */
export function decideOffensiveSet({
  offensePlayers,
  ballHandler,
  ctx,
  rng,
}) {
  const handler = ballHandler

  if (ctx.playbook?.plays?.length || ctx.playbook?.playIds?.length) {
    const archetypeId = ctx.coach?.archetypeId
    const play = decidePlaybookPlay({
      offensePlayers,
      ballHandler,
      ctx: {
        ...ctx,
        playbookCategoryBias:
          ctx.playbookCategoryBias ??
          COACH_CATEGORY_BIAS[archetypeId] ??
          DEFAULT_CATEGORY_BIAS,
      },
      playbook: ctx.playbook,
      rng,
    })
    if (play?.id) return play
  }

  const postPlayer = decidePostPlayer(offensePlayers, ctx, rng)
  const chem = ctx.chemistryEffects
  const cw = chem?.weights ?? CHEMISTRY_SIM_WEIGHTS
  const offChem = boostToScoreFactor(chem?.offenseEfficiency)
  const passChem = boostToScoreFactor(chem?.passBoost ?? chem?.aiPassBias)
  const cutChem = boostToScoreFactor(chem?.movementBoost ?? chem?.aiCutBias)
  const teamChem = chem?.teamChemistry ?? ctx.chemistry ?? 55
  const setBias = ctx.coachSetBias ?? {}
  const sit = situationBundle(ctx, 'offense')

  const sitBoost = combineScore([
    { value: sit.momentum, weight: 0.8 },
    { value: sit.pressure, weight: 0.6 },
    { value: sit.fatigue, weight: 0.7, invert: true },
    { value: sit.importance, weight: 0.45 },
  ])

  const sets = [
    {
      id: 'pick_and_roll',
      score: combineScore([
        { value: ACTION_SET_BASE_WEIGHTS.pick_and_roll * 70, weight: 0.7 },
        { value: attr(handler, 'qi.tomadaDecisao'), weight: 0.8 },
        { value: tendency(handler, 'pass'), weight: 1.1 },
        { value: tendency(handler, 'drive'), weight: 0.7 },
        { value: tendency(postPlayer, 'alleyOop'), weight: 0.5 },
        { value: (ctx.styleThreeBias ?? 0) * 100, weight: 0.25 },
        { value: passChem, weight: cw.setPassBias },
        { value: offChem, weight: cw.offenseEfficiency * 0.6 },
        { value: teamChem, weight: cw.aiDecision * 0.5 },
        { value: setBias.pick_and_roll ?? 50, weight: 0.55 },
        { value: dnaSetBias(handler, 'pick_and_roll'), weight: 0.85 },
        { value: sitBoost * 100, weight: 0.45, scale: 100 },
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
        { value: passChem, weight: cw.setPassBias * 0.35, invert: true },
        { value: teamChem, weight: cw.aiDecision * 0.35 },
        { value: setBias.isolation ?? 50, weight: 0.55 },
        { value: dnaSetBias(handler, 'isolation'), weight: 0.85 },
        // Iso sobe sob alta pressão / ego do handler já no role
        { value: sit.pressure, weight: 0.35 },
        { value: sitBoost * 100, weight: 0.3, scale: 100 },
      ]),
    },
    {
      id: 'drive',
      score: combineScore([
        { value: ACTION_SET_BASE_WEIGHTS.drive * 70, weight: 0.6 },
        { value: tendency(handler, 'drive'), weight: 1.5 },
        { value: attr(handler, 'fisico.velocidade'), weight: 0.9 },
        { value: attr(handler, 'arremesso.bandeja'), weight: 0.7 },
        { value: (ctx.stylePace ?? 1) * 50, weight: 0.35 },
        { value: cutChem, weight: cw.setCutBias * 0.7 },
        { value: offChem, weight: cw.offenseEfficiency * 0.5 },
        { value: setBias.drive ?? 50, weight: 0.55 },
        { value: dnaSetBias(handler, 'drive'), weight: 0.85 },
        { value: sit.fatigue, weight: 0.4, invert: true },
        { value: sitBoost * 100, weight: 0.35, scale: 100 },
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
        { value: setBias.post_up ?? 50, weight: 0.55 },
        { value: dnaSetBias(postPlayer ?? handler, 'post_up'), weight: 0.7 },
        { value: sitBoost * 100, weight: 0.3, scale: 100 },
      ]),
      meta: { postPlayer },
    },
    {
      id: 'cut',
      score: combineScore([
        { value: ACTION_SET_BASE_WEIGHTS.cut * 70, weight: 0.6 },
        { value: tendency(handler, 'pass'), weight: 1.3 },
        { value: attr(handler, 'qi.visao'), weight: 0.9 },
        { value: (ctx.styleMotion ?? 0.5) * 80, weight: 0.45 },
        { value: cutChem, weight: cw.setCutBias },
        { value: passChem, weight: cw.setPassBias },
        { value: teamChem, weight: cw.aiDecision * 0.55 },
        { value: setBias.cut ?? 50, weight: 0.55 },
        { value: dnaSetBias(handler, 'cut'), weight: 0.85 },
        { value: sitBoost * 100, weight: 0.4, scale: 100 },
      ]),
    },
  ]

  if (ctx.allowFastBreak) {
    sets.push({
      id: 'fast_break',
      score: combineScore([
        { value: 70, weight: 0.7 },
        { value: tendency(handler, 'fastBreak'), weight: 1.6 },
        { value: attr(handler, 'fisico.velocidade'), weight: 1.0 },
        { value: (ctx.stylePace ?? 1) * 60, weight: 0.5 },
        { value: cutChem, weight: cw.movement * 0.6 },
        { value: dnaSetBias(handler, 'fast_break'), weight: 0.9 },
        { value: sit.fatigue, weight: 0.5, invert: true },
        { value: sit.momentum, weight: 0.55 },
      ]),
      mult: 1.25,
    })
  }

  return decide(DECISION_IDS.offensive_set, sets, ctx, rng).choice
}
