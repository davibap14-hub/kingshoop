/**
 * Barra de progresso reutilizável.
 */
export default function ProgressBar({
  value = 0,
  max = 100,
  className = '',
  barClassName = 'bg-accent',
  trackClassName = 'bg-slate-100',
  height = 'h-2',
  animated = true,
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0

  return (
    <div
      className={`overflow-hidden rounded-full ${height} ${trackClassName} ${className}`}
    >
      <div
        className={`h-full origin-left rounded-full ${barClassName} ${
          animated ? 'transition-all duration-500 ease-out' : ''
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
