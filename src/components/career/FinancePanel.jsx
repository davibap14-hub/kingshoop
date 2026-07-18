import { LUXURY_LEVELS } from '../../data/finance/constants'
import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'
import { Card, CardHeader } from '../ui'

function money(value) {
  return `$${Number(value ?? 0).toLocaleString('en-US')}`
}

/**
 * Interface da Finance Engine — resumo semanal + luxo + patrimônio.
 */
export default function FinancePanel() {
  const finance = useGameStore((s) => s.finance)
  const status = useGameStore((s) => s.status)
  const weekEffects = useGameStore((s) => s.weekEffects)
  const setLuxuryLevel = useGameStore((s) => s.setLuxuryLevel)
  const investCash = useGameStore((s) => s.investCash)

  if (!finance) return null

  const summary = weekEffects?.finance ?? finance.lastSummary
  const luxuryLevels = gameService.listLuxuryLevels()

  return (
    <Card padding="lg">
      <CardHeader
        subtitle="Finance Engine"
        title={`Patrimônio ${money(finance.patrimonio)}`}
        action={
          summary ? (
            <div className="text-right text-xs text-slate-500">
              <p className="font-semibold text-navy">
                Fluxo:{' '}
                <span
                  className={
                    summary.fluxoLiquido >= 0
                      ? 'text-slate-800'
                      : 'text-slate-500'
                  }
                >
                  {summary.fluxoLiquido >= 0 ? '+' : ''}
                  {money(summary.fluxoLiquido)}
                </span>
              </p>
            </div>
          ) : null
        }
      />
      <p className="-mt-2 mb-4 text-sm text-slate-500">
        Caixa {money(status?.dinheiro)} · Investimentos{' '}
        {money(
          (finance.investments ?? []).reduce(
            (sum, inv) => sum + (inv.principal ?? 0),
            0,
          ),
        )}
      </p>

      {summary?.lines?.length > 0 && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {summary.lines.map((line) => (
            <div
              key={line.id}
              className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {line.label}
              </p>
              <p
                className={`font-display text-lg font-bold tabular-nums ${
                  line.amount >= 0 ? 'text-navy' : 'text-slate-500'
                }`}
              >
                {line.amount >= 0 ? '+' : ''}
                {money(line.amount)}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Estilo de vida
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.values(luxuryLevels).map((level) => {
              const active = finance.luxuryLevel === level.id
              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => setLuxuryLevel(level.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? 'border-navy bg-navy text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-navy/30'
                  }`}
                >
                  {level.label}
                  <span className="ml-1 opacity-70">
                    {money(level.weeklyCost)}/sem
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => investCash('poupanca', 2000)}
          disabled={(status?.dinheiro ?? 0) < 2000}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-navy transition hover:border-navy/30 hover:bg-navy/5 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Investir $2.000 na Poupança
        </button>
      </div>

      {(finance.investments?.length ?? 0) > 0 && (
        <p className="mt-3 text-xs text-slate-500">
          Carteira:{' '}
          {finance.investments
            .map(
              (inv) =>
                `${inv.name} (${money(inv.principal)})`,
            )
            .join(' · ')}
          {finance.luxuryLevel
            ? ` · Luxo atual: ${LUXURY_LEVELS[finance.luxuryLevel]?.label ?? finance.luxuryLevel}`
            : ''}
        </p>
      )}
    </Card>
  )
}
