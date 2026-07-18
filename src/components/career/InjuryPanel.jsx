import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'
import { Badge, Card, CardHeader, ProgressBar } from '../ui'

const SEV_TONE = {
  light: 'blue',
  moderate: 'neutral',
  severe: 'danger',
  mild: 'blue',
}

/**
 * Interface da Injury Engine — somente leitura.
 */
export default function InjuryPanel() {
  const injury = useGameStore((s) => s.injury)
  const injuryEngine = useGameStore((s) => s.injuryEngine)
  const player = useGameStore((s) => s.player)
  const weekEffects = useGameStore((s) => s.weekEffects)

  const view = gameService.getInjuryView({
    injury,
    injuryEngine,
    player,
  })

  const risk = view.profile.injuryRisk

  return (
    <Card id="lesoes" padding="lg" className="animate-fade-up">
      <CardHeader
        subtitle="Injury Engine"
        title="Saúde e lesões"
        action={
          <Badge tone={view.healthy ? 'blue' : 'danger'}>
            {view.healthy ? 'Saudável' : view.active?.severityLabel}
          </Badge>
        }
      />

      <p className="mb-3 text-sm text-slate-500">
        Risco, histórico, condição física, minutos e fadiga. Lesões Leve /
        Moderada / Grave com tempo estimado, recaída, redução temporária de
        atributos e tratamento. Recuperação ponderada por equipe médica,
        descanso, idade e condição.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Meter label="Risco" value={risk} danger={risk >= 55} />
        <Meter label="Condição" value={view.profile.condition} />
        <Meter label="Fadiga" value={view.profile.fatigue} danger={view.profile.fatigue >= 65} />
        <Meter label="Equipe médica" value={view.profile.medicalStaff} />
        <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Minutos/jogo
          </p>
          <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-ink">
            {view.profile.minutesPerGame}
          </p>
        </div>
      </div>

      {view.active ? (
        <div className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-navy">{view.active.label}</p>
            <Badge tone={SEV_TONE[view.active.severity] ?? 'danger'}>
              {view.active.severityLabel}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {view.active.weeksRemaining} / {view.active.weeksEstimated} semanas ·{' '}
            {view.active.treatmentLabel} · recaída {view.active.relapsePct}%
          </p>
          {view.active.reductions?.length ? (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {view.active.reductions.map((r) => (
                <li key={r.path}>
                  <Badge tone="danger">
                    {r.label} {r.delta}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-500">
          Sem lesão ativa. Histórico: {view.profile.historyCount} registro(s).
        </p>
      )}

      {view.history.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Histórico recente
          </p>
          <ul className="space-y-1.5">
            {view.history.map((h) => (
              <li
                key={`${h.id}-${h.occurredWeek}`}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="truncate text-navy">
                  {h.label}
                  {h.relapsed ? ' (recaída)' : ''}
                </span>
                <Badge tone={SEV_TONE[h.severity] ?? 'neutral'}>
                  {h.severityLabel}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {weekEffects?.injuryEngine ? (
        <p className="mt-3 text-xs text-slate-500">
          Última semana: risco {weekEffects.injuryEngine.injuryRisk} · condição{' '}
          {weekEffects.injuryEngine.condition} · fadiga{' '}
          {weekEffects.injuryEngine.fatigue}
        </p>
      ) : null}
    </Card>
  )
}

function Meter({ label, value, danger = false }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-ink">
        {value}
      </p>
      <ProgressBar
        value={value}
        className={`mt-2 ${danger ? 'opacity-90' : ''}`}
      />
    </div>
  )
}
