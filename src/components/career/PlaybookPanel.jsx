import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'
import { Badge, Card, CardHeader } from '../ui'

/**
 * Interface da Playbook Engine — somente leitura.
 */
export default function PlaybookPanel() {
  const gm = useGameStore((s) => s.gm)
  const currentTeamId = useGameStore((s) => s.currentTeamId)
  const weekEffects = useGameStore((s) => s.weekEffects)

  const view = gameService.getPlaybookView({
    gm,
    currentTeamId,
  })

  if (!view.available) {
    return (
      <Card id="playbook" padding="lg" className="animate-fade-up">
        <CardHeader subtitle="Playbook Engine" title="Playbook" />
        <p className="text-sm text-slate-500">
          Playbook da franquia ainda não gerado.
        </p>
      </Card>
    )
  }

  return (
    <Card id="playbook" padding="lg" className="animate-fade-up">
      <CardHeader
        subtitle="Playbook Engine"
        title="Playbook da franquia"
        action={
          <Badge tone="blue">
            {view.playCount} jogadas
          </Badge>
        }
      />

      <p className="mb-3 text-sm text-slate-500">
        Cada franquia tem dezenas de jogadas (PnR, iso, motion, horns, Spain…).
        A Decision Engine escolhe automaticamente a melhor jogada por posse —
        coach, elenco, fadiga, matchup, relógio, placar e importância.
      </p>

      {view.coachName ? (
        <p className="mb-3 text-xs text-slate-500">
          Técnico: {view.coachName}
          {view.coachArchetypeId ? ` · ${view.coachArchetypeId}` : ''}
        </p>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2">
        {view.categories.map((cat) => (
          <Badge key={cat.id} tone="neutral">
            {cat.label} ×{cat.count}
          </Badge>
        ))}
      </div>

      <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
        {view.plays.map((play) => (
          <li
            key={play.id}
            className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-navy">{play.name}</p>
                <p className="text-[11px] text-slate-400">
                  {play.categoryLabel} · prioridade {play.priority}
                </p>
              </div>
              <Badge tone="blue">{play.executionSet}</Badge>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              {play.positioning}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Leitura: {play.reading}
            </p>
            <ol className="mt-1.5 list-decimal space-y-0.5 pl-4 text-xs text-slate-600">
              <li>{play.firstOption}</li>
              <li>{play.secondOption}</li>
              <li>{play.thirdOption}</li>
            </ol>
          </li>
        ))}
      </ul>

      {weekEffects?.playbook ? (
        <p className="mt-3 text-xs text-slate-500">
          Última semana: {weekEffects.playbook.teams ?? 0} times com playbook
          {weekEffects.playbook.regenerated ? ' · regenerado' : ''}.
        </p>
      ) : null}
    </Card>
  )
}
