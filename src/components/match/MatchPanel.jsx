import { TEAMS } from '../../data/teams'
import { useMatchStore } from '../../store/useMatchStore'
import MatchResult from './MatchResult'

/**
 * Painel da Interface — dispara a Engine e só renderiza o resultado.
 */
export default function MatchPanel() {
  const homeTeamId = useMatchStore((s) => s.homeTeamId)
  const awayTeamId = useMatchStore((s) => s.awayTeamId)
  const lastMatch = useMatchStore((s) => s.lastMatch)
  const isSimulating = useMatchStore((s) => s.isSimulating)
  const setHomeTeam = useMatchStore((s) => s.setHomeTeam)
  const setAwayTeam = useMatchStore((s) => s.setAwayTeam)
  const simulate = useMatchStore((s) => s.simulate)

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Match Engine
            </p>
            <h2 className="font-display text-3xl font-extrabold text-navy">
              Simulação por Posses
            </h2>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              Ataque, defesa, fadiga, química, overall, momento e mando de
              quadra — a Interface só exibe o resultado.
            </p>
          </div>

          <button
            type="button"
            onClick={simulate}
            disabled={isSimulating || homeTeamId === awayTeamId}
            className="rounded-lg bg-navy px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-navy/20 transition hover:bg-navy-hover disabled:opacity-50"
          >
            {isSimulating ? 'Simulando…' : 'Simular Partida'}
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Casa
            </span>
            <select
              value={homeTeamId}
              onChange={(e) => setHomeTeam(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-navy outline-none focus:border-court focus:ring-2 focus:ring-court/20"
            >
              {TEAMS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.short} — {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Fora
            </span>
            <select
              value={awayTeamId}
              onChange={(e) => setAwayTeam(e.target.value)}
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
      </div>

      <MatchResult result={lastMatch} />
    </div>
  )
}
