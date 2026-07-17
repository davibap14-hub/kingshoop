import {
  DEFAULT_LUXURY_LEVEL,
  INVESTMENT_PRODUCTS,
  LUXURY_LEVELS,
} from '../../data/finance/constants'

/**
 * Estado financeiro da carreira.
 */
export function createFinanceState(overrides = {}) {
  const luxuryLevel = overrides.luxuryLevel ?? DEFAULT_LUXURY_LEVEL
  const investments = overrides.investments ?? [
    {
      id: 'poupanca',
      name: 'Poupança',
      principal: overrides.starterPrincipal ?? 5_000,
      productId: 'poupanca',
    },
  ]

  return {
    luxuryLevel: LUXURY_LEVELS[luxuryLevel] ? luxuryLevel : DEFAULT_LUXURY_LEVEL,
    investments: investments.map((inv) => ({ ...inv })),
    patrimonio: overrides.patrimonio ?? 0,
    lastSummary: overrides.lastSummary ?? null,
  }
}

export function getLuxuryMeta(luxuryLevel) {
  return LUXURY_LEVELS[luxuryLevel] ?? LUXURY_LEVELS[DEFAULT_LUXURY_LEVEL]
}

export function getInvestmentProduct(productId) {
  return INVESTMENT_PRODUCTS.find((p) => p.id === productId) ?? null
}

/** Valor total investido (principal). */
export function sumInvestmentPrincipal(investments = []) {
  return investments.reduce((sum, inv) => sum + (inv.principal ?? 0), 0)
}

/** Patrimônio = caixa + investimentos. */
export function calcPatrimonio(dinheiro, investments = []) {
  return Math.max(0, Math.round((dinheiro ?? 0) + sumInvestmentPrincipal(investments)))
}
