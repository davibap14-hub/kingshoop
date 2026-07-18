import Card from './Card'
import ProgressBar from './ProgressBar'

/**
 * Card de métrica (stat tile) reutilizável.
 */
export default function MetricCard({
  label,
  value,
  hint,
  progress,
  progressMax = 100,
  tone = 'blue',
  className = '',
}) {
  const bars = {
    blue: 'bg-accent',
    dark: 'bg-navy',
    muted: 'bg-slate-400',
  }

  return (
    <Card className={`animate-rise ${className}`} padding="sm" hover>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ds-muted)]">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-extrabold uppercase tabular-nums text-ink">
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      {progress != null && (
        <ProgressBar
          value={progress}
          max={progressMax}
          className="mt-3"
          barClassName={bars[tone] ?? 'bg-[var(--ds-accent)]'}
        />
      )}
    </Card>
  )
}
