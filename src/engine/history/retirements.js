import { resolvePlayer } from '../gm/situation'

/**
 * Detecta aposentadorias a partir de decisões do GM / notícias.
 */
export function extractRetirementsFromGm(decisions = [], gm, season, week) {
  const retirements = []

  for (const d of decisions) {
    if (d.type !== 'release') continue
    const reason = d.reason ?? ''
    const looksRetired = /veterano|aposent|idade|retir/i.test(reason)
    const player = resolvePlayer(gm, d.playerId)
    const age = player?.idade ?? player?.age ?? null

    if (!looksRetired && !(age != null && age >= 34)) continue

    retirements.push({
      playerId: d.playerId,
      name: d.playerName ?? player?.nome ?? d.playerId,
      teamId: d.teamId ?? null,
      age,
      season,
      week,
      reason: looksRetired ? reason : 'Carreira encerrada por idade',
      at: d.at ?? Date.now(),
    })
  }

  return retirements
}

/**
 * Anexa aposentadorias ao histórico (sem duplicar a mesma temporada+jogador).
 */
export function appendRetirements(history, retirements = []) {
  if (!retirements.length) return history

  const list = [...(history.retirements || [])]
  for (const r of retirements) {
    const exists = list.some(
      (x) => x.playerId === r.playerId && x.season === r.season,
    )
    if (!exists) list.push(r)
  }

  return {
    ...history,
    retirements: list.sort(
      (a, b) => a.season - b.season || (a.week ?? 0) - (b.week ?? 0),
    ),
  }
}
