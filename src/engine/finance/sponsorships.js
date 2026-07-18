import { SPONSORSHIP_TEMPLATES } from '../../data/career/sponsorships'
import { WEEKS_PER_SEASON } from '../../data/constants/career'
import { calculateRelationshipEffects } from '../relationships'

/**
 * Tenta assinar um novo patrocínio com base em popularidade + Relationship Engine.
 */
export function trySignSponsorship(state, rng = Math.random) {
  const pop = state.status?.popularidade ?? 0
  const relEffects =
    state.relationshipEffects ??
    calculateRelationshipEffects(state.relationships)
  const sponsorRel = state.relationships?.sponsors ?? 30
  const activeIds = new Set((state.sponsorships ?? []).map((s) => s.id))

  const candidates = SPONSORSHIP_TEMPLATES.filter(
    (t) =>
      pop >= t.minPopularidade &&
      sponsorRel >= Math.max(15, t.minPopularidade - 20) &&
      !activeIds.has(t.id),
  )

  const chance = Math.min(0.65, 0.35 + (relEffects.sponsorshipChanceBonus ?? 0))
  if (!candidates.length || rng() > chance) {
    return { sponsorship: null, messages: [] }
  }

  const template = candidates[Math.floor(rng() * candidates.length)]
  const weeklyPay = Math.round(
    template.weeklyPay * (relEffects.sponsorshipPayMultiplier ?? 1),
  )
  const sponsorship = {
    id: template.id,
    name: template.name,
    weeklyPay,
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
