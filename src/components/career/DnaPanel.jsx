import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'
import { Badge, Card, CardHeader, ProgressBar } from '../ui'

/**
 * Interface da Player DNA Engine — somente leitura.
 */
export default function DnaPanel() {
  const player = useGameStore((s) => s.player)
  const playerName = useGameStore((s) => s.playerName)
  const weekEffects = useGameStore((s) => s.weekEffects)

  const view = gameService.getDnaView({
    player,
    playerName,
    lastWeekResult: weekEffects ? { dna: weekEffects.dna } : null,
  })

  if (!view.available) {
    return (
      <Card id="dna" padding="lg" className="animate-fade-up">
        <CardHeader subtitle="Player DNA Engine" title="DNA do jogador" />
        <p className="text-sm text-slate-500">DNA indisponível.</p>
      </Card>
    )
  }

  return (
    <Card id="dna" padding="lg" className="animate-fade-up">
      <CardHeader
        subtitle="Player DNA Engine"
        title="DNA do jogador"
        action={<Badge tone="blue">âncora ±{view.maxDrift}</Badge>}
      />

      <p className="mb-3 text-sm text-slate-500">
        Identidade única que evolui lentamente. Dois jogadores com os mesmos
        atributos jogam de forma diferente — a Decision Engine usa o DNA em
        todas as decisões.
      </p>

      <p className="mb-4 text-sm font-medium text-navy">{view.summary}</p>

      {view.dominant?.length ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {view.dominant.map((trait) => (
            <Badge key={trait.key} tone="neutral">
              {trait.label} {Math.round(trait.value)}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {view.traits.map((trait) => (
          <div key={trait.key}>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {trait.label}
              </p>
              <p className="text-sm font-semibold tabular-nums text-ink">
                {Math.round(trait.value)}
                <span className="ml-1 text-[11px] font-normal text-slate-400">
                  {trait.drift === 0
                    ? 'âncora'
                    : trait.drift > 0
                      ? `+${trait.drift}`
                      : trait.drift}
                </span>
              </p>
            </div>
            <ProgressBar value={trait.value} />
          </div>
        ))}
      </div>

      {weekEffects?.dna?.evolved ? (
        <p className="mt-3 text-xs text-slate-500">
          Última semana: {weekEffects.dna.evolved} traço(s)/jogador(es) com
          micro-evolução.
        </p>
      ) : null}
    </Card>
  )
}
