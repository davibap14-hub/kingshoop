import { AWARD_LABELS } from '../../data/season/constants'
import { getTeamById } from '../../data/teams'
import { getConferenceTables } from './standings'

/**
 * Calcula premiações ao fim da temporada / semana de awards.
 */
export function computeSeasonAwards(seasonState) {
  const standings = Object.values(seasonState.standings ?? {})
  if (!standings.length) return null

  const byWins = [...standings].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins
    return b.pointsFor - b.pointsAgainst - (a.pointsFor - a.pointsAgainst)
  })

  const byDefense = [...standings].sort(
    (a, b) => a.pointsAgainst - b.pointsAgainst,
  )

  const byDiff = [...standings].sort((a, b) => {
    const dA = a.pointsFor - a.pointsAgainst
    const dB = b.pointsFor - b.pointsAgainst
    return dB - dA
  })

  const mostImproved = [...standings].sort((a, b) => {
    const sA = a.streak
    const sB = b.streak
    if (sB !== sA) return sB - sA
    return b.wins - a.wins
  })[0]

  const mvpTeam = byWins[0]
  const dpoyTeam = byDefense[0]
  const coyTeam = byDiff[0]
  const championId = seasonState.champion ?? seasonState.playoffs?.finals?.champion
  const championTeam = championId ? getTeamById(championId) : null
  const finalsMvp =
    seasonState.playoffs?.finals?.mvp ??
    (championTeam ? `${championTeam.short} Star` : null)

  const tables = getConferenceTables(seasonState.standings)

  const awards = {
    mvp: {
      id: 'mvp',
      label: AWARD_LABELS.mvp,
      teamId: mvpTeam?.teamId,
      teamShort: mvpTeam?.short,
      detail: `${mvpTeam?.wins}-${mvpTeam?.losses}`,
    },
    dpoy: {
      id: 'dpoy',
      label: AWARD_LABELS.dpoy,
      teamId: dpoyTeam?.teamId,
      teamShort: dpoyTeam?.short,
      detail: `${dpoyTeam?.pointsAgainst} pts sofridos`,
    },
    mip: {
      id: 'mip',
      label: AWARD_LABELS.mip,
      teamId: mostImproved?.teamId,
      teamShort: mostImproved?.short,
      detail: mostImproved?.streakLabel,
    },
    coy: {
      id: 'coy',
      label: AWARD_LABELS.coy,
      teamId: coyTeam?.teamId,
      teamShort: coyTeam?.short,
      detail: `Diff ${coyTeam ? coyTeam.pointsFor - coyTeam.pointsAgainst : 0}`,
    },
    finals_mvp: {
      id: 'finals_mvp',
      label: AWARD_LABELS.finals_mvp,
      teamId: championId,
      teamShort: championTeam?.short,
      detail: finalsMvp,
    },
    champion: {
      id: 'champion',
      label: AWARD_LABELS.champion,
      teamId: championId,
      teamShort: championTeam?.short,
      detail: seasonState.playoffs?.finals
        ? `${seasonState.playoffs.finals.homeScore}–${seasonState.playoffs.finals.awayScore}`
        : null,
    },
    conferences: {
      East: tables.East?.[0] ?? null,
      West: tables.West?.[0] ?? null,
    },
  }

  return awards
}

export function awardsMessages(awards) {
  if (!awards) return []
  const lines = ['Premiações da temporada:']
  for (const key of ['champion', 'mvp', 'dpoy', 'mip', 'coy', 'finals_mvp']) {
    const a = awards[key]
    if (!a?.teamShort) continue
    lines.push(`${a.label}: ${a.teamShort}${a.detail ? ` (${a.detail})` : ''}`)
  }
  return lines
}
