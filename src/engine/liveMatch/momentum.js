/**
 * Momentum de exibição derivado da sequência de placar do PBP.
 * Não usa RNG nem re-simula posses.
 */

import { clamp } from '../utils/math'

/**
 * Atualiza barras 0–100 a partir da última jogada (pontos / timeout / erro).
 */
export function updateDisplayMomentum(prev, event, homeShort) {
  let home = prev?.home ?? 50
  let away = prev?.away ?? 50
  const pts = event.points ?? 0
  const offenseIsHome =
    event.offense === homeShort ||
    (event.score &&
      prev?.lastHomeScore != null &&
      event.score.home > prev.lastHomeScore)

  if (event.action === 'timeout' || /timeout/i.test(event.text ?? '')) {
    // timeout recupera o lado que pediu (texto Casa/Fora)
    if (/casa/i.test(event.text ?? '')) home = clamp(home + 8, 0, 100)
    else if (/fora/i.test(event.text ?? '')) away = clamp(away + 8, 0, 100)
    else {
      home = clamp(home + 3, 0, 100)
      away = clamp(away + 3, 0, 100)
    }
  } else if (pts > 0) {
    const boost = pts === 3 ? 10 : pts >= 2 ? 7 : 4
    if (offenseIsHome) {
      home = clamp(home + boost, 0, 100)
      away = clamp(away - boost * 0.55, 0, 100)
    } else {
      away = clamp(away + boost, 0, 100)
      home = clamp(home - boost * 0.55, 0, 100)
    }
  } else if (/roubo|toco|turnover|perda/i.test(event.text ?? '')) {
    // defesa ganha impulso
    if (offenseIsHome) {
      away = clamp(away + 5, 0, 100)
      home = clamp(home - 3, 0, 100)
    } else {
      home = clamp(home + 5, 0, 100)
      away = clamp(away - 3, 0, 100)
    }
  } else {
    home = clamp(home * 0.985 + 50 * 0.015, 0, 100)
    away = clamp(away * 0.985 + 50 * 0.015, 0, 100)
  }

  return {
    home: Math.round(home),
    away: Math.round(away),
    lastHomeScore: event.score?.home ?? prev?.lastHomeScore ?? 0,
    lastAwayScore: event.score?.away ?? prev?.lastAwayScore ?? 0,
    leader:
      home === away ? 'even' : home > away ? 'home' : 'away',
  }
}
