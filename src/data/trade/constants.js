/**
 * Trade Engine — constantes de valor, fairness e salário.
 * Trocas irreais são bloqueadas por estes tetos.
 */

/** Escala de valor de mercado (chips) */
export const MARKET_VALUE_MIN = 5
export const MARKET_VALUE_MAX = 120

/** Máximo de jogadores por lado na troca */
export const MAX_PLAYERS_PER_SIDE = 3

/** Máximo de escolhas de draft por lado */
export const MAX_PICKS_PER_SIDE = 2

/** Razão máxima de valor (lado quente / lado frio) — acima = irreal */
export const MAX_VALUE_RATIO = 1.22

/** Surplus mínimo do parceiro para aceitar (chips) */
export const MIN_PARTNER_SURPLUS = -4

/** Matching salarial: incoming ≤ outgoing * ratio + cushion */
export const SALARY_MATCH_RATIO = 1.25
export const SALARY_MATCH_CUSHION = 5_000_000

/** Gap máximo de overall em 1×1 puro (ainda usado como soft hint) */
export const MAX_OVR_GAP_HINT = 14

/** Rounds de draft negociáveis */
export const TRADEABLE_PICK_ROUNDS = [1, 2]

/** Horizontes de picks (0 = próximo draft, 1 = seguinte) */
export const TRADEABLE_PICK_OFFSETS = [0, 1]

/** Valores base de picks (chips) por round × offset */
export const PICK_BASE_VALUE = {
  1: { 0: 62, 1: 48 },
  2: { 0: 28, 1: 20 },
}

/** Ajuste de pick pelo standings do time original (winPct baixo = pick melhor) */
export const PICK_STANDINGS_SWING = 18

/** Pesos do valor de mercado do atleta */
export const MARKET_VALUE_WEIGHTS = {
  overall: 0.52,
  potential: 0.28,
  age: 0.12,
  contract: 0.08,
}

/** Multiplicadores por objetivo da franquia ao avaliar receber/enviar */
export const OBJECTIVE_TRADE_BIAS = {
  tank: { youth: 1.25, star: 0.7, pick: 1.3, salary: 1.05 },
  development: { youth: 1.2, star: 0.85, pick: 1.15, salary: 1.0 },
  playoffs: { youth: 1.0, star: 1.1, pick: 0.95, salary: 1.0 },
  title: { youth: 0.9, star: 1.35, pick: 0.8, salary: 0.95 },
  economy: { youth: 0.95, star: 0.9, pick: 1.05, salary: 1.35 },
}

/** Aggression mínima para iniciar troca */
export const MIN_TRADE_AGGRESSION = 0.65

/** Quantos parceiros / pacotes avaliar (determinístico, limitado) */
export const TRADE_SEARCH_PARTNERS = 6
export const TRADE_SEARCH_GIVE_PLAYERS = 4
export const TRADE_SEARCH_GET_PLAYERS = 4

export const TRADE_ASSET_TYPES = {
  player: 'player',
  pick: 'pick',
}
