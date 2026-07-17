import { TAX_BRACKETS } from '../../data/finance/constants'

/**
 * Imposto progressivo sobre renda tributável (salário + patrocínios).
 */
export function calcTaxes(taxableIncome) {
  const income = Math.max(0, Math.round(taxableIncome ?? 0))
  if (income <= 0) return 0

  let remaining = income
  let previousCap = 0
  let tax = 0

  for (const bracket of TAX_BRACKETS) {
    const span = bracket.upTo === Infinity ? remaining : bracket.upTo - previousCap
    const taxableHere = Math.min(remaining, Math.max(0, span))
    tax += taxableHere * bracket.rate
    remaining -= taxableHere
    previousCap = bracket.upTo
    if (remaining <= 0) break
  }

  return Math.round(tax)
}
