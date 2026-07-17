import { CAREER_STATUS } from '../../data/constants/career'
import { useGameStore } from '../../store/useGameStore'

function formatValue(key, value) {
  if (key === 'dinheiro') {
    return `$${Number(value).toLocaleString('en-US')}`
  }
  return `${value}`
}

const TONE = {
  energia: 'from-emerald-500 to-teal-500',
  motivacao: 'from-sky-500 to-blue-600',
  popularidade: 'from-amber-500 to-orange-400',
  felicidade: 'from-lime-500 to-green-500',
  relTreinador: 'from-slate-500 to-slate-700',
  relCompanheiros: 'from-rose-500 to-red-500',
  dinheiro: 'from-amber-400 to-yellow-500',
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
          const pct = hasBar ? Math.min(100, (value / meta.max) * 100) : null

          return (
            <div
              key={key}
              className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {meta.label}
              </p>
              <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-navy">
                {formatValue(key, value)}
              </p>
              {pct != null && (
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${TONE[key]} transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
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
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
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
        </div>

        <div
          className={`rounded-xl border p-4 shadow-sm ${
            injury
              ? 'border-court/30 bg-court/5'
              : 'border-slate-200/80 bg-white'
          }`}
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
        </div>
      </div>
    </div>
  )
}
