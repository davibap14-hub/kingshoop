import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'
import { Badge, Card, CardHeader, ProgressBar } from '../ui'

/**
 * Interface da Scouting Engine — somente leitura (fog of war).
 */
export default function ScoutingPanel() {
  const gm = useGameStore((s) => s.gm)
  const currentTeamId = useGameStore((s) => s.currentTeamId)
  const weekEffects = useGameStore((s) => s.weekEffects)

  const view = gameService.getScoutingView({
    gm,
    currentTeamId,
  })

  return (
    <Card id="scouting" padding="lg" className="animate-fade-up">
      <CardHeader
        subtitle="Scouting Engine"
        title="Observação de talentos"
        action={
          <Badge tone={view.investment >= 55 ? 'blue' : 'neutral'}>
            {view.accuracyLabel} · {view.investment}
          </Badge>
        }
      />

      <p className="mb-3 text-sm text-slate-500">
        Potencial oculto, personalidade, tendências, pontos fortes e fraquezas.
        Quanto maior o investimento, mais precisas as informações — a IA das
        franquias usa estes relatórios no Draft e na Free Agency.
      </p>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Investimento
          </p>
          <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-ink">
            {view.investment}
          </p>
          <ProgressBar value={view.investment} className="mt-2" />
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Relatórios
          </p>
          <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-ink">
            {view.reportCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">Prospects + FA cobertos</p>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Precisão
          </p>
          <p className="mt-1 text-sm font-bold text-navy">{view.accuracyLabel}</p>
          <p className="mt-1 text-xs text-slate-500">{view.tip}</p>
        </div>
      </div>

      {view.prospects.length === 0 ? (
        <p className="text-sm text-slate-500">
          Nenhuma classe de draft ativa — o scouting intensifica na offseason.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                <th className="py-2 pr-2 font-semibold">#</th>
                <th className="py-2 pr-2 font-semibold">Prospect</th>
                <th className="py-2 pr-2 font-semibold">OVR*</th>
                <th className="py-2 pr-2 font-semibold">Pot.*</th>
                <th className="py-2 pr-2 font-semibold">Conf.</th>
                <th className="py-2 pr-2 font-semibold">Forças</th>
                <th className="py-2 font-semibold">Fraquezas</th>
              </tr>
            </thead>
            <tbody>
              {view.prospects.map((p) => (
                <tr key={p.id} className="border-b border-slate-50">
                  <td className="py-2 pr-2 tabular-nums text-slate-500">
                    {p.mockRank ?? '—'}
                  </td>
                  <td className="py-2 pr-2">
                    <p className="font-semibold text-navy">{p.nome}</p>
                    <p className="text-xs text-slate-500">
                      {p.posicao} · {p.idade}a
                      {p.grade ? ` · ${p.grade}` : ''}
                    </p>
                  </td>
                  <td className="py-2 pr-2 tabular-nums">{p.overallEstimate}</td>
                  <td className="py-2 pr-2 tabular-nums">
                    {p.potentialEstimate}
                    {p.potentialRange ? (
                      <span className="block text-[10px] text-slate-400">
                        {p.potentialRange[0]}–{p.potentialRange[1]}
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2 pr-2">
                    <Badge tone={p.confidence >= 55 ? 'blue' : 'neutral'}>
                      {p.confidence}%
                    </Badge>
                  </td>
                  <td className="py-2 pr-2 text-xs text-slate-600">
                    {p.strengths.length
                      ? p.strengths.map((s) => s.label).join(', ')
                      : '—'}
                  </td>
                  <td className="py-2 text-xs text-slate-600">
                    {p.weaknesses.length
                      ? p.weaknesses.map((w) => w.label).join(', ')
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[11px] text-slate-400">
            * Estimativas de scouting — não são os valores verdadeiros ocultos.
          </p>
        </div>
      )}

      {weekEffects?.scouting ? (
        <p className="mt-3 text-xs text-slate-500">
          Última semana: {weekEffects.scouting.reportCount} relatórios na liga ·{' '}
          {weekEffects.scouting.draftProspects} prospects ·{' '}
          {weekEffects.scouting.freeAgents} FA
        </p>
      ) : null}
    </Card>
  )
}
