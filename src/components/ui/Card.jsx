/**
 * Card — compatível com o Design System (Surface sólido).
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
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-7',
  }

  return (
    <Tag
      className={[
        'relative overflow-hidden rounded-2xl border border-[var(--ds-line)] bg-[var(--ds-surface)] shadow-lift transition-all duration-300 ease-sport',
        hover
          ? 'hover:-translate-y-0.5 hover:shadow-lift-lg hover:border-[color-mix(in_srgb,var(--ds-accent)_30%,var(--ds-line))]'
          : '',
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
