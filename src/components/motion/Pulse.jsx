import { motion, useReducedMotion } from 'framer-motion'

/**
 * Pulse — destaque em notificações / alertas vivos.
 */
export default function Pulse({
  children,
  className = '',
  active = true,
  color = 'var(--ds-accent)',
}) {
  const reduce = useReducedMotion()

  return (
    <span className={`relative inline-flex ${className}`}>
      {active && !reduce ? (
        <motion.span
          className="pointer-events-none absolute -inset-1 rounded-[inherit] opacity-60"
          style={{
            boxShadow: `0 0 0 0 ${color}`,
          }}
          animate={{
            boxShadow: [
              `0 0 0 0 ${withAlpha(color, 0.45)}`,
              `0 0 0 8px ${withAlpha(color, 0)}`,
              `0 0 0 0 ${withAlpha(color, 0)}`,
            ],
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          aria-hidden
        />
      ) : null}
      {active && !reduce ? (
        <motion.span
          className="absolute right-0 top-0 z-[1] h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
          animate={{ scale: [1, 1.35, 1], opacity: [1, 0.55, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        />
      ) : null}
      {children}
    </span>
  )
}

function withAlpha(color, alpha) {
  if (color.startsWith('#') && color.length === 7) {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    return `rgba(${r},${g},${b},${alpha})`
  }
  if (color.startsWith('var(')) {
    return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`
  }
  return color
}
