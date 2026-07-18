/**
 * Extrai metadados de um evento PBP já produzido pela Simulation Engine.
 * Não re-simula — só lê campos e texto.
 */

export function normalizePbpEvent(raw, index) {
  if (!raw) return null
  const score = raw.score ?? {
    home: raw.homeScore ?? 0,
    away: raw.awayScore ?? 0,
  }
  return {
    id: raw.id ?? `live_${index}`,
    seq: raw.seq ?? index + 1,
    quarter: raw.quarter ?? null,
    clock: raw.clock ?? (raw.quarter != null ? `Q${raw.quarter}` : '—'),
    action: raw.action ?? 'possession',
    actionLabel: raw.actionLabel ?? raw.action ?? 'Jogada',
    text: raw.text ?? '',
    points: raw.points ?? 0,
    score: { home: score.home ?? 0, away: score.away ?? 0 },
    offense: raw.offense ?? null,
    defense: raw.defense ?? null,
    actors: { ...(raw.actors ?? {}) },
  }
}

export function extractPlayActors(event) {
  const actors = event.actors ?? {}
  const text = event.text ?? ''
  const points = event.points ?? 0

  let scorer = actors.shooter ?? null
  let assister = actors.assister ?? null
  let fouler = actors.fouler ?? null

  if (!scorer && points > 0) {
    const m = text.match(/Cesta de ([^(—\-]+)/i) || text.match(/de ([^(]+)\s*\(/)
    if (m) scorer = m[1].trim()
  }
  if (!assister && /assistência de /i.test(text)) {
    const m = text.match(/assistência de ([^.]+)/i)
    if (m) assister = m[1].trim()
  }
  if (!fouler && (/falta/i.test(text) || /foul/i.test(text))) {
    fouler = actors.fouler ?? actors.defender ?? null
  }

  const isTimeout = event.action === 'timeout' || /timeout/i.test(text)
  const isFoul =
    Boolean(fouler) ||
    (event.action === 'individual_defense' && /falta/i.test(text)) ||
    /faltas? de /i.test(text)

  return {
    scorer: points > 0 ? scorer : null,
    assister: points > 0 ? assister : null,
    fouler: isFoul ? fouler : null,
    isTimeout,
    isFoul,
    isScoring: points > 0,
  }
}

export function timeoutSide(event, homeShort, awayShort) {
  const text = event.text ?? ''
  if (/casa/i.test(text)) return 'home'
  if (/fora/i.test(text)) return 'away'
  if (homeShort && text.includes(homeShort)) return 'home'
  if (awayShort && text.includes(awayShort)) return 'away'
  return null
}
