/**
 * IA de adversários / decisões de NPC.
 * Placeholder — não depende de UI.
 */

export function chooseAiPlaystyle(teamOvr, playerOvr) {
  const delta = teamOvr - playerOvr
  if (delta >= 8) return 'pace'
  if (delta <= -8) return 'grind'
  return 'balanced'
}

export function estimateAiDifficulty(season = 1) {
  return Math.min(99, 55 + season * 3)
}
