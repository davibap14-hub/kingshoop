import { motion, useReducedMotion } from 'framer-motion'

/**
 * Barra de progresso animada (Framer Motion).
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
  const reduce = useReducedMotion()
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0

  return (
    <div
      className={`overflow-hidden rounded-lg ${height} ${trackClassName} ${className}`}
    >
      <motion.div
        className={`h-full origin-left rounded-lg ${barClassName}`}
        initial={animated && !reduce ? { width: 0 } : false}
        animate={{ width: `${pct}%` }}
        transition={
          animated && !reduce
            ? { duration: 0.75, ease: [0.22, 1, 0.36, 1] }
            : { duration: 0 }
        }
      />
    </div>
  )
}
