import { getArchetypeCaps } from '../../data/constants/archetypes'
import { EVOLUTION_GROUP_LABELS } from '../../data/progression/constants'
import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'

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
    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Progression Engine
          </p>
          <h3 className="font-display text-2xl font-extrabold text-navy">
            Nível {progression.level}
          </h3>
          <p className="text-sm text-slate-500">
            {progression.evolutionPoints} ponto(s) de evolução disponíveis
          </p>
        </div>
        <div className="text-right text-xs text-slate-500">
          <p>
            XP {progression.xp}
            {progression.xpToNext ? ` / ${progression.xpToNext}` : ' (máx.)'}
          </p>
          {weekEffects?.progression?.xpGain != null && (
            <p className="font-semibold text-emerald-700">
              Última semana: +{weekEffects.progression.xpGain} XP
              {weekEffects.progression.leveledUp
                ? ` · +${weekEffects.progression.pointsGained} ponto(s)`
                : ''}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-navy to-court transition-all"
          style={{ width: `${xpPct}%` }}
        />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {groups.map((group) => (
          <button
            key={group.id}
            type="button"
            disabled={
              progression.evolutionPoints <= 0 || !group.available
            }
            onClick={() => spendEvolutionPoint(group.id)}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-navy/30 hover:bg-navy/5 disabled:cursor-not-allowed disabled:opacity-45"
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
    </div>
  )
}
