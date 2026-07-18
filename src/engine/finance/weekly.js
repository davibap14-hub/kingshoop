import { BASE_LIVING_COST } from '../../data/finance/constants'
import {
  calcMoneyMoodEffects,
} from './effects'
import {
  autoAllocateInvestment,
  resolveInvestmentReturns,
} from './investments'
import {
  calcPatrimonio,
  createFinanceState,
  getLuxuryMeta,
} from './state'
import { tickSponsorships } from './sponsorships'
import { calcTaxes } from './taxes'

/**
 * Pipeline semanal da Finance Engine.
 * Controla: salário, patrocínios, investimentos, gastos, luxo, impostos, patrimônio.
 * Retorna resumo financeiro semanal + deltas de humor (felicidade/popularidade).
 *
 * @param {object} state — career state (status, contract, sponsorships, finance)
 * @param {object} opts
 * @param {number} [opts.extraIncome=0] — bônus da atividade (ex.: evento de marca)
 * @param {function} [opts.rng]
 */
export function processWeeklyFinance(state, opts = {}) {
  const rng = opts.rng ?? Math.random
  const extraIncome = Math.max(0, Math.round(opts.extraIncome ?? 0))
  const messages = []

  const finance = createFinanceState(state.finance ?? {})
  const dinheiroAnterior = state.status?.dinheiro ?? 0
  const patrimonioAnterior =
    finance.patrimonio ||
    calcPatrimonio(dinheiroAnterior, finance.investments)

  const salario = state.contract?.weeklySalary ?? 0
  if (salario > 0) {
    messages.push(`Salário semanal: +$${salario.toLocaleString('en-US')}.`)
  }

  const sponsorTick = tickSponsorships(state.sponsorships ?? [])
  const patrocinios = sponsorTick.sponsorIncome
  messages.push(...sponsorTick.messages)
  if (patrocinios > 0) {
    messages.push(`Patrocínios: +$${patrocinios.toLocaleString('en-US')}.`)
  }

  if (extraIncome > 0) {
    messages.push(
      `Bônus da semana: +$${extraIncome.toLocaleString('en-US')}.`,
    )
  }

  const invResult = resolveInvestmentReturns(finance.investments, rng)
  let investments = invResult.investments
  const investimentosRetorno = invResult.returnAmount
  messages.push(...invResult.messages)

  const luxury = getLuxuryMeta(finance.luxuryLevel)
  const gastos = BASE_LIVING_COST
  const luxo = luxury.weeklyCost
  messages.push(
    `Gastos de vida: -$${gastos.toLocaleString('en-US')} · Luxo (${luxury.label}): -$${luxo.toLocaleString('en-US')}.`,
  )

  const receitaBruta = salario + patrocinios + investimentosRetorno + extraIncome
  const rendaTributavel = salario + patrocinios
  const impostos = calcTaxes(rendaTributavel)
  if (impostos > 0) {
    messages.push(`Impostos: -$${impostos.toLocaleString('en-US')}.`)
  }

  const despesaTotal = gastos + luxo + impostos
  let fluxoLiquido = receitaBruta - despesaTotal

  // Caixa provisório antes do auto-investimento
  let dinheiroNovo = Math.max(0, dinheiroAnterior + fluxoLiquido)

  const auto = autoAllocateInvestment(
    investments,
    dinheiroNovo,
    fluxoLiquido,
    rng,
  )
  investments = auto.investments
  if (auto.allocated > 0) {
    dinheiroNovo -= auto.allocated
    fluxoLiquido -= auto.allocated
    messages.push(...auto.messages)
  }

  const patrimonioNovo = calcPatrimonio(dinheiroNovo, investments)
  const weeklyGross = salario + patrocinios + extraIncome

  const mood = calcMoneyMoodEffects({
    cashAfter: dinheiroNovo,
    netCashflow: dinheiroNovo - dinheiroAnterior,
    luxuryLevel: finance.luxuryLevel,
    patrimonio: patrimonioNovo,
    weeklyGross,
  })
  messages.push(...mood.notes)

  if (mood.deltas.felicidade !== 0) {
    messages.push(
      `Humor financeiro: felicidade ${mood.deltas.felicidade > 0 ? '+' : ''}${mood.deltas.felicidade}.`,
    )
  }
  if (mood.deltas.popularidade !== 0) {
    messages.push(
      `Imagem: popularidade ${mood.deltas.popularidade > 0 ? '+' : ''}${mood.deltas.popularidade}.`,
    )
  }

  const summary = {
    week: state.currentWeek,
    season: state.currentSeason,
    salario,
    patrocinios,
    investimentosRetorno,
    bonusAtividade: extraIncome,
    gastos,
    luxo,
    impostos,
    autoInvestimento: auto.allocated,
    receitaBruta,
    despesaTotal,
    fluxoLiquido: dinheiroNovo - dinheiroAnterior,
    dinheiroAnterior,
    dinheiroNovo,
    patrimonioAnterior,
    patrimonioNovo,
    luxuryLevel: finance.luxuryLevel,
    luxuryLabel: luxury.label,
    efeitos: { ...mood.deltas },
    lines: [
      { id: 'salario', label: 'Salário', amount: salario },
      { id: 'patrocinios', label: 'Patrocínios', amount: patrocinios },
      {
        id: 'investimentos',
        label: 'Investimentos',
        amount: investimentosRetorno,
      },
      { id: 'bonus', label: 'Bônus', amount: extraIncome },
      { id: 'gastos', label: 'Gastos', amount: -gastos },
      { id: 'luxo', label: 'Luxo', amount: -luxo },
      { id: 'impostos', label: 'Impostos', amount: -impostos },
      {
        id: 'autoInvest',
        label: 'Auto-investimento',
        amount: -auto.allocated,
      },
    ].filter((line) => line.amount !== 0),
  }

  const nextFinance = {
    ...finance,
    investments,
    patrimonio: patrimonioNovo,
    lastSummary: summary,
  }

  const dinheiroDelta = dinheiroNovo - dinheiroAnterior

  return {
    deltas: {
      dinheiro: dinheiroDelta,
      felicidade: mood.deltas.felicidade,
      popularidade: mood.deltas.popularidade,
    },
    sponsorships: sponsorTick.sponsorships,
    finance: nextFinance,
    summary,
    messages,
    // compat com API antiga do career/finance
    weeklySalary: salario,
    sponsorIncome: patrocinios,
  }
}

/**
 * Compat: só salário + patrocínios (sem gastos/impostos).
 * Preferir processWeeklyFinance.
 */
export function resolveWeeklyFinance(state) {
  const result = processWeeklyFinance(state, { extraIncome: 0 })
  return {
    deltas: { dinheiro: result.deltas.dinheiro },
    sponsorships: result.sponsorships,
    messages: result.messages,
    weeklySalary: result.weeklySalary,
    sponsorIncome: result.sponsorIncome,
    summary: result.summary,
    finance: result.finance,
  }
}
