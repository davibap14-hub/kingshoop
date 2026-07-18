/**
 * Ponte GM → Franchise AI.
 * Decisões de franquia são determinísticas (sem RNG).
 */

import { decideForFranchise } from '../franchise/decide'
import { runDraft as runDraftEngine } from '../draft/run'

/**
 * Uma rodada de decisões automáticas para um time.
 * `rng` é ignorado — mantido só por compatibilidade de assinatura.
 */
export function decideForTeam(gm, teamId, seasonState /*, rng */) {
  return decideForFranchise(gm, teamId, seasonState)
}

/** @deprecated use Draft Engine `runDraft` */
export function runDraft(gm, seasonState, rng = Math.random) {
  return runDraftEngine(gm, seasonState, rng)
}
