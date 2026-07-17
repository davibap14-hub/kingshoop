import { getArchetypeCaps } from '../../data/constants/archetypes'
import { EVOLUTION_GROUP_LABELS } from '../../data/progression/constants'
import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'
import { Card, CardHeader, ProgressBar } from '../ui'

/**
 * Interface da Progression Engine — só exibe XP/nível e gasta pontos.
 */
export default function ProgressionPanel() {
  const progression = useGameStore((s) => s.progression)
  const player = useGameStore((s) => s.player)
  const archetypeId = useGameStore((s) => s.archetypeId)
  const spendEvolutionPoint = useGameStore((s) => s.spendEvolutionPoint)
  const weekEffects = useGameStore((s) => s.weekEffects)

  if (!progression) return null

  const groups = gameService.listEvolvableGroups(player, archetypeId)
  const caps = getArchetypeCaps(archetypeId)
  const xpPct =
    progression.xpToNext > 0
      ? Math.min(100, Math.round((progression.xp / progression.xpToNext) * 100))
      : 100

  return (
    <Card padding="lg">
      <CardHeader
        subtitle="Progression Engine"
        title={`Nível ${progression.level}`}
        action={
          <div className="text-right text-xs text-slate-500">
            <p>
              XP {progression.xp}
              {progression.xpToNext ? ` / ${progression.xpToNext}` : ' (máx.)'}
            </p>
            {weekEffects?.progression?.xpGain != null && (
              <p className="font-semibold text-accent">
                Última semana: +{weekEffects.progression.xpGain} XP
                {weekEffects.progression.leveledUp
                  ? ` · +${weekEffects.progression.pointsGained} ponto(s)`
                  : ''}
              </p>
            )}
          </div>
        }
      />
      <p className="-mt-2 mb-3 text-sm text-slate-500">
        {progression.evolutionPoints} ponto(s) de evolução disponíveis
      </p>

      <ProgressBar value={xpPct} barClassName="bg-accent" />

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {groups.map((group) => (
          <button
            key={group.id}
            type="button"
            disabled={
              progression.evolutionPoints <= 0 || !group.available
            }
            onClick={() => spendEvolutionPoint(group.id)}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-accent/40 hover:bg-accent-soft/40 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <span className="block text-sm font-bold text-navy">
              {EVOLUTION_GROUP_LABELS[group.id] ?? group.label}
            </span>
            <span className="mt-1 block text-[11px] text-slate-500">
              Média {group.average} / teto {caps[group.id] ?? group.cap}
            </span>
            <span className="mt-2 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {group.available ? 'Gastar 1 ponto (+1 gradual)' : 'Limite do arquétipo'}
            </span>
          </button>
        ))}
      </div>
    </Card>
  )
}
