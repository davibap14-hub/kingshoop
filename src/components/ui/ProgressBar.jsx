/**
 * Barra de progresso com transição suave.
 */
export default function ProgressBar({
  value = 0,
  max = 100,
  className = '',
  barClassName = 'bg-[var(--ds-accent)]',
  trackClassName = 'bg-slate-100/90',
  height = 'h-2',
  animated = true,
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0

  return (
    <div
      className={`overflow-hidden rounded-lg ${height} ${trackClassName} ${className}`}
    >
      <div
        className={`h-full origin-left rounded-lg ${barClassName} ${
          animated ? 'transition-all duration-500 ease-sport' : ''
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
