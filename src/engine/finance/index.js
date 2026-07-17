/**
 * Finance Engine — API pública.
 *
 * Controla: salário, patrocínios, investimentos, gastos, luxo, impostos, patrimônio.
 * O dinheiro influencia felicidade e popularidade.
 *
 * Contrato com a Interface / Career Engine:
 *   processWeeklyFinance(state, { extraIncome, rng })
 *     → { deltas, sponsorships, finance, summary, messages }
 */

export {
  createFinanceState,
  getLuxuryMeta,
  getInvestmentProduct,
  sumInvestmentPrincipal,
  calcPatrimonio,
} from './state'

export { calcTaxes } from './taxes'
export {
  resolveInvestmentReturns,
  autoAllocateInvestment,
  allocateToInvestment,
} from './investments'
export {
  trySignSponsorship,
  tickSponsorships,
  yearlyToWeekly,
} from './sponsorships'
export { calcMoneyMoodEffects } from './effects'
export {
  processWeeklyFinance,
  resolveWeeklyFinance,
} from './weekly'

import { LUXURY_LEVELS } from '../../data/finance/constants'
import { allocateToInvestment } from './investments'
import { calcPatrimonio, createFinanceState } from './state'

/**
 * Define o nível de luxo do jogador.
 */
export function setLuxuryLevel(state, luxuryLevel) {
  if (!LUXURY_LEVELS[luxuryLevel]) {
    return {
      ok: false,
      error: `Nível de luxo inválido: ${luxuryLevel}`,
      nextState: null,
    }
  }

  const finance = {
    ...createFinanceState(state.finance ?? {}),
    luxuryLevel,
  }

  return {
    ok: true,
    error: null,
    nextState: {
      ...state,
      finance,
      lastEvent: `Estilo de vida: ${LUXURY_LEVELS[luxuryLevel].label}.`,
    },
  }
}

/**
 * Aporta dinheiro do caixa em um investimento (UI → service).
 */
export function investCash(state, productId, amount) {
  const value = Math.round(amount)
  const cash = state.status?.dinheiro ?? 0
  if (value <= 0) {
    return { ok: false, error: 'Valor inválido.', nextState: null }
  }
  if (cash < value) {
    return { ok: false, error: 'Saldo insuficiente.', nextState: null }
  }

  const financeBase = createFinanceState(state.finance ?? {})
  const result = allocateToInvestment(financeBase, productId, value)
  if (!result.ok) {
    return { ok: false, error: result.error, nextState: null }
  }

  const dinheiro = cash - value
  const finance = {
    ...result.finance,
    patrimonio: calcPatrimonio(dinheiro, result.finance.investments),
  }

  return {
    ok: true,
    error: null,
    effects: {
      amount: value,
      productId,
      patrimonio: finance.patrimonio,
    },
    nextState: {
      ...state,
      status: { ...state.status, dinheiro },
      finance,
      lastEvent: `Investido $${value.toLocaleString('en-US')} em ${productId}.`,
    },
  }
}
