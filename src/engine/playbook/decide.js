import { DECISION_IDS } from '../../data/decision'
import { DEFAULT_CATEGORY_BIAS } from '../../data/playbook/constants.js'
import { decide } from '../decision/decide.js'
import { decidePostPlayer } from '../decision/roles.js'
import { scorePlaybookPlay } from './score.js'
import { normalizeTeamPlaybook } from './state.js'

/**
 * Decision Engine + Playbook: escolhe automaticamente a melhor jogada da posse.
 *
 * Fatores: Coach · Jogadores · Fadiga · Matchup · Tempo · Placar · Importância
 */
export function decidePlaybookPlay({
  offensePlayers = [],
  ballHandler = null,
  ctx = {},
  playbook = null,
  rng = Math.random,
} = {}) {
  const book = playbook?.plays
    ? playbook
    : playbook
      ? normalizeTeamPlaybook(playbook)
      : null

  const plays = book?.plays ?? []
  if (!plays.length || !ballHandler) return null

  const enrichedCtx = {
    ...ctx,
    playbookCategoryBias:
      ctx.playbookCategoryBias ??
      DEFAULT_CATEGORY_BIAS,
  }

  const options = plays
    .map((play) =>
      scorePlaybookPlay(play, {
        offensePlayers,
        ballHandler,
        ctx: enrichedCtx,
      }),
    )
    .filter((opt) => !opt.blocked && opt.score > 0.05)

  if (!options.length) return null

  const result = decide(
    DECISION_IDS.offensive_set,
    options.map((opt) => ({
      id: opt.play.id,
      score: opt.score,
      mult: opt.mult,
      player: ballHandler,
      executionSet: opt.executionSet,
      meta: {
        ...opt.meta,
        playId: opt.play.id,
        playName: opt.play.name,
        play: opt.play,
        postPlayer: decidePostPlayer(offensePlayers, ctx, rng),
      },
    })),
    enrichedCtx,
    rng,
  )

  const choice = result.choice
  if (!choice) return null

  // Simulation Engine consome o executionSet (pick_and_roll, iso, …)
  return {
    id: choice.executionSet ?? choice.meta?.play?.executionSet ?? 'isolation',
    score: choice.score,
    mult: choice.mult ?? 1,
    meta: choice.meta,
    play: choice.meta?.play ?? null,
  }
}
