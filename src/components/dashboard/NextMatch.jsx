import { Link } from 'react-router-dom'
import { Badge, Card, CardHeader } from '../ui'

/**
 * Card da próxima partida — reutilizável.
 */
export default function NextMatch({
  homeTeam,
  awayTeam,
  week,
  venue = 'Casa',
  tipOff = '19:30',
  className = '',
}) {
  return (
    <Card className={`animate-fade-up ${className}`}>
      <CardHeader
        subtitle="Próxima partida"
        title="Matchup"
        action={<Badge tone="blue">Semana {week}</Badge>}
      />

      <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-4 py-5">
        <TeamBlock team={homeTeam} align="left" />
        <div className="text-center">
          <p className="font-display text-2xl font-black text-slate-300">VS</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {venue}
          </p>
        </div>
        <TeamBlock team={awayTeam} align="right" />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          Tip-off · <span className="font-semibold text-navy">{tipOff}</span>
        </p>
        <Link
          to="/match-center"
          className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-blue-700 no-underline"
        >
          Match Center
        </Link>
      </div>
    </Card>
  )
}

function TeamBlock({ team, align }) {
  return (
    <div className={align === 'right' ? 'text-right' : 'text-left'}>
      <p className="font-display text-2xl font-extrabold text-navy">
        {team?.short ?? '---'}
      </p>
      <p className="max-w-[7rem] truncate text-xs text-slate-500">
        {team?.name ?? 'A definir'}
      </p>
    </div>
  )
}
