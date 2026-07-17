import {
  LOW_CASH_THRESHOLD,
  WEALTH_POP_THRESHOLD,
} from '../../data/finance/constants'
import { getLuxuryMeta } from './state'

/**
 * Dinheiro influencia felicidade e popularidade.
 */
export function calcMoneyMoodEffects({
  cashAfter,
  netCashflow,
  luxuryLevel,
  patrimonio,
  weeklyGross,
}) {
  const luxury = getLuxuryMeta(luxuryLevel)
  let felicidade = luxury.happinessBias
  let popularidade = luxury.popularityBias
  const notes = []

  if (netCashflow > 0) {
    felicidade += netCashflow > 15_000 ? 2 : 1
  } else if (netCashflow < 0) {
    felicidade -= netCashflow < -10_000 ? 3 : 2
    notes.push('Fluxo negativo pressionou a felicidade.')
  }

  if (cashAfter < LOW_CASH_THRESHOLD) {
    felicidade -= 3
    popularidade -= 1
    notes.push('Caixa baixo — estresse financeiro.')
  } else if (cashAfter > 150_000) {
    felicidade += 1
  }

  // Luxo desalinhado com renda bruta
  if (weeklyGross < luxury.weeklyCost * 1.2 && luxury.id !== 'basico') {
    felicidade -= 2
    notes.push('Estilo de vida acima da renda.')
  }

  if (patrimonio >= WEALTH_POP_THRESHOLD) {
    popularidade += patrimonio >= WEALTH_POP_THRESHOLD * 3 ? 2 : 1
  }

  if (luxury.id === 'luxo' && netCashflow >= 0) {
    popularidade += 1
  }

  return {
    deltas: {
      felicidade: Math.round(felicidade),
      popularidade: Math.round(popularidade),
    },
    notes,
  }
}
