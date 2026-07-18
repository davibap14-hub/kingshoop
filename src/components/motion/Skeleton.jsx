import { motion, useReducedMotion } from 'framer-motion'

/**
 * Loading Skeleton — placeholder com shimmer/pulse.
 */
export default function Skeleton({
  className = '',
  width,
  height,
  rounded = 'rounded-xl',
  style,
}) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className={[
        'relative overflow-hidden bg-slate-200/80',
        rounded,
        className,
      ].join(' ')}
      style={{ width, height, ...style }}
      aria-hidden
      animate={reduce ? undefined : { opacity: [0.45, 0.85, 0.45] }}
      transition={
        reduce
          ? undefined
          : { duration: 1.35, repeat: Infinity, ease: 'easeInOut' }
      }
    >
      {!reduce ? (
        <motion.div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
        />
      ) : null}
    </motion.div>
  )
}

export function SkeletonBlock({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className="h-3"
          width={i === lines - 1 ? '65%' : '100%'}
        />
      ))}
    </div>
  )
}
