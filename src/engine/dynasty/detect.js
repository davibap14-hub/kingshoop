import {
  DYNASTY_CRITERIA_WEIGHTS as W,
  DYNASTY_DOMINANCE_WIN_PCT,
  DYNASTY_MIN_FINALS_STREAK,
  DYNASTY_TIERS,
  DYNASTY_WINDOW_SEASONS,
} from '../../data/dynasty/constants.js'
import { getTeamById, TEAMS } from '../../data/teams'

/**
 * Extrai sinais de uma temporada para um time.
 */
export function extractTeamSeasonSignals(archive, teamId) {
  if (!archive || !teamId) return null

  const standing = (archive.standings ?? []).find((s) => s.teamId === teamId)
  const wins = standing?.wins ?? 0
  const losses = standing?.losses ?? 0
  const games = Math.max(1, wins + losses)
  const winPct = wins / games

  const finals = archive.playoffs?.finals ?? null
  const inFinals = Boolean(
    finals && (finals.homeId === teamId || finals.awayId === teamId),
  )
  const champion = archive.champion?.teamId === teamId
  const mvp = archive.awards?.mvp?.teamId === teamId
  const finalsMvp = archive.awards?.finals_mvp?.teamId === teamId
  const dpoy = archive.awards?.dpoy?.teamId === teamId

  // Proxy All-NBA: reconhecimento de elite na temporada (MVP / Finals MVP / título + domínio)
  const allNbaProxy =
    mvp || finalsMvp || (champion && winPct >= DYNASTY_DOMINANCE_WIN_PCT)

  return {
    season: archive.season,
    teamId,
    wins,
    losses,
    winPct,
    inFinals,
    champion,
    mvp,
    finalsMvp,
    dpoy,
    allNbaProxy,
    dominance: winPct >= DYNASTY_DOMINANCE_WIN_PCT,
  }
}

/**
 * Conta finais consecutivas terminando na temporada mais recente da janela.
 */
export function calcFinalsStreak(signals) {
  let streak = 0
  for (let i = signals.length - 1; i >= 0; i--) {
    if (!signals[i].inFinals) break
    streak += 1
  }
  return streak
}

/**
 * Maior sequência de finais em qualquer ponto da janela.
 */
export function calcMaxFinalsStreak(signals) {
  let best = 0
  let cur = 0
  for (const s of signals) {
    if (s.inFinals) {
      cur += 1
      best = Math.max(best, cur)
    } else cur = 0
  }
  return best
}

/**
 * Avalia um time na janela recente do arquivo.
 */
export function evaluateTeamDynasty(leagueHistory, teamId, opts = {}) {
  const windowSize = opts.window ?? DYNASTY_WINDOW_SEASONS
  const seasons = [...(leagueHistory?.seasons ?? [])]
    .filter((s) => s?.season != null)
    .sort((a, b) => a.season - b.season)

  if (seasons.length < 2) return null

  const window = seasons.slice(-windowSize)
  const signals = window
    .map((a) => extractTeamSeasonSignals(a, teamId))
    .filter(Boolean)

  if (!signals.length) return null

  const titles = signals.filter((s) => s.champion).length
  const finalsStreak = calcFinalsStreak(signals)
  const maxFinalsStreak = calcMaxFinalsStreak(signals)
  const avgWins =
    signals.reduce((sum, s) => sum + s.wins, 0) / Math.max(1, signals.length)
  const dominanceSeasons = signals.filter((s) => s.dominance).length
  const mvps = signals.filter((s) => s.mvp).length
  const allNbaProxy = signals.filter((s) => s.allNbaProxy).length

  let score =
    titles * W.titles +
    Math.max(finalsStreak, maxFinalsStreak) * W.consecutiveFinals +
    avgWins * W.avgWins +
    dominanceSeasons * W.dominanceSeasons +
    mvps * W.mvps +
    allNbaProxy * W.allNbaProxy

  // Bônus de era: finais consecutivas longas
  if (finalsStreak >= DYNASTY_MIN_FINALS_STREAK) score += 10
  // Three-peat / bi na janela
  if (titles >= 3) score += 12
  if (titles >= 2 && finalsStreak >= 3) score += 8

  score = Math.round(score * 10) / 10

  const tier = resolveTier(score, { titles, finalsStreak, maxFinalsStreak })
  if (!tier) return null

  const fromSeason = signals[0].season
  const toSeason = signals[signals.length - 1].season
  const team = getTeamById(teamId)
  const id = `dyn_${teamId}_${fromSeason}_${toSeason}_${tier.id}`

  return {
    id,
    teamId,
    teamShort: team?.short ?? teamId,
    teamName: team?.name ?? teamId,
    tier: tier.id,
    tierLabel: tier.label,
    score,
    fromSeason,
    toSeason,
    criteria: {
      titles,
      consecutiveFinals: finalsStreak,
      maxFinalsStreak,
      avgWins: Math.round(avgWins * 10) / 10,
      dominanceSeasons,
      mvps,
      allNbaProxy,
      seasonsInWindow: signals.length,
    },
    reputationBoost: tier.reputation,
    signingBias: tier.signingBias,
    recognizedAt: Date.now(),
  }
}

function resolveTier(score, { titles, finalsStreak, maxFinalsStreak }) {
  // Gate mínimo de relevância histórica
  const relevant =
    titles >= 2 ||
    finalsStreak >= DYNASTY_MIN_FINALS_STREAK ||
    maxFinalsStreak >= DYNASTY_MIN_FINALS_STREAK ||
    (titles >= 1 && score >= DYNASTY_TIERS.rising.minScore + 10)
  if (!relevant) return null

  if (score >= DYNASTY_TIERS.super.minScore && titles >= 3) {
    return DYNASTY_TIERS.super
  }
  if (score >= DYNASTY_TIERS.dynasty.minScore && titles >= 2) {
    return DYNASTY_TIERS.dynasty
  }
  if (score >= DYNASTY_TIERS.rising.minScore) {
    return DYNASTY_TIERS.rising
  }
  return null
}

/**
 * Avalia todas as franquias ativas.
 */
export function detectDynasties(leagueHistory, opts = {}) {
  const teams = opts.teams ?? TEAMS
  const found = []
  for (const team of teams) {
    const d = evaluateTeamDynasty(leagueHistory, team.id, opts)
    if (d) found.push(d)
  }
  found.sort((a, b) => b.score - a.score)
  return found
}

export function dynastyKey(d) {
  return `${d.teamId}:${d.tier}:${d.fromSeason}-${d.toSeason}`
}
