import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'
import { Badge, Card, CardHeader } from '../ui'

/**
 * Interface do Balance Engine — tetos e regras ativas (somente leitura).
 */
export default function BalancePanel() {
  const player = useGameStore((s) => s.player)
  const archetypeId = useGameStore((s) => s.archetypeId)
  const currentSeason = useGameStore((s) => s.currentSeason)
  const weekEffects = useGameStore((s) => s.weekEffects)

  const view = gameService.getBalanceView({
    player,
    archetypeId,
    currentSeason,
  })

  const rolled = weekEffects?.balance?.rolled

  return (
    <Card id="balance" padding="lg" className="animate-fade-up">
      <CardHeader
        subtitle="Balance Engine"
        title="Equilíbrio do jogo"
        action={
          <Badge tone={view.isVeteran ? 'danger' : view.isRookie ? 'blue' : 'neutral'}>
            {view.isVeteran
              ? 'Veterano'
              : view.isRookie
                ? 'Rookie'
                : 'Prime'}
          </Badge>
        }
      />

      <p className="mb-3 text-sm text-slate-500">
        Controle configurável de evolução, atributos, contratos, rookies e
        decadência. Ajuste em <code className="text-xs">data/balance</code>.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Metric
          label="Overall / soft cap"
          value={`${view.overall ?? '—'} / ${view.overallSoftCap}`}
        />
        <Metric
          label="Potencial"
          value={view.potential ?? '—'}
        />
        <Metric
          label="Idade"
          value={
            view.age != null
              ? `${view.age} (rookie ≤${view.aging.rookieMaxAge} · vet ≥${view.aging.veteranStartAge})`
              : '—'
          }
        />
        <Metric
          label="Inflação salarial"
          value={`×${view.contracts.leagueInflation.toFixed(2)} (T${currentSeason})`}
        />
        <Metric
          label="Treino"
          value={`máx +${view.training.maxGain} · freio ≥${view.training.diminishStart}`}
        />
        <Metric
          label="XP"
          value={`máx ${view.xp.maxGain} · freio OVR ≥${view.xp.diminishOverallStart}`}
        />
      </div>

      <div className="mt-4">
        <h4 className="mb-2 font-display text-sm font-bold text-navy">
          Tetos por grupo
        </h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(view.groupCaps).map(([group, cap]) => (
            <Badge key={group} tone="neutral">
              {group}: {cap ?? '—'}
            </Badge>
          ))}
        </div>
      </div>

      {rolled ? (
        <p className="mt-3 text-xs text-slate-500">
          Último roll: idade {weekEffects.balance.careerAge}
          {weekEffects.balance.leagueUpdated
            ? ` · ${weekEffects.balance.leagueUpdated} jogadores da liga`
            : ''}
        </p>
      ) : null}
    </Card>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-navy">{value}</p>
    </div>
  )
}
