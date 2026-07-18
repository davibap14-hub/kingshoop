import { useCallback, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const VARIANTS = {
  primary:
    'bg-navy text-white shadow-soft hover:bg-navy-hover hover:shadow-lift disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none',
  secondary:
    'border border-[var(--ds-line)] bg-white/90 text-slate-700 shadow-soft backdrop-blur-sm hover:border-[color-mix(in_srgb,var(--ds-accent)_35%,var(--ds-line))] hover:bg-white hover:text-navy disabled:opacity-50',
  accent:
    'bg-[var(--ds-accent)] text-white shadow-soft hover:brightness-110 disabled:bg-slate-300 disabled:text-slate-500',
  ghost:
    'bg-transparent text-slate-600 hover:bg-white/70 hover:text-navy disabled:opacity-40',
  glass:
    'border border-white/25 bg-white/15 text-white backdrop-blur-md hover:bg-white/25',
}

const SIZES = {
  sm: 'px-3.5 py-1.5 text-[11px]',
  md: 'px-4 py-2.5 text-xs',
  lg: 'px-6 py-3.5 text-sm',
}

/**
 * Botão do Design System — ripple + press feedback (Framer Motion).
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  onClick,
  disabled,
  ...props
}) {
  const reduce = useReducedMotion()
  const [ripples, setRipples] = useState([])

  const addRipple = useCallback(
    (event) => {
      if (reduce || disabled) return
      const rect = event.currentTarget.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height) * 1.2
      const x = event.clientX - rect.left - size / 2
      const y = event.clientY - rect.top - size / 2
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setRipples((prev) => [...prev, { id, x, y, size }])
    },
    [reduce, disabled],
  )

  const removeRipple = useCallback((id) => {
    setRipples((prev) => prev.filter((r) => r.id !== id))
  }, [])

  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileTap={reduce || disabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 480, damping: 28 }}
      className={[
        'relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl font-bold uppercase tracking-[0.12em] transition-colors duration-200 ease-sport disabled:cursor-not-allowed',
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size] ?? SIZES.md,
        className,
      ].join(' ')}
      onPointerDown={addRipple}
      onClick={onClick}
      {...props}
    >
      <span className="relative z-[1]">{children}</span>
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            className="pointer-events-none absolute z-0 rounded-full bg-white/35"
            style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
            initial={{ scale: 0, opacity: 0.55 }}
            animate={{ scale: 1.6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            onAnimationComplete={() => removeRipple(r.id)}
            aria-hidden
          />
        ))}
      </AnimatePresence>
    </motion.button>
  )
}
