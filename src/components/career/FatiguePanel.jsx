import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'
import { Badge, Card, CardHeader, ProgressBar } from '../ui'

/**
 * Interface da Fatigue Engine — somente leitura.
 */
export default function FatiguePanel() {
  const fatigue = useGameStore((s) => s.fatigue)
  const weekEffects = useGameStore((s) => s.weekEffects)

  const view = gameService.getFatigueView({ fatigue })

  const tone =
    view.composite >= 75 ? 'danger' : view.composite >= 55 ? 'neutral' : 'blue'

  return (
    <Card id="fadiga" padding="lg" className="animate-fade-up">
      <CardHeader
        subtitle="Fatigue Engine"
        title="Fadiga avançada"
        action={<Badge tone={tone}>Carga {view.composite}</Badge>}
      />

      <p className="mb-3 text-sm text-slate-500">
        Partida, semana, temporada, minutos consecutivos, viagens, back-to-back e
        overload. Afeta velocidade, precisão, defesa, decisões, lesões, treinos
        e recuperação (descanso × staff médico × idade).
      </p>

      <div className="mb-4">
        <ProgressBar value={view.composite} />
        <p className="mt-1.5 text-xs text-slate-500">
          {view.effects.highFatigue ? 'Alta fadiga · ' : ''}
          {view.effects.overloaded ? 'Overload ativo · ' : ''}
          Risco lesão +{view.effects.injuryChanceBonus}
        </p>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        {view.components.map((c) => (
          <div key={c.key}>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {c.label}
              </p>
              <p className="text-sm font-semibold tabular-nums text-ink">
                {c.value}
              </p>
            </div>
            <ProgressBar value={c.value} />
          </div>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <EffectChip label="Velocidade" value={fmtMult(view.effects.speed)} />
        <EffectChip label="Precisão" value={fmtMult(view.effects.accuracy)} />
        <EffectChip label="Defesa" value={fmtMult(view.effects.defense)} />
        <EffectChip label="Decisão" value={fmtMult(view.effects.decision)} />
        <EffectChip label="Treino" value={fmtMult(view.effects.training)} />
        <EffectChip
          label="Recuperação"
          value={fmtMult(view.effects.recovery)}
        />
      </div>

      {weekEffects?.fatigue ? (
        <p className="mt-3 text-xs text-slate-500">
          Última semana: composto {weekEffects.fatigue.composite}
          {weekEffects.fatigue.schedule?.isAway ? ' · viagem' : ''}
          {weekEffects.fatigue.backToBack > 0 ? ' · B2B' : ''}
        </p>
      ) : null}
    </Card>
  )
}

function fmtMult(value) {
  const n = Number(value) || 1
  return `${Math.round(n * 100)}%`
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
