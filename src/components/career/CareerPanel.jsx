import { CAREER_VARIABLES } from '../../data/constants/career'
import { useGameStore } from '../../store/useGameStore'

function formatValue(key, value) {
  if (key === 'dinheiro') {
    return `$${Number(value).toLocaleString('en-US')}`
  }
  const unit = CAREER_VARIABLES[key]?.unit
  if (unit === '%') return `${value}%`
  return String(value)
}

const TONE = {
  energia: 'from-emerald-500 to-teal-500',
  dinheiro: 'from-amber-500 to-orange-400',
  fama: 'from-sky-500 to-blue-600',
  quimica: 'from-rose-500 to-red-500',
}

export default function CareerPanel() {
  const career = useGameStore((s) => s.careerVariables)

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Object.keys(CAREER_VARIABLES).map((key) => {
        const meta = CAREER_VARIABLES[key]
        const value = career[key]
        const hasBar = meta.max != null
        const pct = hasBar ? Math.min(100, (value / meta.max) * 100) : null

        return (
          <div
            key={key}
            className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {meta.label}
            </p>
            <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-navy">
              {formatValue(key, value)}
            </p>
            {pct != null && (
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${TONE[key]} transition-all`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
