import { TEAM_STYLES, TEAM_STYLE_LIST } from '../../data/ai/styles'
import { calcGroupRating } from '../../data/players/utils'

function avg(values) {
  if (!values.length) return 0
  return values.reduce((s, n) => s + n, 0) / values.length
}

/**
 * Extrai métricas do elenco usadas pela AI Engine.
 */
export function analyzeRoster(players = []) {
  const flat = {
    velocidade: avg(players.map((p) => p.fisico?.velocidade ?? 50)),
    impulsao: avg(players.map((p) => p.fisico?.impulsao ?? 50)),
    forca: avg(players.map((p) => p.fisico?.forca ?? 50)),
    resistencia: avg(players.map((p) => p.fisico?.resistencia ?? 50)),
    bandeja: avg(players.map((p) => p.arremesso?.bandeja ?? 50)),
    midRange: avg(players.map((p) => p.arremesso?.midRange ?? 50)),
    tresPontos: avg(players.map((p) => p.arremesso?.tresPontos ?? 50)),
    lanceLivre: avg(players.map((p) => p.arremesso?.lanceLivre ?? 50)),
    perimetro: avg(players.map((p) => p.defesa?.perimetro ?? 50)),
    garrafao: avg(players.map((p) => p.defesa?.garrafao ?? 50)),
    roubo: avg(players.map((p) => p.defesa?.roubo ?? 50)),
    toco: avg(players.map((p) => p.defesa?.toco ?? 50)),
    passe: avg(players.map((p) => p.qi?.passe ?? 50)),
    visao: avg(players.map((p) => p.qi?.visao ?? 50)),
    tomadaDecisao: avg(players.map((p) => p.qi?.tomadaDecisao ?? 50)),
    overall: avg(players.map((p) => p.overall ?? 70)),
    fisico: avg(players.map((p) => calcGroupRating(p.fisico))),
    arremesso: avg(players.map((p) => calcGroupRating(p.arremesso))),
    defesa: avg(players.map((p) => calcGroupRating(p.defesa))),
    qi: avg(players.map((p) => calcGroupRating(p.qi))),
  }

  return flat
}

/**
 * Score 0–100 de aderência do elenco a um estilo.
 */
export function scoreStyleFit(players, styleId) {
  const style = TEAM_STYLES[styleId]
  if (!style) return 0

  const profile = analyzeRoster(players)
  let weighted = 0
  let totalW = 0

  for (const [attr, weight] of Object.entries(style.fitWeights)) {
    weighted += (profile[attr] ?? 50) * weight
    totalW += weight
  }

  const raw = totalW ? weighted / totalW : 50
  // Normaliza em torno de 50–95
  return Math.round(Math.max(0, Math.min(100, (raw - 40) * 1.6 + 40)))
}

/**
 * Rankeia todos os estilos para o elenco.
 */
export function rankStylesForRoster(players) {
  return TEAM_STYLE_LIST.map((style) => ({
    id: style.id,
    label: style.label,
    description: style.description,
    fit: scoreStyleFit(players, style.id),
  })).sort((a, b) => b.fit - a.fit)
}
