/**
 * Constantes da Finance Engine.
 */

/** Níveis de luxo — custo semanal fixo + impacto social */
export const LUXURY_LEVELS = {
  basico: {
    id: 'basico',
    label: 'Básico',
    weeklyCost: 1_200,
    happinessBias: -1,
    popularityBias: -1,
  },
  confortavel: {
    id: 'confortavel',
    label: 'Confortável',
    weeklyCost: 3_500,
    happinessBias: 1,
    popularityBias: 0,
  },
  alto: {
    id: 'alto',
    label: 'Alto',
    weeklyCost: 8_000,
    happinessBias: 2,
    popularityBias: 1,
  },
  luxo: {
    id: 'luxo',
    label: 'Luxo',
    weeklyCost: 18_000,
    happinessBias: 3,
    popularityBias: 2,
  },
}

export const LUXURY_LEVEL_IDS = Object.keys(LUXURY_LEVELS)
export const DEFAULT_LUXURY_LEVEL = 'confortavel'

/** Gastos fixos de vida (moradia, comida, transporte) além do luxo */
export const BASE_LIVING_COST = 2_000

/**
 * Imposto sobre renda tributável (salário + patrocínios).
 * Faixas progressivas leves.
 */
export const TAX_BRACKETS = [
  { upTo: 10_000, rate: 0.1 },
  { upTo: 30_000, rate: 0.18 },
  { upTo: Infinity, rate: 0.28 },
]

/** Produtos de investimento disponíveis */
export const INVESTMENT_PRODUCTS = [
  {
    id: 'poupanca',
    name: 'Poupança',
    weeklyReturnRate: 0.0015,
    risk: 0,
    minPrincipal: 1_000,
  },
  {
    id: 'fundos',
    name: 'Fundos Indexados',
    weeklyReturnRate: 0.003,
    risk: 0.08,
    minPrincipal: 5_000,
  },
  {
    id: 'startups',
    name: 'Startups Esportivas',
    weeklyReturnRate: 0.006,
    risk: 0.18,
    minPrincipal: 10_000,
  },
]

/** % do fluxo líquido positivo reinvestido automaticamente (gradual) */
export const AUTO_INVEST_RATE = 0.12

/** Mínimo de caixa livre para auto-investir */
export const AUTO_INVEST_CASH_FLOOR = 20_000

/** Limiar de caixa baixo — pressiona felicidade/popularidade */
export const LOW_CASH_THRESHOLD = 5_000

/** Patrimônio que começa a gerar popularidade */
export const WEALTH_POP_THRESHOLD = 100_000
