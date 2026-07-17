import {
  AUTO_INVEST_CASH_FLOOR,
  AUTO_INVEST_RATE,
  INVESTMENT_PRODUCTS,
} from '../../data/finance/constants'
import { getInvestmentProduct } from './state'

/**
 * Resolve retorno semanal dos investimentos (com risco opcional).
 * Retorno entra no caixa; principal pode sofrer drawdown se risk acionar.
 */
export function resolveInvestmentReturns(investments, rng = Math.random) {
  const messages = []
  let totalReturn = 0
  const next = []

  for (const inv of investments ?? []) {
    const product = getInvestmentProduct(inv.productId ?? inv.id)
    const rate = product?.weeklyReturnRate ?? 0.001
    const risk = product?.risk ?? 0
    let principal = inv.principal ?? 0
    let weekReturn = Math.round(principal * rate)

    if (risk > 0 && rng() < risk) {
      const lossPct = 0.02 + rng() * 0.06
      const loss = Math.round(principal * lossPct)
      principal = Math.max(0, principal - loss)
      weekReturn = Math.round(weekReturn * 0.25)
      messages.push(
        `Investimento ${inv.name}: correção de -$${loss.toLocaleString('en-US')}.`,
      )
    }

    totalReturn += weekReturn
    next.push({
      ...inv,
      principal,
      name: inv.name ?? product?.name ?? inv.id,
    })
  }

  if (totalReturn > 0) {
    messages.push(
      `Retorno de investimentos: +$${totalReturn.toLocaleString('en-US')}.`,
    )
  }

  return { investments: next, returnAmount: totalReturn, messages }
}

/**
 * Auto-investe parte do fluxo positivo na Poupança (evolução gradual do patrimônio).
 */
export function autoAllocateInvestment(investments, cashAfterWeek, netCashflow, rng = Math.random) {
  if (netCashflow <= 0 || cashAfterWeek < AUTO_INVEST_CASH_FLOOR) {
    return { investments, allocated: 0, messages: [] }
  }

  const allocated = Math.round(netCashflow * AUTO_INVEST_RATE)
  if (allocated < 500) {
    return { investments, allocated: 0, messages: [] }
  }

  // Só aloca se ainda sobrar caixa confortável
  if (cashAfterWeek - allocated < AUTO_INVEST_CASH_FLOOR * 0.6) {
    return { investments, allocated: 0, messages: [] }
  }

  const product = INVESTMENT_PRODUCTS[0]
  const list = investments.map((i) => ({ ...i }))
  const existing = list.find((i) => i.productId === product.id || i.id === product.id)

  if (existing) {
    existing.principal = (existing.principal ?? 0) + allocated
  } else if (rng() < 0.85) {
    list.push({
      id: product.id,
      productId: product.id,
      name: product.name,
      principal: allocated,
    })
  } else {
    return { investments, allocated: 0, messages: [] }
  }

  return {
    investments: list,
    allocated,
    messages: [
      `Auto-investimento: $${allocated.toLocaleString('en-US')} em ${product.name}.`,
    ],
  }
}

/**
 * Aporta valor manualmente em um produto.
 */
export function allocateToInvestment(finance, productId, amount) {
  const product = getInvestmentProduct(productId)
  if (!product) {
    return { ok: false, error: 'Produto de investimento inválido.', finance }
  }

  const value = Math.round(amount)
  if (value < product.minPrincipal) {
    return {
      ok: false,
      error: `Aporte mínimo: $${product.minPrincipal.toLocaleString('en-US')}.`,
      finance,
    }
  }

  const investments = (finance.investments ?? []).map((i) => ({ ...i }))
  const existing = investments.find(
    (i) => i.productId === product.id || i.id === product.id,
  )

  if (existing) {
    existing.principal = (existing.principal ?? 0) + value
  } else {
    investments.push({
      id: product.id,
      productId: product.id,
      name: product.name,
      principal: value,
    })
  }

  return {
    ok: true,
    error: null,
    finance: { ...finance, investments },
    amount: value,
  }
}
