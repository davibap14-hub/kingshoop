import {
  DEFAULT_TEAM_STYLE,
  TEAM_STYLES,
} from '../../data/ai/styles'
import { rankStylesForRoster, scoreStyleFit } from './profile'

/**
 * Escolhe automaticamente o melhor estilo para o elenco.
 */
export function chooseBestStyle(players, opts = {}) {
  const ranked = rankStylesForRoster(players)
  if (!ranked.length) {
    return {
      styleId: DEFAULT_TEAM_STYLE,
      style: TEAM_STYLES[DEFAULT_TEAM_STYLE],
      fit: 50,
      ranked,
      reason: 'Fallback: sem elenco para avaliar.',
    }
  }

  // Empate: pequena preferência por estilos ofensivos se overall alto
  let best = ranked[0]
  if (ranked[1] && ranked[0].fit - ranked[1].fit <= 2) {
    const preferred = opts.preferIds ?? []
    const alt = ranked
      .slice(0, 3)
      .find((r) => preferred.includes(r.id))
    if (alt) best = alt
  }

  return {
    styleId: best.id,
    style: TEAM_STYLES[best.id],
    fit: best.fit,
    ranked,
    reason: `Melhor fit com o elenco: ${best.label} (${best.fit}).`,
  }
}

/**
 * Decisões táticas da IA no decorrer da partida (ajuste fino por posse).
 * Retorna multiplicadores extras sobre o estilo base.
 */
export function decidePossessionPlan({
  styleId,
  scoreDiff = 0,
  quarter = 1,
  fatigue = 0,
  momentKey = `q${quarter}`,
}) {
  const style = TEAM_STYLES[styleId] ?? TEAM_STYLES[DEFAULT_TEAM_STYLE]
  const plan = {
    styleId: style.id,
    aggression: 1,
    threeBias: 0,
    twoBias: 0,
    tempo: style.match.pace ?? 1,
    protectBall: 0,
  }

  // Atrás no placar → mais agressão / 3s
  if (scoreDiff <= -10) {
    plan.aggression += 0.12
    plan.threeBias += 0.06
    plan.tempo += 0.05
  } else if (scoreDiff <= -4) {
    plan.aggression += 0.06
    plan.threeBias += 0.03
  }

  // Na frente no Q4 → protege bola / reduz ritmo
  if (quarter === 4 && scoreDiff >= 8) {
    plan.aggression -= 0.08
    plan.protectBall += 0.04
    plan.tempo -= 0.06
    plan.threeBias -= 0.03
  }

  // Clutch
  if (momentKey === 'q4_close') {
    if (style.id === 'especialista_3pt') plan.threeBias += 0.05
    if (style.id === 'garrafao') plan.twoBias += 0.05
    if (style.id === 'defensivo') plan.protectBall += 0.03
  }

  // Fadiga alta → desacelera (exceto se estilo for puro ritmo e ainda cedo)
  if (fatigue >= 18) {
    plan.tempo -= 0.04
    plan.aggression -= 0.04
    plan.protectBall += 0.02
  }

  // Estilos específicos reforçam o plano
  if (style.id === 'fast_pace' || style.id === 'transicao') {
    plan.tempo += 0.03
  }
  if (style.id === 'defensivo') {
    plan.protectBall += 0.02
    plan.tempo -= 0.02
  }

  return plan
}

/**
 * Resolve estilo do time: explícito ou escolhido pela IA.
 */
export function resolveTeamStyle(side = {}) {
  if (side.styleId && TEAM_STYLES[side.styleId]) {
    const style = TEAM_STYLES[side.styleId]
    return {
      styleId: style.id,
      style,
      fit: scoreStyleFit(side.players ?? [], style.id),
      auto: false,
      reason: `Estilo definido manualmente: ${style.label}.`,
      ranked: rankStylesForRoster(side.players ?? []),
    }
  }

  const decision = chooseBestStyle(side.players ?? [])
  return { ...decision, auto: true }
}

/** @deprecated */
export function chooseAiPlaystyle(teamOvr, playerOvr) {
  const delta = teamOvr - playerOvr
  if (delta >= 8) return 'fast_pace'
  if (delta <= -8) return 'defensivo'
  return 'transicao'
}

export function estimateAiDifficulty(season = 1) {
  return Math.min(99, 55 + season * 3)
}
