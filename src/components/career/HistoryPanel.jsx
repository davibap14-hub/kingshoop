import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'
import { Badge, Card, CardHeader } from '../ui'

/**
 * Interface do History Engine — arquivo permanente da liga.
 */
export default function HistoryPanel() {
  const leagueHistory = useGameStore((s) => s.leagueHistory)
  const weekEffects = useGameStore((s) => s.weekEffects)

  const view = gameService.getHistoryView({ leagueHistory })
  const summary = weekEffects?.historyEngine

  return (
    <Card id="historia" padding="lg" className="animate-fade-up">
      <CardHeader
        subtitle="History Engine"
        title="Arquivo da liga"
        action={
          <Badge tone="blue">
            {view.seasonsCount} temporada(s)
          </Badge>
        }
      />

      {view.seasonsCount === 0 && !summary?.recordsSet ? (
        <p className="text-sm text-slate-500">
          O arquivo permanente guarda MVPs, campeões, líderes, recordes,
          Hall da Fama, aposentadorias e premiações. Nada se perde entre
          temporadas — avance até o fim de uma temporada para arquivar.
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Campeões" empty="Aguardando finais.">
          {view.champions.slice(0, 6).map((c) => (
            <li key={`champ-${c.season}`} className="text-sm text-slate-700">
              <span className="font-semibold text-navy">T{c.season}</span>
              {' · '}
              {c.teamShort ?? c.name ?? c.teamId}
              {c.detail ? (
                <span className="text-slate-500"> ({c.detail})</span>
              ) : null}
            </li>
          ))}
        </Section>

        <Section title="MVPs" empty="Aguardando premiações.">
          {view.mvps.slice(0, 6).map((m) => (
            <li key={`mvp-${m.season}`} className="text-sm text-slate-700">
              <span className="font-semibold text-navy">T{m.season}</span>
              {' · '}
              {m.teamShort ?? m.teamId}
              {m.detail ? (
                <span className="text-slate-500"> ({m.detail})</span>
              ) : null}
            </li>
          ))}
        </Section>

        <Section title="Premiações" empty="Nenhuma ainda.">
          {view.awards.slice(0, 8).map((a) => (
            <li
              key={`award-${a.season}-${a.type}`}
              className="text-sm text-slate-700"
            >
              <Badge tone="neutral">{a.label}</Badge>{' '}
              <span className="font-semibold text-navy">T{a.season}</span>
              {' · '}
              {a.teamShort ?? a.teamId}
              {a.detail ? (
                <span className="text-slate-500"> — {a.detail}</span>
              ) : null}
            </li>
          ))}
        </Section>

        <Section title="Recordes" empty="Sem recordes registrados.">
          {view.records.map((r) => (
            <li key={r.key} className="text-sm text-slate-700">
              <span className="font-semibold text-navy">{r.label}</span>
              {': '}
              {r.entry.value}
              {r.entry.note ? (
                <span className="text-slate-500"> — {r.entry.note}</span>
              ) : null}
              {r.entry.season != null ? (
                <span className="text-slate-400"> (T{r.entry.season})</span>
              ) : null}
            </li>
          ))}
        </Section>

        <Section title="Líderes (últimas temporadas)" empty="Sem líderes.">
          {view.leaders.slice(0, 4).map((l) => (
            <li key={`lead-${l.season}`} className="text-sm text-slate-700">
              <span className="font-semibold text-navy">T{l.season}</span>
              {l.wins
                ? ` · Vitórias: ${l.wins.teamShort} (${l.wins.wins}-${l.wins.losses})`
                : null}
              {l.gameMvps?.[0]
                ? ` · MVP jogos: ${l.gameMvps[0].name} (${l.gameMvps[0].count})`
                : null}
            </li>
          ))}
        </Section>

        <Section title="Estatísticas arquivadas" empty="Sem estatísticas.">
          {view.seasons.slice(0, 4).map((s) => (
            <li key={`stat-${s.season}`} className="text-sm text-slate-700">
              <span className="font-semibold text-navy">T{s.season}</span>
              {s.seasonStats
                ? ` · ${s.seasonStats.gamesPlayed} jogos · média ${s.seasonStats.averageScore} pts`
                : null}
              {s.champion
                ? ` · Campeão ${s.champion.teamShort ?? s.champion.teamId}`
                : null}
            </li>
          ))}
        </Section>

        <Section title="Hall da Fama" empty="Nenhum induzido ainda.">
          {view.hallOfFame.slice(0, 8).map((h) => (
            <li key={`hof-${h.playerId}`} className="text-sm text-slate-700">
              <span className="font-semibold text-navy">{h.name}</span>
              {h.classificationLabel ? (
                <>
                  {' '}
                  <Badge tone="blue">{h.classificationLabel}</Badge>
                </>
              ) : null}
              {h.score != null ? (
                <span className="text-slate-500"> · {h.score}</span>
              ) : null}
              {h.inductedSeason != null ? ` · T${h.inductedSeason}` : null}
              {h.reason ? (
                <span className="text-slate-500"> — {h.reason}</span>
              ) : null}
            </li>
          ))}
        </Section>

        <Section title="Votações HOF" empty="Nenhuma votação ainda.">
          {(view.hofBallots ?? []).slice(0, 8).map((b) => (
            <li
              key={`ballot-${b.playerId}-${b.evaluatedSeason ?? ''}`}
              className="text-sm text-slate-700"
            >
              <span className="font-semibold text-navy">{b.name}</span>
              {b.classificationLabel ? (
                <>
                  {' '}
                  <Badge tone="neutral">{b.classificationLabel}</Badge>
                </>
              ) : null}
              {b.score != null ? (
                <span className="text-slate-500"> · {b.score}</span>
              ) : null}
            </li>
          ))}
        </Section>

        <Section title="Aposentadorias" empty="Nenhuma registrada.">
          {view.retirements.slice(0, 8).map((r) => (
            <li
              key={`ret-${r.playerId}-${r.season}`}
              className="text-sm text-slate-700"
            >
              <span className="font-semibold text-navy">{r.name}</span>
              {' · '}
              T{r.season}
              {r.age != null ? ` · ${r.age} anos` : null}
              {r.reason ? (
                <span className="text-slate-500"> — {r.reason}</span>
              ) : null}
            </li>
          ))}
        </Section>
      </div>
    </Card>
  )
}

function Section({ title, empty, children }) {
  const items = Array.isArray(children)
    ? children.filter(Boolean)
    : children
      ? [children]
      : []
  const hasItems = items.length > 0

  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
      <h4 className="mb-2 font-display text-sm font-bold text-navy">{title}</h4>
      {hasItems ? (
        <ul className="space-y-1.5">{children}</ul>
      ) : (
        <p className="text-xs text-slate-500">{empty}</p>
      )}
    </div>
  )
}
