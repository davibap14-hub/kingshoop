import { motion, useReducedMotion } from 'framer-motion'
import { hoverLift } from '../motion/variants'

/**
 * Card — Surface sólido com Hover Cards (Framer Motion).
 */

export default function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
  as = 'div',
  ...props
}) {
  const reduce = useReducedMotion()
  const paddings = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-7',
  }

  const baseClass = [
    'relative overflow-hidden rounded-2xl border border-[var(--ds-line)] bg-[var(--ds-surface)] shadow-lift',
    paddings[padding] ?? paddings.md,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (!hover || reduce) {
    const Tag = as
    return (
      <Tag
        className={[
          baseClass,
          hover
            ? 'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift-lg'
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </Tag>
    )
  }

  const MotionTag = motion[as] ?? motion.div

  return (
    <MotionTag
      className={baseClass}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      variants={hoverLift}
      {...props}
    >
      {children}
    </MotionTag>
  )
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div
      className={`mb-4 flex flex-wrap items-start justify-between gap-3 ${className}`}
    >
      <div>
        {subtitle && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ds-muted)]">
            {subtitle}
          </p>
        )}
        {title && (
          <h3 className="font-display text-lg font-bold uppercase tracking-wide text-[var(--ds-ink)] sm:text-xl">
            {title}
          </h3>
        )}
      </div>
      {action}
    </div>
  )
}
