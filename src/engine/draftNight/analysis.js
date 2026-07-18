/**
 * Análise e comparação de prospects para o painel da transmissão.
 */

import { getReport } from '../scouting/state.js'
import { getScoutedView } from '../scouting/report.js'

export function analyzeProspect(prospect, opts = {}) {
  if (!prospect) return null

  const { scouting = null, teamId = null, needs = [] } = opts
  const report =
    scouting && teamId ? getReport(scouting, teamId, prospect.id) : null
  const view = getScoutedView(prospect, report)
  const overall = view?.overall ?? prospect.overall ?? 70
  const potencial = view?.potencial ?? prospect.potencial ?? 70
  const fitsNeed = needs.includes(prospect.posicao)

  const strengths = (view?.strengths ?? []).slice(0, 3).map((s) => ({
    label: s.label ?? s.key ?? 'Força',
    value: s.value ?? null,
  }))
  const weaknesses = (view?.weaknesses ?? []).slice(0, 2).map((w) => ({
    label: w.label ?? w.key ?? 'Ponto a trabalhar',
    value: w.value ?? null,
  }))

  let ceiling = 'Role player de rotação'
  if (potencial >= 90) ceiling = 'Estrela de franquia'
  else if (potencial >= 84) ceiling = 'All-Star em pico'
  else if (potencial >= 78) ceiling = 'Starter de playoff'

  let floor = 'Projeto de G-League'
  if (overall >= 78) floor = 'Contribuição imediata'
  else if (overall >= 72) floor = 'Minutos de rookie úteis'

  return {
    id: prospect.id,
    nome: prospect.nome,
    posicao: prospect.posicao,
    idade: prospect.idade,
    universidade: prospect.universidade,
    arquetipo: prospect.arquetipo,
    overall,
    potencial,
    mockRank: prospect.mockDraft?.rank ?? null,
    mockNotes: prospect.mockDraft?.notes ?? null,
    grade: view?.grade ?? prospect.mockDraft?.consensus ?? null,
    confidence: view?.confidence ?? 0,
    scouted: Boolean(view?.scouted),
    fitsNeed,
    needLabel: fitsNeed
      ? `Preenche necessidade (${prospect.posicao})`
      : `Luxo em ${prospect.posicao}`,
    ceiling,
    floor,
    strengths,
    weaknesses,
    headline: buildAnalysisHeadline(prospect, { fitsNeed, potencial, overall }),
  }
}

export function compareProspects(a, b, opts = {}) {
  if (!a || !b) return null
  const left = analyzeProspect(a, opts)
  const right = analyzeProspect(b, opts)
  if (!left || !right) return null

  const axes = [
    {
      key: 'overall',
      label: 'Pronto agora',
      a: left.overall,
      b: right.overall,
    },
    {
      key: 'potencial',
      label: 'Teto',
      a: left.potencial,
      b: right.potencial,
    },
    {
      key: 'idade',
      label: 'Idade (menor melhor)',
      a: left.idade ?? 20,
      b: right.idade ?? 20,
      invert: true,
    },
    {
      key: 'mock',
      label: 'Mock (menor melhor)',
      a: left.mockRank ?? 99,
      b: right.mockRank ?? 99,
      invert: true,
    },
  ].map((axis) => {
    const aWins = axis.invert ? axis.a < axis.b : axis.a > axis.b
    const bWins = axis.invert ? axis.b < axis.a : axis.b > axis.a
    return {
      ...axis,
      edge: aWins ? 'a' : bWins ? 'b' : 'tie',
    }
  })

  const aScore = axes.filter((x) => x.edge === 'a').length
  const bScore = axes.filter((x) => x.edge === 'b').length

  return {
    a: left,
    b: right,
    axes,
    verdict:
      aScore === bScore
        ? 'Mesa dividida — depende do fit da franquia.'
        : aScore > bScore
          ? `${left.nome} leva a comparação no papel.`
          : `${right.nome} leva a comparação no papel.`,
  }
}

function buildAnalysisHeadline(prospect, { fitsNeed, potencial, overall }) {
  const name = prospect.nome
  if (fitsNeed && potencial >= 84) {
    return `${name}: encaixa na necessidade e tem teto de All-Star.`
  }
  if (potencial - overall >= 12) {
    return `${name}: projeto clássico — upside alto, paciência exigida.`
  }
  if (overall >= 78) {
    return `${name}: perfil plug-and-play para a rotação.`
  }
  return `${name}: avaliação de mesa — ${prospect.posicao} de ${prospect.universidade ?? 'college'}.`
}
