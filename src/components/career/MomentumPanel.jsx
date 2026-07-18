import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'
import { Badge, Card, CardHeader, ProgressBar } from '../ui'

/**
 * Interface da Momentum Engine — somente leitura.
 */
export default function MomentumPanel() {
  const lastMomentum = useGameStore((s) => s.lastMomentum)
  const weekEffects = useGameStore((s) => s.weekEffects)

  const view = gameService.getMomentumView({
    lastMomentum,
    lastWeekResult: weekEffects,
    weekEffects,
  })

  if (!view.available) {
    return (
      <Card id="momentum" padding="lg" className="animate-fade-up">
        <CardHeader subtitle="Momentum Engine" title="Momento psicológico" />
        <p className="text-sm text-slate-500">{view.message}</p>
      </Card>
    )
  }

  const lead =
    (view.home?.value ?? 50) >= (view.away?.value ?? 50) ? view.home : view.away

  return (
    <Card id="momentum" padding="lg" className="animate-fade-up">
      <CardHeader
        subtitle="Momentum Engine"
        title="Momento psicológico"
        action={
          <Badge tone={lead.value >= 58 ? 'blue' : 'neutral'}>
            Pico {Math.round(lead.value)}
          </Badge>
        }
      />

      <p className="mb-3 text-sm text-slate-500">
        Sequências, torcida, clutch, rivalidade, timeouts, enterradas, tocos e
        bolas de três consecutivas. Modifica confiança, decisão, precisão e
        agressividade com deltas pequenos e progressivos (máx. ±7%).
      </p>

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <SideBlock side={view.home} label="Casa" />
        <SideBlock side={view.away} label="Fora" />
      </div>

      <p className="mb-3 text-xs text-slate-500">
        Rivalidade {Math.round(view.rivalry)}
        {view.isPlayoff ? ' · Playoffs' : ''}
        {view.timeouts
          ? ` · Timeouts ${view.timeouts.home ?? 0}/${view.timeouts.away ?? 0}`
          : ''}
      </p>

      {view.lastEvents?.length ? (
        <ul className="space-y-1 text-xs text-slate-500">
          {view.lastEvents.slice(-5).map((ev, i) => (
            <li key={`${ev}-${i}`}>· {ev}</li>
          ))}
        </ul>
      ) : null}
    </Card>
  )
}

function SideBlock({ side, label }) {
  if (!side) return null
  const tone =
    side.value >= 60 ? 'blue' : side.value <= 40 ? 'danger' : 'neutral'

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
          {side.teamName ? ` · ${side.teamName}` : ''}
        </p>
        <Badge tone={tone}>{Math.round(side.value)}</Badge>
      </div>
      <ProgressBar value={side.value} />
      <p className="mt-1.5 text-[11px] text-slate-500">
        Acertos {side.makeStreak} · Erros {side.missStreak} · 3s{' '}
        {side.threeStreak}
      </p>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        {(side.effects ?? []).map((e) => (
          <div
            key={e.key}
            className="rounded-lg border border-slate-100 bg-white px-2 py-1.5"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {e.label}
            </p>
            <p className="text-sm font-semibold tabular-nums text-navy">
              {e.pct > 0 ? '+' : ''}
              {e.pct}%
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
