import { SPONSORSHIP_TEMPLATES } from '../../data/career/sponsorships'
import { WEEKS_PER_SEASON } from '../../data/constants/career'

/**
 * Pagamentos semanais: salário contratual + patrocínios ativos.
 */
export function resolveWeeklyFinance(state) {
  const messages = []
  const deltas = { dinheiro: 0 }
  let sponsorships = (state.sponsorships ?? []).map((s) => ({ ...s }))

  const weeklySalary = state.contract?.weeklySalary ?? 0
  if (weeklySalary > 0) {
    deltas.dinheiro += weeklySalary
    messages.push(
      `Salário semanal: +$${weeklySalary.toLocaleString('en-US')}.`,
    )
  }

  let sponsorIncome = 0
  const kept = []
  for (const sponsor of sponsorships) {
    sponsorIncome += sponsor.weeklyPay
    const weeksRemaining = (sponsor.weeksRemaining ?? sponsor.durationWeeks) - 1
    if (weeksRemaining > 0) {
      kept.push({ ...sponsor, weeksRemaining })
    } else {
      messages.push(`Patrocínio encerrado: ${sponsor.name}.`)
    }
  }
  sponsorships = kept

  if (sponsorIncome > 0) {
    deltas.dinheiro += sponsorIncome
    messages.push(
      `Patrocínios: +$${sponsorIncome.toLocaleString('en-US')}.`,
    )
  }

  return { deltas, sponsorships, messages, weeklySalary, sponsorIncome }
}

/**
 * Tenta assinar um novo patrocínio com base na popularidade.
 */
export function trySignSponsorship(state, rng = Math.random) {
  const pop = state.status.popularidade ?? 0
  const activeIds = new Set((state.sponsorships ?? []).map((s) => s.id))

  const candidates = SPONSORSHIP_TEMPLATES.filter(
    (t) => pop >= t.minPopularidade && !activeIds.has(t.id),
  )

  if (!candidates.length || rng() > 0.35) {
    return { sponsorship: null, messages: [] }
  }

  const template = candidates[Math.floor(rng() * candidates.length)]
  const sponsorship = {
    id: template.id,
    name: template.name,
    weeklyPay: template.weeklyPay,
    weeksRemaining: template.durationWeeks,
    durationWeeks: template.durationWeeks,
  }

  return {
    sponsorship,
    messages: [
      `Novo patrocínio: ${sponsorship.name} (+$${sponsorship.weeklyPay.toLocaleString('en-US')}/sem).`,
    ],
  }
}

export function yearlyToWeekly(yearlySalary) {
  return Math.round(yearlySalary / WEEKS_PER_SEASON)
}
