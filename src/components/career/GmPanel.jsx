import { GM_PERSONALITIES } from '../../data/gm/personalities'
import { TEAMS } from '../../data/teams'
import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'
import { Badge, Card, CardHeader } from '../ui'

const TYPE_LABELS = {
  sign: 'Contratação',
  release: 'Dispensa',
  renew: 'Renovação',
  trade: 'Troca',
  draft: 'Draft',
}

/**
 * Interface do GM Engine — apenas exibe decisões e personalidades.
 */
export default function GmPanel() {
  const gm = useGameStore((s) => s.gm)
  const season = useGameStore((s) => s.season)
  const currentTeamId = useGameStore((s) => s.currentTeamId)
  const weekEffects = useGameStore((s) => s.weekEffects)

  if (!gm) return null

  const view = gameService.getGmView({ gm, currentTeamId })
  const situation = gameService.analyzeFranchise(
    { gm, season, currentTeamId },
    currentTeamId,
  )
  const cap = gameService.getTeamCap({ gm }, currentTeamId)
  const weekDecisions =
    weekEffects?.gm?.decisions ?? gm.lastWeekDecisions ?? []

  return (
    <Card id="gm" padding="lg" className="animate-fade-up">
      <CardHeader
        subtitle="Franchise AI · Front Office"
        title="Front Office"
        action={<Badge tone="blue">Determinístico</Badge>}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Objetivo
          </p>
          <p className="mt-1 text-sm font-bold text-navy">
            {view.teamObjective?.label ??
              GM_PERSONALITIES[view.teamPersonality]?.label ??
              '—'}
          </p>
          <p className="text-xs text-slate-500">
            {view.teamObjective?.reason ??
              `Modo ${situation.mode} · OVR méd. ${situation.avgOvr}`}
          </p>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Salary Cap
          </p>
          <p className="mt-1 text-sm font-bold text-navy">
            ${(cap.payroll / 1_000_000).toFixed(1)}M
          </p>
          <p className="text-xs text-slate-500">
            Espaço ${(cap.space / 1_000_000).toFixed(1)}M · {cap.usagePct}%
          </p>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Mercado
          </p>
          <p className="mt-1 text-sm font-bold text-navy">
            {view.freeAgentsCount} FA
          </p>
          <p className="text-xs text-slate-500">
            Draft {view.draftComplete ? 'ok' : `${view.draftRemaining} prospects`}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Objetivos da liga
          </p>
          <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
            {TEAMS.map((team) => {
              const obj = gm.objectives?.[team.id]
              const pid = gm.personalities?.[team.id]
              const meta = GM_PERSONALITIES[pid]
              return (
                <li key={team.id} className="flex justify-between gap-2">
                  <span
                    className={
                      team.id === currentTeamId
                        ? 'font-bold text-accent'
                        : 'font-semibold text-navy'
                    }
                  >
                    {team.short}
                  </span>
                  <span className="text-slate-500">
                    {obj?.label ?? meta?.label ?? pid}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Decisões da semana
          </p>
          {weekDecisions.length === 0 ? (
            <p className="mt-2 text-xs text-slate-500">Nenhuma decisão nesta semana.</p>
          ) : (
            <ul className="mt-2 max-h-40 space-y-1.5 overflow-y-auto text-xs text-slate-700">
              {weekDecisions.map((d, i) => (
                <li key={`${d.at}-${i}`}>
                  <Badge tone="neutral" className="mr-1">
                    {TYPE_LABELS[d.type] ?? d.type}
                  </Badge>
                  <span className="font-semibold text-navy">
                    {String(d.teamId).toUpperCase()}
                  </span>{' '}
                  {d.playerName}
                  {d.acquiredName ? ` ↔ ${d.acquiredName}` : ''}
                  {d.objectiveLabel ? (
                    <span className="text-slate-400">
                      {' '}
                      · {d.objectiveLabel}
                    </span>
                  ) : null}
                  {d.reason ? (
                    <span className="text-slate-400"> — {d.reason}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {(view.draftBoard ?? []).length > 0 && (
        <div className="mt-4 rounded-lg border border-slate-100 bg-white p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Draft Engine · Mock Draft
          </p>
          <ul className="mt-2 max-h-44 space-y-1.5 overflow-y-auto text-[11px] text-slate-700">
            {view.draftBoard.map((p) => (
              <li key={p.id} className="flex flex-wrap items-baseline gap-x-2">
                <span className="w-6 font-bold text-accent">
                  #{p.mockRank}
                </span>
                <span className="font-semibold text-navy">{p.nome}</span>
                <span className="text-slate-400">
                  {p.posicao} · {p.universidade} · OVR {p.overall} · POT{' '}
                  {p.potencial}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {view.lastDraft?.picks?.length > 0 && (
        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Último Draft
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {view.lastDraft.picks.length} picks ·{' '}
            {view.lastDraft.undraftedCount ?? 0} undrafted na liga
          </p>
          <ul className="mt-2 max-h-36 space-y-1 overflow-y-auto text-[11px] text-slate-700">
            {view.lastDraft.picks.slice(0, 10).map((p) => (
              <li key={`pick-${p.pickNumber}`}>
                <span className="font-bold text-navy">#{p.pickNumber}</span>{' '}
                {String(p.teamId).toUpperCase()}: {p.prospectName} (
                {p.posicao}, {p.universidade})
              </li>
            ))}
          </ul>
        </div>
      )}

      {(view.recentLog ?? []).length > 0 && (
        <div className="mt-4 rounded-lg border border-slate-100 bg-white p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Histórico recente
          </p>
          <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-[11px] text-slate-600">
            {view.recentLog.map((d, i) => (
              <li key={`log-${d.at}-${i}`}>
                [{TYPE_LABELS[d.type] ?? d.type}] {d.teamId}: {d.playerName}
                {d.reason ? ` · ${d.reason}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
