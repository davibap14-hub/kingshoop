import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'
import { Badge, Card, CardHeader, ProgressBar } from '../ui'

/**
 * Interface da Defensive Engine — somente leitura.
 */
export default function DefensePanel() {
  const gm = useGameStore((s) => s.gm)
  const currentTeamId = useGameStore((s) => s.currentTeamId)
  const weekEffects = useGameStore((s) => s.weekEffects)

  const view = gameService.getDefenseView({
    gm,
    currentTeamId,
    lastWeekResult: weekEffects,
  })

  if (!view.available) {
    return (
      <Card id="defesa" padding="lg" className="animate-fade-up">
        <CardHeader subtitle="Defensive Engine" title="Defesa coletiva" />
        <p className="text-sm text-slate-500">Sem técnico / preferências defensivas.</p>
      </Card>
    )
  }

  return (
    <Card id="defesa" padding="lg" className="animate-fade-up">
      <CardHeader
        subtitle="Defensive Engine"
        title="Defesa coletiva"
        action={
          <Badge tone="blue">Sistema {view.defensiveSystem}</Badge>
        }
      />

      <p className="mb-3 text-sm text-slate-500">
        Individual, zona, switch, help, double team, trap, drop, hedge, ice e
        full court press. O técnico define preferências; a defesa reage ao
        ataque em toda posse.
      </p>

      <p className="mb-3 text-xs text-slate-500">
        Técnico: {view.coachName}
        {view.coachArchetypeId ? ` · ${view.coachArchetypeId}` : ''}
      </p>

      {view.topSchemes?.length ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {view.topSchemes.map((s) => (
            <Badge key={s.id} tone="neutral">
              {s.label} {s.value}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {view.preferences.map((pref) => (
          <div key={pref.id}>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {pref.label}
              </p>
              <p className="text-sm font-semibold tabular-nums text-ink">
                {pref.value}
              </p>
            </div>
            <ProgressBar value={pref.value} />
          </div>
        ))}
      </div>

      {weekEffects?.defense?.updated != null ? (
        <p className="mt-3 text-xs text-slate-500">
          Última semana: preferências sincronizadas em{' '}
          {weekEffects.defense.updated} técnico(s).
        </p>
      ) : null}
    </Card>
  )
}
