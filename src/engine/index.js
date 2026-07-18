/**
 * Engine — API pública do motor de jogo.
 *
 * Regras de arquitetura:
 * - NUNCA importar React, componentes, pages, layouts, hooks ou store.
 * - Pode importar apenas `data/` e outros módulos da própria engine.
 * - Funções puras (ou com RNG injetável): estado in → resultado out.
 */

export * from './utils'
export * from './progression'
export * from './finance'
export * from './save'
export * from './season'
export * from './gm'
export * from './draft'
export * from './franchise'
export * from './news'
export * from './history'
export * from './hallOfFame'
export * from './analytics'
export * from './story'
export * from './achievements'
export * from './balance'
export * from './relationships'
export * from './contracts'
export * from './chemistry'
export * from './injuries'
export * from './coaches'
export * from './scouting'
export * from './career'
export * from './events'
export * from './decision'
export * from './simulation'
export * from './personality'
export * from './dna'
export * from './playbook'
export * from './defense'
export * from './fatigue'
export * from './momentum'
export * from './trade'
export * from './expansion'
export * from './dynasty'
export * from './legacy'
export {
  buildLineupFromDb,
  buildDefaultMatchup,
} from './match/lineups'
export * from './ai'
