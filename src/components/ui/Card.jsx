/**
 * Card genérico do dashboard — container reutilizável.
 */
export default function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
  as: Tag = 'div',
  ...props
}) {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6',
  }

  return (
    <Tag
      className={[
        'rounded-xl border border-slate-200/90 bg-white shadow-panel',
        hover ? 'transition hover:border-accent/30 hover:shadow-md' : '',
        paddings[padding] ?? paddings.md,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </Tag>
  )
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div
      className={`mb-4 flex flex-wrap items-start justify-between gap-3 ${className}`}
    >
      <div>
        {subtitle && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {subtitle}
          </p>
        )}
        {title && (
          <h3 className="font-display text-lg font-bold tracking-tight text-navy sm:text-xl">
            {title}
          </h3>
        )}
      </div>
      {action}
    </div>
  )
}
