import { ATTRIBUTE_KEYS } from '../../data/constants/attributes'
import CareerPanel from './CareerPanel'
import EventChoicePanel from './EventChoicePanel'
import ProgressionPanel from './ProgressionPanel'
import WeekControls from './WeekControls'
import StatCard from '../stats/StatCard'
import { useCareerSnapshot } from '../../hooks/useCareer'

export default function CareerDashboard() {
  const { playerName, team, overall } = useCareerSnapshot()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Dashboard
          </p>
          <h2 className="font-display text-2xl font-extrabold text-navy">
            {playerName}
          </h2>
          <p className="text-sm text-slate-500">
            {team.short} · OVR {overall}
          </p>
        </div>
      </div>

      <EventChoicePanel />
      <WeekControls />
      <ProgressionPanel />
      <CareerPanel />

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h3 className="font-display text-xl font-bold text-navy">Atributos</h3>
          <p className="text-xs text-slate-500">
            Treine e evolua ao longo das semanas
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ATTRIBUTE_KEYS.map((key) => (
            <StatCard key={key} statKey={key} />
          ))}
        </div>
      </section>
    </div>
  )
}
