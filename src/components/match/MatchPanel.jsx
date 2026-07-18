import { Link } from 'react-router-dom'
import { TEAMS } from '../../data/teams'
import { useMatchStore } from '../../store/useMatchStore'
import { Button, Card, SectionHeader } from '../ui'
import MatchResult from './MatchResult'

/**
 * Painel da Interface — dispara a Engine e só renderiza o resultado.
 */
export default function MatchPanel() {
  const homeTeamId = useMatchStore((s) => s.homeTeamId)
  const awayTeamId = useMatchStore((s) => s.awayTeamId)
  const lastMatch = useMatchStore((s) => s.lastMatch)
  const lastPresentation = useMatchStore((s) => s.lastPresentation)
  const lastLiveFeed = useMatchStore((s) => s.lastLiveFeed)
  const isSimulating = useMatchStore((s) => s.isSimulating)
  const setHomeTeam = useMatchStore((s) => s.setHomeTeam)
  const setAwayTeam = useMatchStore((s) => s.setAwayTeam)
  const simulate = useMatchStore((s) => s.simulate)

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        eyebrow="Simulation · Presentation"
        title="Posse a posse"
        description="A Simulation Engine gera o resultado; a Presentation Engine só interpreta — sequência, destaques, narração e cues de animação."
        action={
          <div className="flex flex-wrap gap-2">
            {lastLiveFeed || lastMatch ? (
              <Link
                to="/live-match"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-navy no-underline"
              >
                Ao vivo
              </Link>
            ) : null}
            <Button
              variant="accent"
              onClick={simulate}
              disabled={isSimulating || homeTeamId === awayTeamId}
            >
              {isSimulating ? 'Simulando…' : 'Simular Partida'}
            </Button>
          </div>
        }
      />

      <Card padding="lg">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Casa
            </span>
            <select
              value={homeTeamId}
              onChange={(e) => setHomeTeam(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-navy outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
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
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-navy outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            >
              {TEAMS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.short} — {t.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      <MatchResult result={lastMatch} presentation={lastPresentation} />
    </div>
  )
}
