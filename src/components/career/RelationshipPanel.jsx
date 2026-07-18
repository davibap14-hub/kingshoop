import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'
import { Badge, Card, CardHeader, ProgressBar } from '../ui'

const TIER_TONE = {
  hostile: 'danger',
  cold: 'danger',
  neutral: 'neutral',
  good: 'blue',
  excellent: 'blue',
}

/**
 * Interface da Relationship Engine — somente leitura.
 */
export default function RelationshipPanel() {
  const relationships = useGameStore((s) => s.relationships)
  const currentWeek = useGameStore((s) => s.currentWeek)
  const currentSeason = useGameStore((s) => s.currentSeason)
  const playingTimeShare = useGameStore((s) => s.playingTimeShare)
  const weekEffects = useGameStore((s) => s.weekEffects)

  const view = gameService.getRelationshipView({
    relationships,
    currentWeek,
    currentSeason,
  })

  return (
    <Card id="relacionamentos" padding="lg" className="animate-fade-up">
      <CardHeader
        subtitle="Relationship Engine"
        title="Relacionamentos"
        action={
          <Badge tone="blue">Média {view.average}</Badge>
        }
      />

      <p className="mb-3 text-sm text-slate-500">
        Treinador, GM, companheiros, torcida, imprensa, patrocinadores e agente
        (0–100). Cada ação da semana altera um ou mais vínculos.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {view.entries.map((entry) => (
          <div
            key={entry.id}
            className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-navy">{entry.label}</p>
              <Badge tone={TIER_TONE[entry.tier] ?? 'neutral'}>
                {entry.tierLabel}
              </Badge>
            </div>
            <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-ink">
              {entry.value}
            </p>
            <ProgressBar value={entry.value} className="mt-2" />
            <p className="mt-1.5 text-[11px] leading-snug text-slate-500">
              {entry.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <EffectChip
          label="Minutos alvo"
          value={`${playingTimeShare ?? view.effects.playingTimeShare} min`}
        />
        <EffectChip
          label="Química"
          value={`${view.effects.chemistryBonus >= 0 ? '+' : ''}${view.effects.chemistryBonus}`}
        />
        <EffectChip
          label="XP"
          value={`×${view.effects.xpMultiplier.toFixed(2)}`}
        />
        <EffectChip
          label="Treino"
          value={`×${view.effects.trainingMultiplier.toFixed(2)}`}
        />
      </div>

      {weekEffects?.relationships?.applied ? (
        <p className="mt-3 text-xs text-slate-500">
          Última semana:{' '}
          {Object.entries(weekEffects.relationships.applied)
            .map(([k, v]) => `${k} ${v > 0 ? '+' : ''}${v}`)
            .join(' · ') || 'sem mudanças'}
        </p>
      ) : null}
    </Card>
  )
}

function EffectChip({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="text-sm font-semibold text-navy">{value}</p>
    </div>
  )
}
