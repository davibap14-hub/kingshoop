import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'
import { Badge, Card, CardHeader } from '../ui'

/**
 * Interface da Hall of Fame Engine — votação na aposentadoria.
 */
export default function HallOfFamePanel() {
  const leagueHistory = useGameStore((s) => s.leagueHistory)
  const weekEffects = useGameStore((s) => s.weekEffects)

  const view = gameService.getHallOfFameView({ leagueHistory })
  const summary = weekEffects?.historyEngine

  return (
    <Card id="hall-da-fama" padding="lg" className="animate-fade-up">
      <CardHeader
        subtitle="Hall of Fame Engine"
        title="Votação permanente"
        action={
          <Badge tone="blue">
            {view.counts.inductees} induzido(s)
          </Badge>
        }
      />

      <p className="mb-3 text-sm text-slate-500">
        Na aposentadoria, a pontuação considera títulos, MVPs, All-Star,
        All-NBA, DPOY, pontos, assistências, rebotes, longevidade e
        popularidade. Classificação: Primeira votação · Hall da Fama · Não
        entrou — salva no History Engine.
      </p>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Primeira votação" value={view.counts.firstBallot} />
        <Stat label="Hall da Fama" value={view.counts.hallOfFame} />
        <Stat label="Não entrou" value={view.counts.notInducted} />
      </div>

      {summary?.ballots?.length ? (
        <p className="mb-3 text-xs text-slate-500">
          Última semana: {summary.ballots.length} votação(ões) ·{' '}
          {summary.inductees?.length ?? 0} indução(ões).
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <BallotList
          title="Induzidos"
          empty="Nenhum jogador no Hall da Fama ainda."
          items={view.inductees.slice(0, 10)}
          showScore
        />
        <BallotList
          title="Últimas votações"
          empty="Aguardando aposentadorias."
          items={view.ballots.slice(0, 10)}
          showScore
          showClass
        />
      </div>
    </Card>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-ink">
        {value}
      </p>
    </div>
  )
}

function BallotList({ title, empty, items, showScore, showClass }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
      <h4 className="mb-2 font-display text-sm font-bold text-navy">{title}</h4>
      {items.length === 0 ? (
        <p className="text-xs text-slate-500">{empty}</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((b) => (
            <li
              key={`${b.playerId}-${b.evaluatedSeason ?? b.inductedSeason ?? ''}-${b.classification ?? 'hof'}`}
              className="text-sm text-slate-700"
            >
              <span className="font-semibold text-navy">{b.name}</span>
              {showClass && b.classificationLabel ? (
                <>
                  {' '}
                  <Badge
                    tone={
                      b.classification === 'first_ballot'
                        ? 'blue'
                        : b.classification === 'hall_of_fame'
                          ? 'neutral'
                          : 'neutral'
                    }
                  >
                    {b.classificationLabel}
                  </Badge>
                </>
              ) : null}
              {showScore && b.score != null ? (
                <span className="text-slate-500"> · {b.score}</span>
              ) : null}
              {(b.inductedSeason ?? b.evaluatedSeason) != null ? (
                <span className="text-slate-400">
                  {' '}
                  (T{b.inductedSeason ?? b.evaluatedSeason})
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
