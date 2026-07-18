import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'
import { Badge, Card, CardHeader, ProgressBar } from '../ui'

/**
 * Interface da Trade Engine — somente leitura.
 */
export default function TradePanel() {
  const gm = useGameStore((s) => s.gm)
  const season = useGameStore((s) => s.season)
  const currentTeamId = useGameStore((s) => s.currentTeamId)
  const currentSeason = useGameStore((s) => s.currentSeason)
  const weekEffects = useGameStore((s) => s.weekEffects)

  const view = gameService.getTradeView({
    gm,
    season,
    currentTeamId,
    currentSeason,
    weekEffects,
    lastWeekResult: weekEffects,
  })

  if (!view.available) {
    return (
      <Card id="trocas" padding="lg" className="animate-fade-up">
        <CardHeader subtitle="Trade Engine" title="Mercado de trocas" />
        <p className="text-sm text-slate-500">{view.message}</p>
      </Card>
    )
  }

  return (
    <Card id="trocas" padding="lg" className="animate-fade-up">
      <CardHeader
        subtitle="Trade Engine"
        title="Mercado de trocas"
        action={<Badge tone="blue">Anti-irreal</Badge>}
      />

      <p className="mb-3 text-sm text-slate-500">
        Valor de mercado (overall, idade, potencial, contrato, personalidade,
        posição, necessidade, objetivo e salary cap). IA negocia pacotes com
        múltiplos jogadores e escolhas de draft — nunca aprova trocas irreais.
      </p>

      <p className="mb-4 text-xs text-slate-500">
        Regras: até {view.rules.maxPlayersPerSide} jogadores /{' '}
        {view.rules.maxPicksPerSide} picks por lado · matching{' '}
        {view.rules.salaryMatch} · ratio máx. {view.rules.maxValueRatio}
      </p>

      {view.marketValues?.length ? (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Valor de mercado — {view.teamShort}
          </p>
          <div className="space-y-2">
            {view.marketValues.slice(0, 5).map((p) => (
              <div key={p.playerId}>
                <div className="mb-0.5 flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-ink">
                    {p.name}{' '}
                    <span className="text-xs text-slate-400">
                      {p.posicao} · OVR {p.overall}
                    </span>
                  </p>
                  <p className="text-sm font-semibold tabular-nums text-navy">
                    {p.marketValue}
                  </p>
                </div>
                <ProgressBar value={Math.min(100, p.marketValue)} />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {view.draftPicks?.length ? (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Escolhas de draft
          </p>
          <div className="flex flex-wrap gap-2">
            {view.draftPicks.map((p) => (
              <Badge key={p.id} tone={p.traded ? 'neutral' : 'blue'}>
                {p.label}
                {p.traded ? ` · via ${p.originalShort}` : ''} · {p.value}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      {(view.weekTrades?.length || view.recentTrades?.length) ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Trocas recentes
          </p>
          <ul className="space-y-2 text-sm text-slate-600">
            {(view.weekTrades?.length
              ? view.weekTrades
              : view.recentTrades
            )
              .slice(0, 5)
              .map((t, i) => (
                <li
                  key={`${t.teamId}-${t.partnerId}-${i}`}
                  className="rounded-lg border border-slate-100 bg-white px-3 py-2"
                >
                  <p className="font-medium text-navy">
                    {t.teamShort} ⇄ {t.partnerShort}
                  </p>
                  <p className="text-xs text-slate-500">{t.summary}</p>
                  {t.fairness != null ? (
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Fairness {t.fairness}
                      {t.sentPicks || t.receivedPicks
                        ? ` · picks ${t.sentPicks}/${t.receivedPicks}`
                        : ''}
                    </p>
                  ) : null}
                </li>
              ))}
          </ul>
        </div>
      ) : (
        <p className="text-xs text-slate-500">
          Nenhuma troca registrada ainda — o mercado abre em semanas de
          offseason / awards / a cada 6 semanas na temporada.
        </p>
      )}
    </Card>
  )
}
