import { CAREER_STATUS } from '../../data/constants/career'
import { useGameStore } from '../../store/useGameStore'
import { Card, ProgressBar } from '../ui'

function formatValue(key, value) {
  if (key === 'dinheiro') {
    return `$${Number(value).toLocaleString('en-US')}`
  }
  return `${value}`
}

const DISPLAY_KEYS = [
  'energia',
  'motivacao',
  'popularidade',
  'felicidade',
  'relTreinador',
  'relCompanheiros',
  'dinheiro',
]

export default function CareerPanel() {
  const status = useGameStore((s) => s.status)
  const injury = useGameStore((s) => s.injury)
  const contract = useGameStore((s) => s.contract)
  const sponsorships = useGameStore((s) => s.sponsorships)

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">
        {DISPLAY_KEYS.map((key) => {
          const meta = CAREER_STATUS[key]
          const value = status?.[key] ?? 0
          const hasBar = meta.max != null

          return (
            <Card key={key} padding="sm" className="animate-fade-up">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {meta.label}
              </p>
              <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-ink">
                {formatValue(key, value)}
              </p>
              {hasBar && (
                <ProgressBar
                  value={value}
                  max={meta.max}
                  className="mt-3"
                  barClassName={key === 'dinheiro' ? 'bg-accent' : 'bg-navy'}
                />
              )}
            </Card>
          )
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card padding="md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Contrato
          </p>
          <p className="mt-1 text-sm font-semibold text-navy">
            ${Number(contract?.yearlySalary ?? 0).toLocaleString('en-US')}/ano
          </p>
          <p className="text-xs text-slate-500">
            {contract?.yearsRemaining ?? 0} ano(s) · $
            {Number(contract?.weeklySalary ?? 0).toLocaleString('en-US')}/sem
          </p>
        </Card>

        <Card padding="md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Patrocínios
          </p>
          <p className="mt-1 text-sm font-semibold text-navy">
            {sponsorships?.length
              ? sponsorships.map((s) => s.name).join(', ')
              : 'Nenhum ativo'}
          </p>
          <p className="text-xs text-slate-500">
            {sponsorships?.length
              ? `+$${sponsorships
                  .reduce((sum, s) => sum + s.weeklyPay, 0)
                  .toLocaleString('en-US')}/sem`
              : 'Faça eventos de marca para assinar'}
          </p>
        </Card>

        <Card
          padding="md"
          className={injury ? 'border-slate-300 bg-slate-50' : ''}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Lesão
          </p>
          <p className="mt-1 text-sm font-semibold text-navy">
            {injury ? injury.label : 'Saudável'}
          </p>
          <p className="text-xs text-slate-500">
            {injury
              ? `${injury.weeksRemaining} semana(s) restante(s)`
              : 'Sem restrições de treino'}
          </p>
        </Card>
      </div>
    </div>
  )
}
