/**
 * Surface — painel moderno (card / glass) do Design System.
 */

const VARIANTS = {
  solid:
    'border border-[var(--ds-line)] bg-[var(--ds-surface)] shadow-lift',
  glass:
    'border border-white/50 bg-white/65 shadow-glass backdrop-blur-xl',
  soft:
    'border border-[var(--ds-line)] bg-[var(--ds-surface-soft)] shadow-soft',
  hero:
    'border border-white/10 bg-gradient-to-br from-[var(--ds-hero-from)] via-[var(--ds-hero-via)] to-[var(--ds-hero-to)] text-white shadow-hero',
}

const PADDING = {
  none: '',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-7',
  xl: 'p-6 sm:p-8',
}

export default function Surface({
  children,
  variant = 'solid',
  padding = 'md',
  hover = false,
  className = '',
  as: Tag = 'section',
  ...props
}) {
  return (
    <Tag
      className={[
        'relative overflow-hidden rounded-2xl transition-all duration-300 ease-out',
        VARIANTS[variant] ?? VARIANTS.solid,
        PADDING[padding] ?? PADDING.md,
        hover
          ? 'hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ds-accent)_35%,var(--ds-line))] hover:shadow-lift-lg'
          : '',
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

export function SurfaceHeader({
  eyebrow,
  title,
  action,
  className = '',
}) {
  return (
    <div
      className={`mb-4 flex flex-wrap items-start justify-between gap-3 ${className}`}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ds-muted)]">
            {eyebrow}
          </p>
        ) : null}
        {title ? (
          <h3 className="mt-0.5 font-display text-lg font-bold uppercase tracking-wide text-[var(--ds-ink)] sm:text-xl">
            {title}
          </h3>
        ) : null}
      </div>
      {action}
    </div>
  )
}
