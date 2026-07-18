import { useState } from 'react'
import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'
import { Badge, Button, Card, CardHeader } from '../ui'

/**
 * Oferta pendente da Contract Engine — Aceitar / Negociar / Recusar.
 */
export default function ContractOfferPanel() {
  const pending = useGameStore((s) => s.pendingContractOffer)
  const resolveContractDecision = useGameStore((s) => s.resolveContractDecision)
  const [negotiateOpen, setNegotiateOpen] = useState(false)
  const [terms, setTerms] = useState(null)

  if (!pending) return null

  const view = gameService.summarizeContractOffer(pending)
  const canNegotiate = view.decisions.some((d) => d.id === 'negotiate')

  const openNegotiate = () => {
    setTerms({
      yearlySalary: pending.yearlySalary,
      years: pending.years,
      signingBonus: pending.signingBonus ?? 0,
      tradeClause: pending.clauses?.tradeClause ?? 'none',
      playerOption: Boolean(pending.options?.playerOption),
      teamOption: Boolean(pending.options?.teamOption),
      buyoutPayout: pending.buyoutPayout ?? 0,
    })
    setNegotiateOpen(true)
  }

  return (
    <Card
      id="contrato-oferta"
      padding="lg"
      className="animate-fade-up border-court/30 shadow-md shadow-court/5"
    >
      <CardHeader
        subtitle="Contract Engine"
        title={view.typeLabel}
        action={<Badge tone="blue">Decisão obrigatória</Badge>}
      />

      <p className="text-sm text-slate-600">{view.reason}</p>
      <p className="mt-1 font-display text-lg font-bold text-navy">
        {view.fromTeamName} ({view.fromTeamShort})
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {view.type !== 'buyout' ? (
          <>
            <Stat
              label="Salário anual"
              value={`$${Number(view.yearlySalary).toLocaleString('en-US')}`}
            />
            <Stat label="Duração" value={`${view.years} ano(s)`} />
            <Stat
              label="Bônus"
              value={`$${Number(view.signingBonus).toLocaleString('en-US')}`}
            />
            <Stat label="Cláusula" value={view.tradeClauseLabel} />
          </>
        ) : (
          <Stat
            label="Buyout"
            value={`$${Number(view.buyoutPayout).toLocaleString('en-US')}`}
          />
        )}
      </div>

      {(view.options?.playerOption || view.options?.teamOption) && (
        <p className="mt-2 text-xs text-slate-500">
          {view.options.playerOption ? 'Player Option · ' : ''}
          {view.options.teamOption ? 'Team Option' : ''}
        </p>
      )}

      {view.negotiateRound > 0 ? (
        <p className="mt-2 text-xs text-slate-500">
          Negociação rodada {view.negotiateRound}/{view.maxNegotiateRounds}
          {pending.status === 'negotiating' ? ' — contra-proposta da franquia' : ''}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {view.decisions.map((d) => (
          <Button
            key={d.id}
            variant={d.id === 'accept' ? 'accent' : 'secondary'}
            onClick={() => {
              if (d.id === 'negotiate') openNegotiate()
              else resolveContractDecision(d.id === 'refuse' ? 'refuse' : 'accept')
            }}
          >
            {d.label}
          </Button>
        ))}
      </div>

      {negotiateOpen && canNegotiate && terms ? (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Negociar termos
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {pending.type === 'buyout' ? (
              <label className="text-xs text-slate-600">
                Valor do buyout
                <input
                  type="number"
                  className="mt-1 w-full rounded border border-slate-200 px-2 py-1.5 text-sm"
                  value={terms.buyoutPayout}
                  onChange={(e) =>
                    setTerms({
                      ...terms,
                      buyoutPayout: Number(e.target.value),
                    })
                  }
                />
              </label>
            ) : (
              <>
                <label className="text-xs text-slate-600">
                  Salário anual
                  <input
                    type="number"
                    className="mt-1 w-full rounded border border-slate-200 px-2 py-1.5 text-sm"
                    value={terms.yearlySalary}
                    onChange={(e) =>
                      setTerms({
                        ...terms,
                        yearlySalary: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label className="text-xs text-slate-600">
                  Anos
                  <input
                    type="number"
                    min={1}
                    max={5}
                    className="mt-1 w-full rounded border border-slate-200 px-2 py-1.5 text-sm"
                    value={terms.years}
                    onChange={(e) =>
                      setTerms({ ...terms, years: Number(e.target.value) })
                    }
                  />
                </label>
                <label className="text-xs text-slate-600">
                  Bônus de assinatura
                  <input
                    type="number"
                    className="mt-1 w-full rounded border border-slate-200 px-2 py-1.5 text-sm"
                    value={terms.signingBonus}
                    onChange={(e) =>
                      setTerms({
                        ...terms,
                        signingBonus: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label className="text-xs text-slate-600">
                  Trade clause
                  <select
                    className="mt-1 w-full rounded border border-slate-200 px-2 py-1.5 text-sm"
                    value={terms.tradeClause}
                    onChange={(e) =>
                      setTerms({ ...terms, tradeClause: e.target.value })
                    }
                  >
                    <option value="none">Sem cláusula</option>
                    <option value="limited">Limited NTC</option>
                    <option value="full">No-Trade Clause</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={terms.playerOption}
                    onChange={(e) =>
                      setTerms({ ...terms, playerOption: e.target.checked })
                    }
                  />
                  Player Option
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={terms.teamOption}
                    onChange={(e) =>
                      setTerms({ ...terms, teamOption: e.target.checked })
                    }
                  />
                  Team Option
                </label>
              </>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              variant="accent"
              onClick={() => {
                resolveContractDecision('negotiate', terms)
                setNegotiateOpen(false)
              }}
            >
              Enviar proposta
            </Button>
            <Button variant="secondary" onClick={() => setNegotiateOpen(false)}>
              Cancelar
            </Button>
          </div>
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
