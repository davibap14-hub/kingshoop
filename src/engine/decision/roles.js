/**
 * Decisões de papel na posse — Decision Engine.
 *
 * Quem arma · corta · recebe · infiltra · pede screen · PnR ·
 * arremessa · isola · tenta roubo · contesta · pega rebote.
 */

import { CHEMISTRY_SIM_WEIGHTS } from '../../data/chemistry'
import { DECISION_IDS } from '../../data/decision'
import { decide } from './decide.js'
import { attr, scoreCandidate, tendency } from './factors.js'

function chemBetween(chem, a, b) {
  return chem?.pairScoreBetween?.(a, b) ?? chem?.teamChemistry ?? 50
}

function avgChemWithOthers(chem, player, others) {
  if (!chem?.pairScoreBetween || !others?.length) return chem?.teamChemistry ?? 50
  return (
    others.reduce((s, o) => s + chem.pairScoreBetween(player.id, o.id), 0) /
    others.length
  )
}

/** Quem arma (ball handler). */
export function decideBallHandler(offensePlayers, ctx, rng) {
  const chem = ctx.chemistryEffects
  const options = offensePlayers.map((p) => {
    const others = offensePlayers.filter((o) => o.id !== p.id)
    const attrScore = combineAttr([
      [attr(p, 'qi.tomadaDecisao'), 1.1],
      [attr(p, 'qi.passe'), 0.9],
      [attr(p, 'qi.visao'), 0.8],
      [attr(p, 'fisico.velocidade'), 0.65],
      [p.overall ?? 70, 0.55],
    ])
    const tendencyScore = combineAttr([
      [tendency(p, 'pass'), 1.2],
      [tendency(p, 'isolation'), 0.5],
      [tendency(p, 'drive'), 0.45],
    ])
    // Sob pressão, líderes e disciplina sobem
    const coachScore = ctx.coachSetBias?.pick_and_roll ?? 50
    return scoreCandidate(p, 'ball_handler', ctx, {
      attrScore,
      tendencyScore,
      chemistryScore: avgChemWithOthers(chem, p, others),
      coachScore,
      matchupScore: ['PG', 'SG', 'SF'].includes(p.posicao) ? 80 : 50,
    })
  })
  return decide(DECISION_IDS.ball_handler, options, ctx, rng).player ?? offensePlayers[0]
}

/** Quem marca individualmente (matchup). */
export function decidePrimaryDefender(defensePlayers, ballHandler, ctx, rng) {
  const options = defensePlayers.map((p) => {
    const samePos = p.posicao === ballHandler?.posicao ? 92 : 52
    const perimeter =
      ballHandler?.posicao === 'C' || ballHandler?.posicao === 'PF'
        ? attr(p, 'defesa.garrafao')
        : attr(p, 'defesa.perimetro')
    return scoreCandidate(p, 'contest', ctx, {
      attrScore: combineAttr([
        [perimeter, 1.35],
        [attr(p, 'fisico.velocidade'), 0.95],
        [attr(p, 'defesa.roubo'), 0.55],
        [p.overall ?? 70, 0.5],
      ]),
      tendencyScore: 50,
      matchupScore: samePos,
      chemistryScore: ctx.defenseChemistryEffects?.teamChemistry ?? 50,
    })
  })
  return (
    decide(DECISION_IDS.primary_defender, options, ctx, rng).player ??
    defensePlayers[0]
  )
}

/** Quem contesta / ajuda. */
export function decideHelpDefender(defensePlayers, primary, ctx, rng) {
  const chem = ctx.defenseChemistryEffects
  const pool = defensePlayers.filter((p) => p.id !== primary?.id)
  if (!pool.length) return primary
  const options = pool.map((p) =>
    scoreCandidate(p, 'contest', ctx, {
      attrScore: combineAttr([
        [attr(p, 'defesa.garrafao'), 1.05],
        [attr(p, 'defesa.perimetro'), 0.85],
        [attr(p, 'qi.tomadaDecisao'), 0.95],
        [attr(p, 'fisico.impulsao'), 0.6],
        [p.overall ?? 70, 0.5],
      ]),
      tendencyScore: 55,
      chemistryScore: chemBetween(chem, primary?.id, p.id),
      matchupScore: 60,
    }),
  )
  return decide(DECISION_IDS.help_defender, options, ctx, rng).player ?? pool[0]
}

/** Quem tenta o roubo (geralmente o marcador primário — ranking defensivo). */
export function decideStealer(defensePlayers, ballHandler, primary, ctx, rng) {
  const pool = primary ? [primary, ...defensePlayers.filter((p) => p.id !== primary.id)] : defensePlayers
  const options = pool.slice(0, 3).map((p, i) =>
    scoreCandidate(p, 'steal', ctx, {
      attrScore: combineAttr([
        [attr(p, 'defesa.roubo'), 1.5],
        [attr(p, 'fisico.velocidade'), 1.0],
        [attr(p, 'defesa.perimetro'), 0.7],
        [p.overall ?? 70, 0.4],
      ]),
      tendencyScore: 55,
      matchupScore: p.id === primary?.id ? 85 : 50,
      chemistryScore: ctx.defenseChemistryEffects?.teamChemistry ?? 50,
      mult: i === 0 ? 1.15 : 1,
    }),
  )
  return decide(DECISION_IDS.stealer, options, ctx, rng).player ?? primary ?? pool[0]
}

/** Quem pede / dá screen. */
export function decideScreener(offensePlayers, ballHandler, ctx, rng) {
  const chem = ctx.chemistryEffects
  const pool = offensePlayers.filter((p) => p.id !== ballHandler?.id)
  const options = pool.map((p) =>
    scoreCandidate(p, 'screen', ctx, {
      attrScore: combineAttr([
        [attr(p, 'fisico.forca'), 1.25],
        [attr(p, 'fisico.impulsao'), 0.7],
        [p.overall ?? 70, 0.4],
      ]),
      tendencyScore: combineAttr([
        [tendency(p, 'alleyOop'), 0.6],
        [tendency(p, 'postUp'), 0.5],
      ]),
      chemistryScore: chemBetween(chem, ballHandler?.id, p.id),
      coachScore: ctx.coachSetBias?.pick_and_roll ?? 50,
      matchupScore: ['PF', 'C', 'SF'].includes(p.posicao) ? 88 : 42,
    }),
  )
  return decide(DECISION_IDS.screener, options, ctx, rng).player ?? pool[0]
}

/** Quem corta. */
export function decideCutter(offensePlayers, ballHandler, screener, ctx, rng) {
  const chem = ctx.chemistryEffects
  const exclude = new Set([ballHandler?.id, screener?.id])
  const pool = offensePlayers.filter((p) => !exclude.has(p.id))
  const options = pool.map((p) =>
    scoreCandidate(p, 'cutter', ctx, {
      attrScore: combineAttr([
        [attr(p, 'fisico.velocidade'), 1.25],
        [attr(p, 'arremesso.bandeja'), 0.95],
        [attr(p, 'qi.visao'), 0.55],
        [p.overall ?? 70, 0.5],
      ]),
      tendencyScore: combineAttr([
        [tendency(p, 'drive'), 0.7],
        [tendency(p, 'alleyOop'), 0.65],
      ]),
      chemistryScore: chemBetween(chem, ballHandler?.id, p.id),
      coachScore: ctx.coachSetBias?.cut ?? 50,
      matchupScore: 60,
    }),
  )
  return (
    decide(DECISION_IDS.cutter, options, ctx, rng).player ??
    pool[0] ??
    ballHandler
  )
}

/** Quem recebe o passe (kick / spot-up). */
export function decideReceiver(offensePlayers, ballHandler, ctx, rng) {
  const chem = ctx.chemistryEffects
  const pool = offensePlayers.filter((p) => p.id !== ballHandler?.id)
  // Sob pressão no placar, prefere arremessadores confiantes
  const options = pool.map((p) =>
    scoreCandidate(p, 'receiver', ctx, {
      attrScore: combineAttr([
        [attr(p, 'arremesso.tresPontos'), 1.05],
        [attr(p, 'arremesso.midRange'), 0.55],
        [attr(p, 'qi.tomadaDecisao'), 0.45],
        [p.overall ?? 70, 0.35],
      ]),
      tendencyScore: combineAttr([
        [tendency(p, 'shoot3'), 1.5],
        [tendency(p, 'stepBack'), 0.55],
      ]),
      chemistryScore: chemBetween(chem, ballHandler?.id, p.id),
      coachScore: (ctx.styleThreeBias ?? 0) * 50 + 50,
      matchupScore: ['PG', 'SG', 'SF'].includes(p.posicao) ? 75 : 55,
    }),
  )
  return decide(DECISION_IDS.receiver, options, ctx, rng).player ?? pool[0]
}

/** Quem infiltra (drive) — ranking ofensivo. */
export function decideDriver(offensePlayers, ballHandler, ctx, rng) {
  const pool = offensePlayers
  const options = pool.map((p) =>
    scoreCandidate(p, 'drive', ctx, {
      attrScore: combineAttr([
        [attr(p, 'fisico.velocidade'), 1.2],
        [attr(p, 'arremesso.bandeja'), 1.0],
        [attr(p, 'fisico.forca'), 0.55],
        [p.overall ?? 70, 0.45],
      ]),
      tendencyScore: combineAttr([
        [tendency(p, 'drive'), 1.55],
        [tendency(p, 'isolation'), 0.45],
      ]),
      chemistryScore: ctx.chemistry ?? 50,
      coachScore: ctx.coachSetBias?.drive ?? 50,
      matchupScore: p.id === ballHandler?.id ? 80 : 55,
      mult: p.id === ballHandler?.id ? 1.2 : 1,
    }),
  )
  return decide(DECISION_IDS.driver, options, ctx, rng).player ?? ballHandler
}

/** Quem força isolamento. */
export function decideIsolationPlayer(offensePlayers, ballHandler, ctx, rng) {
  const options = offensePlayers.map((p) =>
    scoreCandidate(p, 'isolation', ctx, {
      attrScore: combineAttr([
        [attr(p, 'arremesso.midRange'), 0.9],
        [attr(p, 'fisico.velocidade'), 0.7],
        [p.overall ?? 70, 0.7],
      ]),
      tendencyScore: combineAttr([
        [tendency(p, 'isolation'), 1.6],
        [tendency(p, 'stepBack'), 0.7],
        [tendency(p, 'fadeaway'), 0.55],
      ]),
      chemistryScore: ctx.chemistry ?? 50,
      coachScore: ctx.coachSetBias?.isolation ?? 50,
      matchupScore: p.id === ballHandler?.id ? 85 : 50,
      mult: p.id === ballHandler?.id ? 1.25 : 0.85,
    }),
  )
  return decide(DECISION_IDS.isolation, options, ctx, rng).player ?? ballHandler
}

/** Quem arremessa (entre candidatos). */
export function decideShooter(candidates, ctx, rng) {
  const pool = (candidates ?? []).filter(Boolean)
  if (!pool.length) return null
  if (pool.length === 1) return pool[0]
  const options = pool.map((p) =>
    scoreCandidate(p, 'shoot', ctx, {
      attrScore: combineAttr([
        [attr(p, 'arremesso.tresPontos'), 0.9],
        [attr(p, 'arremesso.midRange'), 0.8],
        [attr(p, 'arremesso.bandeja'), 0.6],
        [p.overall ?? 70, 0.5],
      ]),
      tendencyScore: combineAttr([
        [tendency(p, 'shoot3'), 1.1],
        [tendency(p, 'stepBack'), 0.5],
        [tendency(p, 'drive'), 0.45],
      ]),
      chemistryScore: ctx.chemistry ?? 50,
      coachScore: 50,
      matchupScore: 60,
    }),
  )
  return decide(DECISION_IDS.shooter, options, ctx, rng).player ?? pool[0]
}

/** Quem pega o rebote. */
export function decideRebounder(players, ctx, rng, { offensive = false } = {}) {
  const options = players.map((p) =>
    scoreCandidate(p, 'rebound', ctx, {
      attrScore: combineAttr([
        [attr(p, 'fisico.impulsao'), 1.35],
        [attr(p, 'fisico.forca'), 1.15],
        [attr(p, 'defesa.garrafao'), offensive ? 0.4 : 0.95],
        [p.overall ?? 70, 0.4],
      ]),
      tendencyScore: 55,
      chemistryScore: 50,
      matchupScore: ['C', 'PF'].includes(p.posicao) ? 90 : 48,
    }),
  )
  return decide(DECISION_IDS.rebounder, options, ctx, rng).player ?? players[0]
}

/** Quem passa (arma o lance). */
export function decidePasser(players, ballHandler, ctx, rng) {
  if (ballHandler) return ballHandler
  return decideBallHandler(players, ctx, rng)
}

/** Post player para sets. */
export function decidePostPlayer(offensePlayers, ctx, rng) {
  const options = offensePlayers.map((p) =>
    scoreCandidate(p, 'screen', ctx, {
      attrScore: combineAttr([
        [attr(p, 'fisico.forca'), 1.0],
        [attr(p, 'arremesso.bandeja'), 0.6],
        [p.overall ?? 65, 0.45],
      ]),
      tendencyScore: tendency(p, 'postUp'),
      chemistryScore: ctx.chemistry ?? 50,
      coachScore: ctx.coachSetBias?.post_up ?? 50,
      matchupScore: ['C', 'PF'].includes(p.posicao) ? 88 : 40,
    }),
  )
  return decide('post_player', options, ctx, rng).player ?? offensePlayers[0]
}

/** Compat: assinaturas antigas da Simulation Engine. */
export function pickBallHandler(players, rng, context = {}) {
  return decideBallHandler(players, asCtx(context, players), rng)
}
export function pickIndividualDefender(defensePlayers, ballHandler, rng, context = {}) {
  return decidePrimaryDefender(defensePlayers, ballHandler, asCtx(context, null, defensePlayers), rng)
}
export function pickHelpDefender(defensePlayers, primary, rng, chemistryEffects = null) {
  return decideHelpDefender(
    defensePlayers,
    primary,
    asCtx({ chemistryEffects, defenseChemistryEffects: chemistryEffects }, null, defensePlayers),
    rng,
  )
}
export function pickScreener(offensePlayers, ballHandler, rng, chemistryEffects = null) {
  return decideScreener(
    offensePlayers,
    ballHandler,
    asCtx({ chemistryEffects }, offensePlayers),
    rng,
  )
}
export function pickCutter(offensePlayers, ballHandler, screener, rng, chemistryEffects = null) {
  return decideCutter(
    offensePlayers,
    ballHandler,
    screener,
    asCtx({ chemistryEffects }, offensePlayers),
    rng,
  )
}
export function pickKickTarget(offensePlayers, ballHandler, rng, chemistryEffects = null) {
  return decideReceiver(
    offensePlayers,
    ballHandler,
    asCtx({ chemistryEffects }, offensePlayers),
    rng,
  )
}
export function pickRebounder(players, rng, opts = {}, context = {}) {
  return decideRebounder(players, asCtx(context, players), rng, opts)
}
export function pickPasser(players, ballHandler, rng, chemistryEffects = null) {
  return decidePasser(
    players,
    ballHandler,
    asCtx({ chemistryEffects }, players),
    rng,
  )
}

function asCtx(context = {}, offensePlayers = null, defensePlayers = null) {
  return {
    chemistry: context.chemistry ?? context.chemistryEffects?.teamChemistry ?? 55,
    chemistryEffects: context.chemistryEffects ?? null,
    defenseChemistryEffects:
      context.defenseChemistryEffects ?? context.chemistryEffects ?? null,
    coachSetBias: context.coachSetBias ?? {},
    fatigue: context.fatigue ?? 0,
    momentum: context.momentum ?? 50,
    pressure: context.pressure ?? 45,
    importance: context.importance ?? 50,
    scoreDiff: context.scoreDiff ?? 0,
    quarter: context.quarter ?? 1,
    timeRemaining: context.timeRemaining ?? 0.5,
    styleThreeBias: context.styleThreeBias ?? 0,
    offensePlayers: offensePlayers ?? context.offensePlayers ?? [],
    defensePlayers: defensePlayers ?? context.defensePlayers ?? [],
    preferPerimeter: context.preferPerimeter,
  }
}

function combineAttr(pairs) {
  let n = 0
  let d = 0
  for (const [v, w] of pairs) {
    n += (Number(v) || 0) * w
    d += w
  }
  return d > 0 ? n / d : 50
}
