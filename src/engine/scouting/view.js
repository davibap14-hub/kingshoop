import { analyzeTrueProfile } from './profile.js'
import { getScoutedView } from './report.js'
import {
  createScoutingState,
  getReport,
  getTeamInvestment,
} from './state.js'

/**
 * Visão read-only para a Interface (nunca expõe potencial verdadeiro).
 */
export function getScoutingView(state = {}) {
  const teamId = state.currentTeamId
  const scouting = createScoutingState(state.scouting ?? state.gm?.scouting)
  const investment = getTeamInvestment(scouting, teamId)
  const teamReports = scouting.reports?.[teamId] ?? {}

  const draftClass = state.gm?.draftClass ?? []
  const prospects = draftClass.slice(0, 12).map((p) => {
    const report = getReport(scouting, teamId, p.id)
    const view = getScoutedView(p, report)
    return {
      id: p.id,
      nome: p.nome,
      posicao: p.posicao,
      idade: p.idade,
      universidade: p.universidade,
      mockRank: p.mockDraft?.rank ?? null,
      grade: view?.grade,
      overallEstimate: view?.overall,
      potentialEstimate: view?.potencial,
      potentialRange: view?.potentialRange,
      confidence: view?.confidence ?? 0,
      strengths: view?.strengths ?? [],
      weaknesses: view?.weaknesses ?? [],
      hasPersonality: Boolean(view?.personalidade),
      hasTendencies: Boolean(view?.tendencias),
      scouted: Boolean(view?.scouted),
    }
  })

  const topReports = Object.values(teamReports)
    .filter((r) => r.isProspect)
    .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))
    .slice(0, 5)
    .map((r) => ({
      playerId: r.playerId,
      playerName: r.playerName,
      grade: r.grade,
      confidence: r.confidence,
      potentialEstimate: r.potentialEstimate,
      potentialRange: r.potentialRange,
    }))

  return {
    investment,
    accuracyLabel:
      investment >= 75
        ? 'Elite'
        : investment >= 55
          ? 'Sólido'
          : investment >= 35
            ? 'Básico'
            : 'Limitado',
    reportCount: Object.keys(teamReports).length,
    prospects,
    topReports,
    tip:
      investment < 50
        ? 'Aumente o investimento em scouting para revelar potencial oculto, personalidade e fraquezas.'
        : 'Boa cobertura — as franquias rivais também observam a mesma classe.',
  }
}

/**
 * Detalhe de um prospect para a UI (fog of war).
 */
export function getProspectScoutDetail(state, playerId) {
  const teamId = state.currentTeamId
  const scouting = createScoutingState(state.scouting ?? state.gm?.scouting)
  const player =
    (state.gm?.draftClass ?? []).find((p) => p.id === playerId) ?? null
  if (!player) return null

  const report = getReport(scouting, teamId, playerId)
  const view = getScoutedView(player, report)
  // true profile só para debug interno — não incluir na view pública
  void analyzeTrueProfile

  return {
    ...view,
    investment: getTeamInvestment(scouting, teamId),
    report,
  }
}
