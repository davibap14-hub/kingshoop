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
export * from './career'
export * from './events'
export * from './simulation'
export * from './match'
export * from './ai'
