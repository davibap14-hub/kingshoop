import { useGameStore } from '../../store/useGameStore'
import { Badge, Card, CardHeader } from '../ui'

const TONE = {
  positive: 'blue',
  negative: 'danger',
  neutral: 'neutral',
}

/**
 * Interface do News Engine — manchetes da semana.
 */
export default function NewsPanel() {
  const weekEffects = useGameStore((s) => s.weekEffects)
  const weekNews = useGameStore((s) => s.weekNews)
  const newsFeed = useGameStore((s) => s.newsFeed)

  const items =
    weekEffects?.weekNews?.length > 0
      ? weekEffects.weekNews
      : weekNews?.length > 0
        ? weekNews
        : (newsFeed ?? []).slice(0, 8)

  return (
    <Card id="news" padding="lg" className="animate-fade-up">
      <CardHeader
        subtitle="News Engine"
        title="Manchetes da semana"
        action={
          <Badge tone="blue">
            {weekEffects?.news?.count ?? items.length} notícia(s)
          </Badge>
        }
      />

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">
          Avance uma semana para gerar notícias automáticas da liga.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li
              key={n.id}
              className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={TONE[n.impact?.tone] ?? 'neutral'}>
                  {n.categoryLabel ?? n.category}
                </Badge>
                {n.aboutPlayerTeam ? (
                  <Badge tone="blue">Seu time</Badge>
                ) : null}
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  S{n.seasonNumber} · Sem. {n.week}
                </span>
              </div>
              <h4 className="mt-1.5 font-display text-sm font-bold text-navy">
                {n.title}
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                {n.summary}
              </p>
              {n.impact?.description ? (
                <p className="mt-1.5 text-[11px] text-slate-500">
                  Impacto: {n.impact.description}
                  {n.impact.magnitude != null
                    ? ` · magnitude ${n.impact.magnitude}/5`
                    : ''}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
