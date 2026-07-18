import { motion, useReducedMotion } from 'framer-motion'

/**
 * Glow nas conquistas — aura dourada para itens desbloqueados/recentes.
 */
export default function AchievementGlow({
  children,
  className = '',
  active = true,
  intensity = 'md',
}) {
  const reduce = useReducedMotion()
  const glow =
    intensity === 'lg'
      ? '0 0 28px rgba(232,163,23,0.55), 0 0 8px rgba(255,220,120,0.45)'
      : '0 0 18px rgba(232,163,23,0.4), 0 0 4px rgba(255,220,120,0.35)'

  return (
    <motion.div
      className={['relative rounded-xl', className].join(' ')}
      animate={
        active && !reduce
          ? {
              boxShadow: [
                glow,
                '0 0 10px rgba(232,163,23,0.2)',
                glow,
              ],
            }
          : active
            ? { boxShadow: glow }
            : { boxShadow: '0 0 0 rgba(0,0,0,0)' }
      }
      transition={
        reduce
          ? undefined
          : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
      }
    >
      {active && !reduce ? (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-r from-amber-300/10 via-amber-100/5 to-amber-300/10"
          animate={{ opacity: [0.35, 0.75, 0.35] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        />
      ) : null}
      <div className="relative">{children}</div>
    </motion.div>
  )
}
