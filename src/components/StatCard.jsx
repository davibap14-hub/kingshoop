import { ATTRIBUTES } from '../data/constants'
import { useGameStore } from '../store/useGameStore'

export default function StatCard({ statKey }) {
  const value = useGameStore((s) => s.playerStats[statKey])
  const updateStat = useGameStore((s) => s.updateStat)
  const meta = ATTRIBUTES[statKey]

  const pct = Math.min(100, Math.max(0, value))

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {meta.short}
          </p>
          <h3 className="font-display text-lg font-bold text-navy">{meta.label}</h3>
        </div>
        <span className="font-display text-3xl font-extrabold tabular-nums text-navy">
          {value}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-navy to-court transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-xs leading-relaxed text-slate-500">{meta.description}</p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => updateStat(statKey, -1)}
          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
        >
          −1
        </button>
        <button
          type="button"
          onClick={() => updateStat(statKey, 1)}
          className="flex-1 rounded-lg border border-navy/15 bg-navy/5 py-1.5 text-xs font-semibold text-navy transition hover:bg-navy/10"
        >
          +1
        </button>
      </div>
    </div>
  )
}
