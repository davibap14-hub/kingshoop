import { AWARD_LABELS } from '../../data/season/constants'
import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'
import { Badge, Card, CardHeader } from '../ui'

const PHASE_LABELS = {
  regular: 'Temporada regular',
  play_in: 'Play-In',
  playoffs: 'Playoffs',
  finals: 'Finais da NBA',
  awards: 'Premiações',
  offseason: 'Offseason',
}

/**
 * Interface da Season Engine — apenas exibe dados retornados.
 */
export default function SeasonPanel() {
  const season = useGameStore((s) => s.season)
  const currentTeamId = useGameStore((s) => s.currentTeamId)
  const currentWeek = useGameStore((s) => s.currentWeek)
  const weekEffects = useGameStore((s) => s.weekEffects)

  if (!season) return null

  const view = gameService.getSeasonView({
    season,
    currentTeamId,
    currentWeek,
  })
  const tables = gameService.getConferenceTables(season.standings)
  const weekResults = weekEffects?.season?.weekResults ?? season.weekResults ?? []
  const record = view.teamRecord

  return (
    <Card id="temporada" padding="lg" className="animate-fade-up">
      <CardHeader
        subtitle="Season Engine"
        title={`Temporada ${season.seasonNumber}`}
        action={
          <Badge tone="blue">
            {PHASE_LABELS[season.phase] ?? season.phase}
          </Badge>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <p className="font-semibold text-navy">
          Seu time: {record.wins}-{record.losses}
          <span className="ml-2 text-xs font-normal text-slate-500">
            Seq. {record.streakLabel}
          </span>
        </p>
        {season.champion && (
          <Badge tone="dark">Campeão: {season.champion}</Badge>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {['East', 'West'].map((conf) => (
          <div
            key={conf}
            className="rounded-lg border border-slate-100 bg-slate-50 p-3"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Conferência {conf === 'East' ? 'Leste' : 'Oeste'}
            </p>
            <table className="mt-2 w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400">
                  <th className="py-1 font-semibold">#</th>
                  <th className="py-1 font-semibold">Time</th>
                  <th className="py-1 font-semibold">V-D</th>
                  <th className="py-1 font-semibold">Seq</th>
                </tr>
              </thead>
              <tbody>
                {(tables[conf] ?? []).map((row) => (
                  <tr
                    key={row.teamId}
                    className={
                      row.teamId === currentTeamId
                        ? 'font-bold text-accent'
                        : 'text-slate-700'
                    }
                  >
                    <td className="py-1">{row.seed}</td>
                    <td className="py-1">{row.short}</td>
                    <td className="py-1 tabular-nums">
                      {row.wins}-{row.losses}
                    </td>
                    <td className="py-1">{row.streakLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-100 bg-white p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Jogos da semana
          </p>
          {weekResults.length === 0 ? (
            <p className="mt-2 text-xs text-slate-500">
              Nenhum jogo nesta fase / semana.
            </p>
          ) : (
            <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
              {weekResults.map((g) => (
                <li key={g.gameId}>
                  <span className="font-semibold text-navy">
                    {g.homeShort} {g.homeScore}–{g.awayScore} {g.awayShort}
                  </span>
                  {g.label ? (
                    <span className="text-slate-400"> · {g.label}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-slate-100 bg-white p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Lesões na liga
          </p>
          {(season.injuries ?? []).length === 0 ? (
            <p className="mt-2 text-xs text-slate-500">Nenhuma lesão ativa.</p>
          ) : (
            <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
              {season.injuries.map((inj) => (
                <li key={inj.id}>
                  {inj.playerName} ({inj.teamShort}) — {inj.label} ·{' '}
                  {inj.weeksRemaining} sem.
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {(season.playoffs?.finals || season.awards) && (
        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3">
          {season.playoffs?.finals && (
            <p className="text-sm font-semibold text-navy">
              Finais:{' '}
              {season.playoffs.finals.homeScore != null
                ? `${season.playoffs.finals.homeScore}–${season.playoffs.finals.awayScore}`
                : '—'}
              {season.champion ? ` · Campeão ${season.champion}` : ''}
            </p>
          )}
          {season.awards && (
            <ul className="mt-2 flex flex-wrap gap-2">
              {Object.entries(season.awards)
                .filter(([key, val]) => AWARD_LABELS[key] && val?.teamShort)
                .map(([key, val]) => (
                  <Badge key={key} tone="neutral">
                    {val.label}: {val.teamShort}
                  </Badge>
                ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  )
}
