import { ATTRIBUTES } from '../../data/constants/attributes'
import { useGameStore } from '../../store/useGameStore'
import { Button, Card, ProgressBar } from '../ui'

export default function StatCard({ statKey }) {
  const value = useGameStore((s) => s.playerStats[statKey])
  const updateStat = useGameStore((s) => s.updateStat)
  const meta = ATTRIBUTES[statKey]
  const pct = Math.min(100, Math.max(0, value))

  return (
    <Card className="flex flex-col gap-3" padding="md">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {meta.short}
          </p>
          <h3 className="font-display text-lg font-bold text-navy">{meta.label}</h3>
        </div>
        <span className="font-display text-3xl font-extrabold tabular-nums text-ink">
          {value}
        </span>
      </div>

      <ProgressBar value={pct} barClassName="bg-accent" />

      <p className="text-xs leading-relaxed text-slate-500">{meta.description}</p>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1 normal-case tracking-normal"
          onClick={() => updateStat(statKey, -1)}
        >
          −1
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="flex-1 normal-case tracking-normal"
          onClick={() => updateStat(statKey, 1)}
        >
          +1
        </Button>
      </div>
    </Card>
  )
}
