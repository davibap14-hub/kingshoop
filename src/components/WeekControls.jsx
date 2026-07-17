import { ARCHETYPE_LIST, TEAMS } from '../data/constants'
import { useGameStore } from '../store/useGameStore'

export default function WeekControls() {
  const currentWeek = useGameStore((s) => s.currentWeek)
  const currentSeason = useGameStore((s) => s.currentSeason)
  const currentTeamId = useGameStore((s) => s.currentTeamId)
  const archetypeId = useGameStore((s) => s.archetypeId)
  const playerName = useGameStore((s) => s.playerName)
  const lastEvent = useGameStore((s) => s.lastEvent)
  const advanceWeek = useGameStore((s) => s.advanceWeek)
  const setArchetype = useGameStore((s) => s.setArchetype)
  const setTeam = useGameStore((s) => s.setTeam)
  const setPlayerName = useGameStore((s) => s.setPlayerName)
  const resetCareer = useGameStore((s) => s.resetCareer)
  const getOverall = useGameStore((s) => s.getOverall)

  const team = TEAMS.find((t) => t.id === currentTeamId)

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Temporada {currentSeason}
          </p>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-navy">
            Semana {currentWeek}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {team?.name} · OVR {getOverall()}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => resetCareer(archetypeId)}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 transition hover:bg-slate-50"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={advanceWeek}
            className="rounded-lg bg-navy px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-navy/20 transition hover:bg-navy-hover"
          >
            Avançar Semana
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Nome
          </span>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-navy outline-none focus:border-court focus:ring-2 focus:ring-court/20"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Arquétipo
          </span>
          <select
            value={archetypeId}
            onChange={(e) => setArchetype(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-navy outline-none focus:border-court focus:ring-2 focus:ring-court/20"
          >
            {ARCHETYPE_LIST.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Time
          </span>
          <select
            value={currentTeamId}
            onChange={(e) => setTeam(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-navy outline-none focus:border-court focus:ring-2 focus:ring-court/20"
          >
            {TEAMS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.short} — {t.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Último evento
        </p>
        <p className="mt-1 text-sm text-slate-700">{lastEvent}</p>
      </div>
    </div>
  )
}
