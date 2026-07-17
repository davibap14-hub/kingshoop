import { useGame } from '../hooks/useGame'

export default function LineupPanel() {
  const {
    homeLineup,
    awayLineup,
    homeMetrics,
    activePositions,
    gameStarted,
  } = useGame()

  if (!homeLineup) {
    return (
      <section className="flex w-full min-w-0 flex-col justify-between overflow-y-auto border-l border-white/10 bg-card-dark/80 p-4 backdrop-blur-sm sm:p-5 lg:w-1/4">
        <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
          <p className="text-xs">
            Faça o draft para revelar as métricas do elenco.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="flex w-full min-w-0 flex-col justify-between overflow-y-auto border-l border-white/10 bg-card-dark/80 p-4 backdrop-blur-sm sm:p-5 lg:w-1/4">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-[0.14em] text-slate-400">
            Métricas do Seu Time
          </h2>
          <div className="grid grid-cols-2 gap-2 text-center">
            <Metric label="Ataque" value={homeMetrics.att} tone="orange" />
            <Metric label="Defesa" value={homeMetrics.def} tone="green" />
            <Metric label="Geral" value={homeMetrics.ovr} tone="green" />
            <Metric label="Química" value={`${homeMetrics.chem}%`} tone="gold" />
          </div>
        </div>

        <div>
          <h2 className="mb-2.5 font-display text-sm font-bold uppercase tracking-[0.14em] text-slate-400">
            Starting Five
          </h2>
          <div className="flex flex-col gap-2">
            {Object.entries(homeLineup).map(([pos, player]) => {
              const onCourt = activePositions.includes(pos)
              return (
                <div
                  key={pos}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2.5 transition-all ${
                    onCourt
                      ? 'border-white/10 bg-panel opacity-100 shadow-pf-sm'
                      : 'border-white/5 bg-card-dark opacity-45'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-kings-green/15 font-display text-xs font-black text-kings-green">
                      {pos}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-200">
                        {player?.name ?? 'Vazio'}
                      </p>
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                        {!onCourt && gameStarted
                          ? 'No banco'
                          : (player?.archetype ?? '')}
                      </span>
                    </div>
                  </div>
                  <span className="rounded-lg border border-white/10 bg-pf-muted px-2 py-0.5 font-display text-sm font-bold text-slate-200">
                    {player?.overall ?? '—'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {awayLineup && (
          <div className="border-t border-white/10 pt-4">
            <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-[0.14em] text-slate-400">
              Elenco Rival
            </h2>
            <div className="grid grid-cols-5 gap-1 rounded-xl border border-white/10 bg-panel p-2 text-center shadow-pf-sm">
              {Object.entries(awayLineup).map(([pos, player]) => (
                <div key={pos}>
                  <span className="block text-[10px] font-bold text-slate-500">
                    {pos}
                  </span>
                  <span className="block font-display text-sm font-black leading-tight text-kings-green">
                    {player?.overall ?? '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function Metric({ label, value, tone }) {
  const tones = {
    orange: 'text-court-orange',
    green: 'text-kings-green',
    gold: 'text-kings-gold',
  }

  return (
    <div className="rounded-xl border border-white/10 bg-panel p-2 shadow-pf-sm">
      <span className="block text-[10px] font-semibold uppercase text-slate-400">
        {label}
      </span>
      <span
        className={`font-display text-2xl font-extrabold ${tones[tone] ?? tones.green}`}
      >
        {value}
      </span>
    </div>
  )
}
