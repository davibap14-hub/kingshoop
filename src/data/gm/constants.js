/**
 * Constantes do General Manager Engine.
 */

/** Salary Cap anual (escala do banco local) */
export const SALARY_CAP = 140_000_000

/** Soft floor — times financeiros evitam ficar muito abaixo */
export const SALARY_FLOOR = 90_000_000

/** Tamanho alvo de elenco */
export const ROSTER_SIZE_TARGET = 6

/** Mínimo / máximo de elenco */
export const ROSTER_SIZE_MIN = 5
export const ROSTER_SIZE_MAX = 8

/** Anos padrão de contrato ao assinar / renovar */
export const DEFAULT_CONTRACT_YEARS = 2

/** Prospects gerados no draft */
export const DRAFT_CLASS_SIZE = 12

/** Máximo de decisões por time por semana */
export const MAX_DECISIONS_PER_TEAM_WEEK = 2

/** Histórico de decisões retidas */
export const MAX_GM_LOG = 80
