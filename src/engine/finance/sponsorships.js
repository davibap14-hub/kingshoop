import { SPONSORSHIP_TEMPLATES } from '../../data/career/sponsorships'
import { WEEKS_PER_SEASON } from '../../data/constants/career'

/**
 * Tenta assinar um novo patrocínio com base na popularidade.
 */
export function trySignSponsorship(state, rng = Math.random) {
  const pop = state.status?.popularidade ?? 0
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

/**
 * Recebe pagamentos e reduz duração dos patrocínios ativos.
 */
export function tickSponsorships(sponsorships = []) {
  const messages = []
  let sponsorIncome = 0
  const kept = []

  for (const sponsor of sponsorships) {
    sponsorIncome += sponsor.weeklyPay ?? 0
    const weeksRemaining = (sponsor.weeksRemaining ?? sponsor.durationWeeks) - 1
    if (weeksRemaining > 0) {
      kept.push({ ...sponsor, weeksRemaining })
    } else {
      messages.push(`Patrocínio encerrado: ${sponsor.name}.`)
    }
  }

  return { sponsorships: kept, sponsorIncome, messages }
}

export function yearlyToWeekly(yearlySalary) {
  return Math.round(yearlySalary / WEEKS_PER_SEASON)
}
