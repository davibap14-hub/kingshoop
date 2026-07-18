import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'
import { Badge, Card, CardHeader } from '../ui'

/**
 * Interface da Contract Engine — contrato atual e histórico.
 */
export default function ContractPanel() {
  const contract = useGameStore((s) => s.contract)
  const contractEngine = useGameStore((s) => s.contractEngine)
  const pendingContractOffer = useGameStore((s) => s.pendingContractOffer)
  const currentTeamId = useGameStore((s) => s.currentTeamId)

  const view = gameService.getContractView({
    contract,
    contractEngine,
    pendingContractOffer,
    currentTeamId,
  })

  const c = view.contract

  return (
    <Card id="contratos" padding="lg" className="animate-fade-up">
      <CardHeader
        subtitle="Contract Engine"
        title="Contrato"
        action={<Badge tone="blue">{c.freeAgencyLabel}</Badge>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Time" value={c.teamName} />
        <Stat
          label="Salário"
          value={`$${Number(c.yearlySalary ?? 0).toLocaleString('en-US')}/ano`}
        />
        <Stat label="Anos restantes" value={c.yearsRemaining ?? 0} />
        <Stat label="Cláusula" value={c.tradeClauseLabel} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {c.hasPlayerOption ? <Badge tone="neutral">Player Option</Badge> : null}
        {c.hasTeamOption ? <Badge tone="neutral">Team Option</Badge> : null}
        {c.birdRights ? <Badge tone="blue">Bird Rights</Badge> : null}
        <Badge tone="neutral">
          {c.seasonsInLeague ?? 0} temp. na liga
        </Badge>
      </div>

      {view.pendingOffer ? (
        <p className="mt-3 text-sm text-court">
          Oferta pendente: {view.pendingOffer.typeLabel} de{' '}
          {view.pendingOffer.fromTeamShort}
        </p>
      ) : (
        <p className="mt-3 text-xs text-slate-500">
          Mercado de contratos na offseason: renovação, extensão, RFA/UFA,
          opções e buyout.
        </p>
      )}

      {view.history?.length > 0 ? (
        <div className="mt-4">
          <h4 className="mb-2 font-display text-sm font-bold text-navy">
            Histórico recente
          </h4>
          <ul className="space-y-1.5">
            {view.history.map((h) => (
              <li key={`${h.id}-${h.status}`} className="text-xs text-slate-600">
                <span className="font-semibold text-navy">{h.typeLabel}</span>
                {' · '}
                {h.fromTeamShort}
                {' · '}
                {h.status}
                {h.yearlySalary
                  ? ` · $${Number(h.yearlySalary).toLocaleString('en-US')}`
                  : ''}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="text-sm font-semibold text-navy">{value}</p>
    </div>
  )
}
