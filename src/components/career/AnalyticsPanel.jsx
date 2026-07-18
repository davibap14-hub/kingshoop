import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'
import { Badge, Card, CardHeader } from '../ui'

/**
 * Interface da Analytics Engine — somente leitura.
 * Todos os cálculos vivem na Engine.
 */
export default function AnalyticsPanel() {
  const analytics = useGameStore((s) => s.analytics)
  const player = useGameStore((s) => s.player)
  const currentTeamId = useGameStore((s) => s.currentTeamId)
  const weekEffects = useGameStore((s) => s.weekEffects)

  const view = gameService.getAnalyticsView({
    analytics,
    player,
    currentTeamId,
  })
  const summary = weekEffects?.analytics
  const avg = view.careerPlayer?.averages

  return (
    <Card id="analytics" padding="lg" className="animate-fade-up">
      <CardHeader
        subtitle="Analytics Engine"
        title="Estatísticas avançadas"
        action={
          <Badge tone="blue">
            {view.playersTracked} jogador(es)
          </Badge>
        }
      />

      <p className="mb-3 text-sm text-slate-500">
        PER · TS% · eFG% · Usage% · Assist% · Rebound% · ORtg · DRtg · Net ·
        Win Shares · PIE. Calculado na Engine; a Interface só exibe.
      </p>

      {!view.careerPlayer ? (
        <p className="mb-4 text-sm text-slate-500">
          Avance semanas com jogos para gerar métricas avançadas do elenco e do
          seu atleta.
        </p>
      ) : (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="PER" value={fmt(avg?.per)} />
            <Metric label="TS%" value={fmtPct(avg?.tsPct)} />
            <Metric label="eFG%" value={fmtPct(avg?.efgPct)} />
            <Metric label="USG%" value={fmtPct(avg?.usgPct)} />
            <Metric label="AST%" value={fmtPct(avg?.astPct)} />
            <Metric label="REB%" value={fmtPct(avg?.rebPct)} />
            <Metric label="ORtg" value={fmt(avg?.ortg)} />
            <Metric label="DRtg" value={fmt(avg?.drtg)} />
            <Metric label="Net" value={fmt(avg?.netRtg)} />
            <Metric label="WS" value={fmt(avg?.winShares, 2)} />
            <Metric label="PIE" value={fmtPct(avg?.pie)} />
            <Metric
              label="Jogos"
              value={String(view.careerPlayer.games ?? 0)}
            />
          </div>
          <p className="mb-4 text-xs text-slate-500">
            {view.careerPlayer.playerName}
            {view.careerPlayer.teamId
              ? ` · ${view.careerPlayer.teamId.toUpperCase()}`
              : null}
            {' · '}
            {view.careerPlayer.counting.pts} pts ·{' '}
            {view.careerPlayer.counting.reb} reb ·{' '}
            {view.careerPlayer.counting.ast} ast
          </p>
        </>
      )}

      {summary?.games ? (
        <p className="mb-3 text-xs text-slate-500">
          Última semana: {summary.games} jogo(s) processado(s)
          {summary.leaders?.[0]
            ? ` · líder PER ${summary.leaders[0].playerName} (${summary.leaders[0].advanced?.per ?? '—'})`
            : null}
          .
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <LeaderTable
          title="Líderes da liga (PER)"
          empty="Sem dados de temporada."
          rows={view.leagueLeaders}
        />
        <LeaderTable
          title="Elenco (PER)"
          empty="Sem dados do time."
          rows={view.teamLeaders}
        />
      </div>
    </Card>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-extrabold tabular-nums text-ink">
        {value}
      </p>
    </div>
  )
}

function LeaderTable({ title, empty, rows }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
      <h4 className="mb-2 font-display text-sm font-bold text-navy">{title}</h4>
      {rows.length === 0 ? (
        <p className="text-xs text-slate-500">{empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                <th className="py-1.5 pr-2 font-semibold">Jogador</th>
                <th className="py-1.5 pr-2 font-semibold">PER</th>
                <th className="py-1.5 pr-2 font-semibold">TS%</th>
                <th className="py-1.5 pr-2 font-semibold">USG%</th>
                <th className="py-1.5 pr-2 font-semibold">Net</th>
                <th className="py-1.5 font-semibold">PIE</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.playerId}
                  className="border-b border-slate-50 text-slate-700"
                >
                  <td className="py-1.5 pr-2 font-semibold text-navy">
                    {r.playerName}
                  </td>
                  <td className="py-1.5 pr-2 tabular-nums">{fmt(r.per)}</td>
                  <td className="py-1.5 pr-2 tabular-nums">{fmtPct(r.tsPct)}</td>
                  <td className="py-1.5 pr-2 tabular-nums">{fmtPct(r.usgPct)}</td>
                  <td className="py-1.5 pr-2 tabular-nums">{fmt(r.netRtg)}</td>
                  <td className="py-1.5 tabular-nums">{fmtPct(r.pie)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function fmt(v, digits = 1) {
  if (v == null || Number.isNaN(Number(v))) return '—'
  return Number(v).toFixed(digits)
}

function fmtPct(v) {
  if (v == null || Number.isNaN(Number(v))) return '—'
  return `${Number(v).toFixed(1)}%`
}
