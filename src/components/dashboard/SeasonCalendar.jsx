import { WEEKS_PER_SEASON } from '../../data/constants/career'
import { Badge, Card, CardHeader } from '../ui'

/**
 * Calendário da temporada (semanas) — reutilizável.
 */
export default function SeasonCalendar({
  currentWeek = 1,
  currentSeason = 1,
  weeks = WEEKS_PER_SEASON,
  className = '',
}) {
  const items = Array.from({ length: weeks }, (_, i) => i + 1)

  return (
    <Card id="calendario" className={`animate-fade-up ${className}`}>
      <CardHeader
        subtitle="Calendário"
        title={`Temporada ${currentSeason}`}
        action={<Badge tone="dark">Semana {currentWeek}</Badge>}
      />

      <div className="grid grid-cols-[repeat(8,minmax(0,1fr))] gap-1.5 sm:grid-cols-[repeat(13,minmax(0,1fr))]">
        {items.map((week) => {
          const isCurrent = week === currentWeek
          const isPast = week < currentWeek
          return (
            <div
              key={week}
              title={`Semana ${week}`}
              className={[
                'flex aspect-square items-center justify-center rounded-md text-[10px] font-bold tabular-nums transition',
                isCurrent
                  ? 'bg-accent text-white shadow-sm'
                  : isPast
                    ? 'bg-slate-100 text-slate-400'
                    : 'bg-white text-slate-600 ring-1 ring-slate-200',
              ].join(' ')}
            >
              {week}
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        <LegendDot className="bg-accent" label="Atual" />
        <LegendDot className="bg-slate-100 ring-1 ring-slate-200" label="Futura" />
        <LegendDot className="bg-slate-100" label="Passada" />
      </div>
    </Card>
  )
}

function LegendDot({ className, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-sm ${className}`} />
      {label}
    </span>
  )
}
