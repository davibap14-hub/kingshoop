import { useEffect, useMemo } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const COLORS = [
  '#1d6fea',
  '#e8a317',
  '#22c55e',
  '#f43f5e',
  '#38bdf8',
  '#fbbf24',
  '#ffffff',
]

/**
 * Confetti — explosão celebratória (Framer Motion, sem Engine).
 */
export default function ConfettiBurst({
  active = false,
  pieces = 48,
  onComplete,
}) {
  const reduce = useReducedMotion()
  const particles = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => {
        const angle = (Math.PI * 2 * i) / pieces + (i % 5) * 0.15
        const dist = 120 + (i % 7) * 28
        return {
          id: i,
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 40 - (i % 4) * 20,
          rotate: (i * 47) % 360,
          color: COLORS[i % COLORS.length],
          size: 6 + (i % 4) * 2,
          delay: (i % 8) * 0.015,
        }
      }),
    [pieces],
  )

  useEffect(() => {
    if (!active || reduce) return undefined
    const timer = setTimeout(() => onComplete?.(), 1500)
    return () => clearTimeout(timer)
  }, [active, reduce, onComplete])

  if (reduce) return null

  return (
    <AnimatePresence>
      {active ? (
        <div
          className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center"
          aria-hidden
        >
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className="absolute rounded-sm"
              style={{
                width: p.size,
                height: p.size * 0.55,
                backgroundColor: p.color,
              }}
              initial={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
              animate={{
                opacity: [1, 1, 0],
                x: p.x,
                y: p.y + 80,
                scale: [1, 1.1, 0.6],
                rotate: p.rotate,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.35,
                delay: p.delay,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          ))}
          <motion.p
            className="absolute font-display text-3xl font-black uppercase tracking-wide text-amber-300 drop-shadow-lg sm:text-5xl"
            initial={{ opacity: 0, scale: 0.7, y: 12 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.7, 1.05, 1, 0.95], y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          >
            Level Up!
          </motion.p>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
