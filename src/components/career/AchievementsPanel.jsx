import { useState } from 'react'
import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'
import { Badge, Card, CardHeader, ProgressBar } from '../ui'

/**
 * Interface da Achievement Engine — somente leitura.
 */
export default function AchievementsPanel() {
  const achievements = useGameStore((s) => s.achievements)
  const weekEffects = useGameStore((s) => s.weekEffects)
  const [category, setCategory] = useState('all')

  const view = gameService.getAchievementsView({ achievements })
  const summary = weekEffects?.achievements

  const display =
    category === 'all'
      ? view.inProgress
      : (view.byCategory[category]?.items ?? [])
          .slice()
          .sort((a, b) => {
            const order = { unlocked: 0, in_progress: 1, locked: 2 }
            return (order[a.status] ?? 9) - (order[b.status] ?? 9)
          })
          .slice(0, 20)

  return (
    <Card id="conquistas" padding="lg" className="animate-fade-up">
      <CardHeader
        subtitle="Achievement Engine"
        title="Conquistas"
        action={
          <Badge tone="blue">
            {view.unlockedCount}/{view.total}
          </Badge>
        }
      />

      <p className="mb-3 text-sm text-slate-500">
        Mais de 200 conquistas em 8 categorias. Progresso e status persistidos
        no Save Engine.
      </p>

      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
          <span>Progresso geral</span>
          <span className="tabular-nums font-semibold text-navy">
            {view.percent}%
          </span>
        </div>
        <ProgressBar value={view.percent} />
      </div>

      {summary?.newlyUnlocked?.length ? (
        <p className="mb-3 text-xs text-emerald-700">
          Última semana: {summary.newlyUnlocked.length} nova(s) —{' '}
          {summary.newlyUnlocked.map((a) => a.name).join(', ')}.
        </p>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-1.5">
        <FilterChip
          active={category === 'all'}
          onClick={() => setCategory('all')}
          label="Em progresso"
        />
        {view.categories.map((c) => (
          <FilterChip
            key={c.id}
            active={category === c.id}
            onClick={() => setCategory(c.id)}
            label={`${c.label} (${c.unlocked}/${c.total})`}
          />
        ))}
      </div>

      {display.length === 0 ? (
        <p className="text-sm text-slate-500">
          {category === 'all'
            ? 'Nenhuma conquista em progresso — avance semanas para evoluir.'
            : 'Nenhuma conquista nesta categoria ainda.'}
        </p>
      ) : (
        <ul className="space-y-2">
          {display.map((a) => (
            <li
              key={a.id}
              className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-navy">{a.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{a.description}</p>
                </div>
                <Badge
                  tone={
                    a.status === 'unlocked'
                      ? 'success'
                      : a.status === 'in_progress'
                        ? 'blue'
                        : 'neutral'
                  }
                >
                  {view.statusLabels[a.status] ?? a.status}
                </Badge>
              </div>
              <div className="mt-2">
                <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-slate-400">
                  <span>
                    {a.progress}/{a.target}
                  </span>
                  <span>{a.percent}%</span>
                </div>
                <ProgressBar value={a.percent} />
              </div>
              {a.reward && Object.keys(a.reward).length ? (
                <p className="mt-1.5 text-[11px] text-slate-500">
                  Recompensa:{' '}
                  {Object.entries(a.reward)
                    .map(([k, v]) => `${k} ${v > 0 ? '+' : ''}${v}`)
                    .join(' · ')}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function FilterChip({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition',
        active
          ? 'bg-navy text-white'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
