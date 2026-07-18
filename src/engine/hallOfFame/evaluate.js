import { gatherCredentials } from './credentials.js'
import { classifyHofScore, isHofInducted } from './classify.js'
import { calculateHofScore } from './score.js'

/**
 * Avalia um jogador aposentado → pontuação + classificação.
 * Resultado deve ser salvo permanentemente no History Engine.
 */
export function evaluateRetiredPlayer({
  retirement,
  history,
  gm = null,
  evaluatedSeason = null,
} = {}) {
  if (!retirement?.playerId && !retirement?.name) return null

  const credentials = gatherCredentials({
    playerId: retirement.playerId,
    playerName: retirement.name,
    history,
    gm,
    retirement,
  })

  const { score, breakdown, factors } = calculateHofScore(credentials)
  const classification = classifyHofScore(score)
  const inducted = isHofInducted(classification.id)

  const reason = buildBallotReason(credentials, classification, score)

  return {
    playerId: credentials.playerId ?? retirement.playerId,
    name: credentials.name,
    teamId: credentials.teamId,
    retiredSeason: retirement.season ?? null,
    retiredWeek: retirement.week ?? null,
    evaluatedSeason:
      evaluatedSeason ??
      retirement.season ??
      history?.seasons?.at(-1)?.season ??
      null,
    classification: classification.id,
    classificationLabel: classification.label,
    score,
    inducted,
    credentials: {
      titles: credentials.titles,
      mvps: credentials.mvps,
      finalsMvps: credentials.finalsMvps,
      allStar: credentials.allStar,
      allNba: credentials.allNba,
      dpoy: credentials.dpoy,
      points: credentials.points,
      assists: credentials.assists,
      rebounds: credentials.rebounds,
      longevity: credentials.longevity,
      popularity: credentials.popularity,
      gameMvps: credentials.gameMvps,
      age: credentials.age,
      games: credentials.games,
      legacyScore: credentials.legacyScore,
    },
    breakdown,
    factors,
    reason,
    evaluatedAt: Date.now(),
  }
}

/**
 * Processa aposentadorias da semana — retorna ballots + listas para o History.
 */
export function processHallOfFameBallots({
  history,
  gm = null,
  retirements = [],
  evaluatedSeason = null,
} = {}) {
  const existingBallots = new Set(
    (history?.hofBallots ?? []).map(
      (b) => `${b.playerId}|${b.retiredSeason ?? ''}`,
    ),
  )
  const existingHof = new Set(
    (history?.hallOfFame ?? []).map((h) => h.playerId),
  )

  const ballots = []
  const inductees = []

  for (const retirement of retirements) {
    const key = `${retirement.playerId}|${retirement.season ?? ''}`
    if (existingBallots.has(key)) continue
    if (existingHof.has(retirement.playerId)) continue

    const ballot = evaluateRetiredPlayer({
      retirement,
      history,
      gm,
      evaluatedSeason,
    })
    if (!ballot) continue

    ballots.push(ballot)
    if (ballot.inducted) {
      inductees.push({
        playerId: ballot.playerId,
        name: ballot.name,
        teamId: ballot.teamId,
        inductedSeason: ballot.evaluatedSeason,
        inductedAt: ballot.evaluatedAt,
        classification: ballot.classification,
        classificationLabel: ballot.classificationLabel,
        score: ballot.score,
        credentials: ballot.credentials,
        reason: ballot.reason,
      })
    }
  }

  return { ballots, inductees }
}

/**
 * Persiste ballots + induções no History (permanente).
 */
export function appendHofToHistory(history, { ballots = [], inductees = [] } = {}) {
  if (!ballots.length && !inductees.length) return history

  return {
    ...history,
    hofBallots: [...(history.hofBallots ?? []), ...ballots],
    hallOfFame: [...(history.hallOfFame ?? []), ...inductees],
  }
}

function buildBallotReason(credentials, classification, score) {
  const parts = []
  if (credentials.titles) parts.push(`${credentials.titles} título(s)`)
  if (credentials.mvps || credentials.finalsMvps) {
    parts.push(
      `${(credentials.mvps ?? 0) + (credentials.finalsMvps ?? 0)} MVP(s)`,
    )
  }
  if (credentials.allStar) parts.push(`${credentials.allStar} All-Star`)
  if (credentials.allNba) parts.push(`${credentials.allNba} All-NBA`)
  if (credentials.dpoy) parts.push(`${credentials.dpoy} DPOY`)
  if (credentials.points) {
    parts.push(`${Math.round(credentials.points)} pts`)
  }
  parts.push(`score ${score}`)
  return `${classification.label}: ${parts.join(' · ')}`
}
