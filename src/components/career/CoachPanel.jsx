import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'
import { Badge, Card, CardHeader, ProgressBar } from '../ui'

/**
 * Interface da Coach Engine — somente leitura.
 */
export default function CoachPanel() {
  const gm = useGameStore((s) => s.gm)
  const currentTeamId = useGameStore((s) => s.currentTeamId)
  const currentSeason = useGameStore((s) => s.currentSeason)
  const weekEffects = useGameStore((s) => s.weekEffects)

  const view = gameService.getCoachView({
    gm,
    currentTeamId,
    currentSeason,
  })

  if (!view.coach) {
    return (
      <Card id="treinador" padding="lg" className="animate-fade-up">
        <CardHeader subtitle="Coach Engine" title="Treinador" />
        <p className="text-sm text-slate-500">Nenhum técnico atribuído.</p>
      </Card>
    )
  }

  return (
    <Card id="treinador" padding="lg" className="animate-fade-up">
      <CardHeader
        subtitle="Coach Engine"
        title={view.coach.name}
        action={
          <Badge tone="blue">{view.coach.preferredStyleLabel}</Badge>
        }
      />

      <p className="mb-3 text-sm text-slate-500">
        Sistema ofensivo/defensivo, rotação, confiança em jovens, rigor,
        motivação e desenvolvimento. Decide automaticamente minutos, jogadas,
        treinos e relação com atletas — sempre por pesos.
      </p>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {view.attributes.map((attr) => (
          <div
            key={attr.id}
            className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {attr.label}
            </p>
            <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-ink">
              {attr.value}
            </p>
            <ProgressBar value={attr.value} className="mt-2" />
          </div>
        ))}
      </div>

      {view.decision ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <EffectChip label="Foco semanal" value={view.decision.practiceFocus ?? '—'} />
          <EffectChip
            label="Minutos alvo"
            value={`${view.decision.minutes ?? view.effects?.playingTimeShare ?? '—'} min`}
          />
          <EffectChip label="Estilo" value={view.decision.styleLabel ?? '—'} />
          <EffectChip
            label="Relação"
            value={`${(view.decision.relationDelta ?? 0) >= 0 ? '+' : ''}${view.decision.relationDelta ?? 0}`}
          />
        </div>
      ) : (
        <p className="mt-4 text-xs text-slate-500">
          Avance uma semana para ver a decisão automática do técnico.
        </p>
      )}

      {view.effects ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <EffectChip
            label="Treino"
            value={`×${view.effects.trainingMultiplier.toFixed(2)}`}
          />
          <EffectChip
            label="XP"
            value={`×${view.effects.xpMultiplier.toFixed(2)}`}
          />
          <EffectChip
            label="Motivação"
            value={`${view.effects.motivationAura >= 0 ? '+' : ''}${view.effects.motivationAura}`}
          />
        </div>
      ) : null}

      {weekEffects?.coaches ? (
        <p className="mt-3 text-xs text-slate-500">
          Última semana: {weekEffects.coaches.coachName} · foco{' '}
          {weekEffects.coaches.practiceFocus} · {weekEffects.coaches.minutes}{' '}
          min · {weekEffects.coaches.teamsDecided} técnicos decidiram
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
