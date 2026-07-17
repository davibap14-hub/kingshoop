import { useGameStore } from '../../store/useGameStore'

function formatEffect(key, value) {
  const sign = value > 0 ? '+' : ''
  if (key === 'dinheiro') {
    return `${sign}$${Math.abs(value).toLocaleString('en-US')}`
  }
  return `${sign}${value}`
}

export default function EventChoicePanel() {
  const pendingEvent = useGameStore((s) => s.pendingEvent)
  const lastEventResult = useGameStore((s) => s.lastEventResult)
  const resolveEventChoice = useGameStore((s) => s.resolveEventChoice)

  if (!pendingEvent && !lastEventResult) return null

  if (!pendingEvent && lastEventResult) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Evento resolvido — {lastEventResult.categoria}
        </p>
        <p className="mt-1 text-sm font-semibold text-navy">
          {lastEventResult.choiceLabel}
        </p>
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
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-court">
          Evento — {pendingEvent.categoriaLabel}
        </p>
        <span className="rounded-full bg-court/10 px-2 py-0.5 text-[10px] font-bold uppercase text-court">
          Escolha obrigatória
        </span>
      </div>

      <h3 className="font-display text-xl font-bold text-navy">
        {pendingEvent.texto}
      </h3>

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
