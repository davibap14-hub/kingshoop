import { ATTRIBUTE_KEYS } from '../data/constants'
import CareerPanel from './CareerPanel'
import StatCard from './StatCard'
import WeekControls from './WeekControls'
import { useGameStore } from '../store/useGameStore'

export default function Dashboard() {
  const playerName = useGameStore((s) => s.playerName)
  const getOverall = useGameStore((s) => s.getOverall)
  const getCurrentTeam = useGameStore((s) => s.getCurrentTeam)
  const team = getCurrentTeam()

  return (
    <div className="min-h-screen bg-ice text-slate-800">
      <header className="border-b border-slate-200/90 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy font-display text-sm font-black tracking-wide text-white">
              TF
            </div>
            <div>
              <h1 className="font-display text-xl font-extrabold tracking-[0.08em] text-navy sm:text-2xl">
                THE FENÔMENO
              </h1>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-court">
                NBA Career Mode
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="font-display text-lg font-bold text-navy">{playerName}</p>
            <p className="text-xs text-slate-500">
              {team.short} · OVR {getOverall()}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <WeekControls />
        <CareerPanel />

        <section>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="font-display text-xl font-bold text-navy">Atributos</h2>
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
      </main>
    </div>
  )
}
