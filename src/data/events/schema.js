/**
 * Schema de evento de carreira.
 *
 * {
 *   id: string
 *   categoria: EventCategory
 *   peso: number              // peso no sorteio entre elegíveis
 *   probabilidade: number    // 0–1 chance de disparar quando sorteado
 *   condicoes: {
 *     minEnergia?, maxEnergia?,
 *     minMotivacao?,
 *     minPopularidade?,
 *     minRelTreinador?, minRelCompanheiros?,
 *     minWeek?, maxWeek?,
 *     requiresInjury?, requiresHealthy?,
 *     activityTypes?: string[],
 *   }
 *   efeitos: StatusDeltas    // efeitos base ao disparar (antes da escolha)
 *   texto: string
 *   escolhas: Array<{
 *     id: string
 *     label: string
 *     texto?: string
 *     efeitos: StatusDeltas  // altera atributos de carreira
 *   }>  // 2 a 4 escolhas
 * }
 */

export const EVENT_SCHEMA_VERSION = 1
