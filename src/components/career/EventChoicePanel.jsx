import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'
import { Badge } from '../ui'

function formatEffect(key, value) {
  const sign = value > 0 ? '+' : ''
  if (key === 'dinheiro') {
    return `${sign}$${Math.abs(value).toLocaleString('en-US')}`
  }
  return `${sign}${value}`
}

/**
 * Interface da Story Engine — exibe história pendente / resultado.
 * Cálculo e geração ficam na Engine.
 */
export default function EventChoicePanel() {
  const pendingEvent = useGameStore((s) => s.pendingEvent)
  const lastEventResult = useGameStore((s) => s.lastEventResult)
  const story = useGameStore((s) => s.story)
  const resolveEventChoice = useGameStore((s) => s.resolveEventChoice)

  const view = gameService.getStoryView({ story, pendingEvent })

  if (!pendingEvent && !lastEventResult) {
    if (!view.counts.open && !view.counts.resolved) return null
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Story Engine
        </p>
        <p className="mt-1 text-sm text-slate-600">
          {view.counts.open} cadeia(s) aberta(s) · {view.counts.resolved}{' '}
          resolvida(s) · {view.counts.flags} flag(s) na memória.
        </p>
      </div>
    )
  }

  if (!pendingEvent && lastEventResult) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
          História resolvida — {lastEventResult.categoria}
        </p>
        <p className="mt-1 text-sm font-semibold text-navy">
          {lastEventResult.choiceLabel}
        </p>
        {lastEventResult.continuation ? (
          <p className="mt-2 text-xs text-emerald-800/80">
            {lastEventResult.continuation}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(lastEventResult.deltas || {})
            .filter(([, v]) => v)
            .map(([key, value]) => (
              <span
                key={key}
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  value > 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {key} {formatEffect(key, value)}
              </span>
            ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-court/25 bg-white p-5 shadow-md shadow-court/5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-court">
          Story Engine — {pendingEvent.categoriaLabel}
        </p>
        <div className="flex flex-wrap gap-2">
          {pendingEvent.isContinuation ? (
            <Badge tone="blue">Continuação</Badge>
          ) : (
            <Badge tone="neutral">Nova cadeia</Badge>
          )}
          <Badge tone="dark">
            Cap. {(pendingEvent.stage ?? 0) + 1}/{pendingEvent.maxStages ?? 1}
          </Badge>
          <span className="rounded-full bg-court/10 px-2 py-0.5 text-[10px] font-bold uppercase text-court">
            Escolha obrigatória
          </span>
        </div>
      </div>

      <h3 className="font-display text-xl font-bold text-navy">
        {pendingEvent.title ?? pendingEvent.texto}
      </h3>

      {pendingEvent.context ? (
        <p className="mt-2 text-sm text-slate-600">{pendingEvent.context}</p>
      ) : null}

      {pendingEvent.description ? (
        <p className="mt-2 text-sm text-slate-500">{pendingEvent.description}</p>
      ) : null}

      {pendingEvent.continuation ? (
        <p className="mt-3 text-xs font-medium text-court/90">
          {pendingEvent.continuation}
        </p>
      ) : null}

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {pendingEvent.escolhas.map((choice) => (
          <button
            key={choice.id}
            type="button"
            onClick={() => resolveEventChoice(choice.id)}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-navy/30 hover:bg-navy/5"
          >
            <span className="block text-sm font-bold text-navy">
              {choice.label}
            </span>
            {choice.texto ? (
              <span className="mt-1 block text-[11px] text-slate-500">
                {choice.texto}
              </span>
            ) : null}
            <span className="mt-2 flex flex-wrap gap-1">
              {Object.entries(choice.efeitos || {}).map(([key, value]) => (
                <span
                  key={key}
                  className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200"
                >
                  {key} {formatEffect(key, value)}
                </span>
              ))}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
