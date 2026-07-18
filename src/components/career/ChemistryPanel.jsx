import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'
import { Badge, Card, CardHeader, ProgressBar } from '../ui'

/**
 * Interface da Chemistry Engine — somente leitura.
 */
export default function ChemistryPanel() {
  const gm = useGameStore((s) => s.gm)
  const currentTeamId = useGameStore((s) => s.currentTeamId)
  const relationshipEffects = useGameStore((s) => s.relationshipEffects)
  const weekEffects = useGameStore((s) => s.weekEffects)

  const view = gameService.getChemistryView({
    gm,
    currentTeamId,
    relationshipEffects,
  })

  const teamScore = view.teamChemistry ?? 50

  return (
    <Card id="quimica" padding="lg" className="animate-fade-up">
      <CardHeader
        subtitle="Chemistry Engine"
        title="Química do elenco"
        action={
          <Badge tone={teamScore >= 60 ? 'blue' : teamScore < 40 ? 'danger' : 'neutral'}>
            Time {teamScore}
          </Badge>
        }
      />

      <p className="mb-3 text-sm text-slate-500">
        Cada dupla tem química entre −100 e +100 (personalidade, tempo juntos,
        vitórias, derrotas, treinos, discussões e eventos). Na posse, esses
        pesos influenciam passe, movimentação, defesa, eficiência e decisões
        da IA — sem aleatório puro.
      </p>

      <div className="mb-4">
        <div className="flex items-end justify-between gap-2">
          <p className="text-sm font-semibold text-navy">Química do quinteto</p>
          <p className="font-display text-3xl font-extrabold tabular-nums text-ink">
            {teamScore}
          </p>
        </div>
        <ProgressBar value={teamScore} className="mt-2" />
        <p className="mt-1.5 text-xs text-slate-500">
          Média dos pares: {view.avgPair >= 0 ? '+' : ''}
          {view.avgPair} · {view.rosterPairCount} duplas no elenco ·{' '}
          {view.pairCount} na liga
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <EffectChip label="Passe" value={fmtBoost(view.effects.pass)} />
        <EffectChip
          label="Movimentação"
          value={fmtBoost(view.effects.movement)}
        />
        <EffectChip label="Defesa" value={fmtBoost(view.effects.defense)} />
        <EffectChip
          label="Eficiência OF"
          value={fmtBoost(view.effects.offense)}
        />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <PairList title="Melhores duplas" pairs={view.bestPairs} positive />
        <PairList title="Piores duplas" pairs={view.worstPairs} />
      </div>

      {weekEffects?.chemistry ? (
        <p className="mt-3 text-xs text-slate-500">
          Última semana: química do time {weekEffects.chemistry.teamChemistry} ·{' '}
          {weekEffects.chemistry.gamesApplied ?? 0} elencos por resultados
        </p>
      ) : null}
    </Card>
  )
}

function fmtBoost(value) {
  const n = Number(value) || 0
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)}`
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

function PairList({ title, pairs = [], positive = false }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </p>
      {pairs.length === 0 ? (
        <p className="text-xs text-slate-500">Sem pares ainda — avance uma semana.</p>
      ) : (
        <ul className="space-y-1.5">
          {pairs.map((p) => (
            <li
              key={p.key}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <span className="truncate text-navy">
                {p.aName} × {p.bName}
              </span>
              <Badge tone={positive || p.value >= 0 ? 'blue' : 'danger'}>
                {p.value >= 0 ? '+' : ''}
                {p.value}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
