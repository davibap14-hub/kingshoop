/**
 * Contract Engine — constantes configuráveis.
 */

export const CONTRACT_OFFER_TYPES = {
  renewal: 'renewal',
  extension: 'extension',
  offer: 'offer',
  rfa_offer: 'rfa_offer',
  ufa_offer: 'ufa_offer',
  player_option: 'player_option',
  team_option: 'team_option',
  buyout: 'buyout',
}

export const CONTRACT_OFFER_LABELS = {
  renewal: 'Renovação',
  extension: 'Extensão',
  offer: 'Oferta de franquia',
  rfa_offer: 'Oferta RFA',
  ufa_offer: 'Oferta UFA',
  player_option: 'Player Option',
  team_option: 'Team Option',
  buyout: 'Buyout',
}

export const FREE_AGENCY_STATUS = {
  none: 'none',
  rfa: 'rfa',
  ufa: 'ufa',
}

export const TRADE_CLAUSE = {
  none: 'none',
  limited: 'limited',
  full: 'full',
}

export const TRADE_CLAUSE_LABELS = {
  none: 'Sem cláusula',
  limited: 'Limited NTC',
  full: 'No-Trade Clause',
}

export const CONTRACT_DECISIONS = {
  accept: 'accept',
  negotiate: 'negotiate',
  refuse: 'refuse',
  exercise: 'exercise',
  decline_option: 'decline_option',
}

/** Anos de contrato */
export const CONTRACT_YEARS_MIN = 1
export const CONTRACT_YEARS_MAX = 5

/** Rodadas máximas de negociação por oferta */
export const MAX_NEGOTIATE_ROUNDS = 3

/** Histórico de ofertas retidas */
export const MAX_OFFER_HISTORY = 40

/** Temporadas sob contrato/liga para virar UFA (antes = RFA se bird) */
export const UFA_MIN_SEASONS = 4

/** Semanas da offseason em que o mercado de contratos roda */
export const CONTRACT_MARKET_WEEK_START = 44
export const CONTRACT_MARKET_WEEK_END = 52

/** Extensão disponível com N anos restantes */
export const EXTENSION_YEARS_REMAINING = 1

/** Chance base de rival gerar oferta na FA (0–1) */
export const RIVAL_OFFER_CHANCE = 0.55

/** Máximo de ofertas rivais por semana de mercado */
export const MAX_RIVAL_OFFERS_PER_WEEK = 2

/** Bônus de assinatura como % do salário anual */
export const SIGNING_BONUS_MIN_PCT = 0.02
export const SIGNING_BONUS_MAX_PCT = 0.12

/** Buyout: fração do salário restante paga ao jogador */
export const BUYOUT_PAYOUT_PCT = 0.55

/** Player/Team option: multiplicador tipico sobre o salário atual */
export const OPTION_SALARY_MULT = 1.05
