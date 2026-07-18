import { RIVALRY_PAIRS } from '../../data/momentum/constants.js'
import { getCareerTotals } from '../hallOfFame/credentials.js'
import { resolvePlayer } from '../gm/situation.js'
import { trait } from '../personality/traits.js'
import { clamp } from '../utils/math'

/**
 * Coleta insumos do legado a partir de History / Analytics / Player.
 */
export function gatherLegacyInputs({
  playerId,
  playerName = null,
  history = null,
  gm = null,
  analytics = null,
  dynasty = null,
  playerOverride = null,
  status = null,
} = {}) {
  const player =
    playerOverride ?? (gm ? resolvePlayer(gm, playerId) : null)
  const name = player?.nome ?? playerName ?? playerId
  const totals = getCareerTotals(history, playerId, name)

  const gameMvps =
    totals.gameMvps ||
    history?.gameMvpTotals?.[playerId] ||
    history?.gameMvpTotals?.[name] ||
    0

  let finalsMvps = totals.finalsMvps ?? 0
  for (const a of history?.awards ?? []) {
    if (a.type !== 'finals_mvp') continue
    if (a.detail === name || a.playerId === playerId || a.playerName === name) {
      finalsMvps += 1
    }
  }

  // All-Star / All-NBA: totais creditados + proxy via game MVPs
  let allStar = totals.allStar ?? 0
  let allNba = totals.allNba ?? 0
  if (allStar === 0 && gameMvps > 0) {
    allStar = Math.min(12, Math.floor(gameMvps / 4))
  }
  if (allNba === 0 && gameMvps > 0) {
    allNba = Math.min(8, Math.floor(gameMvps / 7))
  }

  const careerAnalytics =
    analytics?.career?.[playerId] ??
    analytics?.career?.[name] ??
    null
  const stl = careerAnalytics?.totals?.stl ?? 0
  const blk = careerAnalytics?.totals?.blk ?? 0
  const drtg = careerAnalytics?.averages?.drtg ?? 112
  const defenseFactor = clamp(
    Math.round(
      Math.min(100, (stl + blk) * 1.2) * 0.45 +
        clamp(120 - drtg, 0, 40) * 1.2 +
        (totals.dpoy ?? 0) * 28,
    ),
    0,
    100,
  )

  // Recordes all-time (holder)
  let recordsHeld = 0
  for (const rec of Object.values(history?.records ?? {})) {
    if (!rec) continue
    if (
      rec.holderId === playerId ||
      rec.holder === name ||
      rec.playerId === playerId ||
      rec.playerName === name
    ) {
      recordsHeld += 1
    }
  }

  const seasons =
    totals.seasons ||
    Math.max(1, Math.round((totals.games ?? 0) / 70)) ||
    1

  const popularity = clamp(
    Math.round(
      status?.popularidade ??
        player?.popularidade ??
        40 + Math.min(35, gameMvps) + (totals.titles ?? 0) * 6,
    ),
    0,
    100,
  )

  // Personalidade → aura de legado (liderança, ambição, competitividade)
  const personalityAura = clamp(
    Math.round(
      trait(player, 'lideranca', 50) * 0.35 +
        trait(player, 'ambicao', 50) * 0.25 +
        trait(player, 'competitividade', 50) * 0.25 +
        trait(player, 'disciplina', 50) * 0.15,
    ),
    0,
    100,
  )

  // Momentos históricos: game MVPs, TDs, títulos, dinastia
  const tripleDoubles =
    history?.tripleDoubleTotals?.[playerId] ??
    history?.tripleDoubleTotals?.[name] ??
    0
  let dynastyBonus = 0
  const teamId =
    player?.teamId ??
    findTeamForPlayer(gm, playerId) ??
    null
  if (teamId && dynasty?.active?.[teamId]) {
    dynastyBonus = dynasty.active[teamId].tier === 'super' ? 12 : 8
  } else if (teamId) {
    for (const d of history?.dynasties ?? []) {
      if (d.teamId === teamId) {
        dynastyBonus = Math.max(dynastyBonus, d.tier === 'super' ? 10 : 6)
      }
    }
  }

  const historicalMoments = clamp(
    Math.round(
      gameMvps * 1.2 +
        tripleDoubles * 2.5 +
        (totals.titles ?? 0) * 4 +
        finalsMvps * 5 +
        dynastyBonus +
        recordsHeld * 3,
    ),
    0,
    80,
  )

  // Rivalidades: times em pares clássicos + competitividade
  let rivalryScore = trait(player, 'competitividade', 50) * 0.5
  if (teamId) {
    const inRivalry = RIVALRY_PAIRS.some(
      ([a, b]) => a === teamId || b === teamId,
    )
    if (inRivalry) rivalryScore += 25
    if ((totals.titles ?? 0) > 0 && inRivalry) rivalryScore += 15
  }
  rivalryScore = clamp(Math.round(rivalryScore), 0, 100)

  return {
    playerId,
    name,
    teamId,
    titles: totals.titles ?? 0,
    mvp: totals.mvps ?? 0,
    finalsMvp: finalsMvps,
    allStar,
    allNba,
    dpoy: totals.dpoy ?? 0,
    defense: defenseFactor,
    records: recordsHeld,
    longevitySeasons: seasons,
    longevityGames: totals.games ?? 0,
    popularity,
    personality: personalityAura,
    historicalMoments,
    rivalries: rivalryScore,
    points: totals.points ?? 0,
    assists: totals.assists ?? 0,
    rebounds: totals.rebounds ?? 0,
    gameMvps,
    age: player?.idade ?? null,
  }
}

function findTeamForPlayer(gm, playerId) {
  if (!gm?.rosters) return null
  for (const [teamId, ids] of Object.entries(gm.rosters)) {
    if ((ids ?? []).includes(playerId)) return teamId
  }
  return null
}
