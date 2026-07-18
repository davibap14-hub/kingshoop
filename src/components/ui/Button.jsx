const VARIANTS = {
  primary:
    'bg-navy text-white shadow-soft hover:bg-navy-hover hover:shadow-lift active:scale-[0.98] disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none',
  secondary:
    'border border-[var(--ds-line)] bg-white/90 text-slate-700 shadow-soft backdrop-blur-sm hover:border-[color-mix(in_srgb,var(--ds-accent)_35%,var(--ds-line))] hover:bg-white hover:text-navy active:scale-[0.98] disabled:opacity-50',
  accent:
    'bg-[var(--ds-accent)] text-white shadow-soft hover:brightness-110 active:scale-[0.98] disabled:bg-slate-300 disabled:text-slate-500',
  ghost:
    'bg-transparent text-slate-600 hover:bg-white/70 hover:text-navy disabled:opacity-40',
  glass:
    'border border-white/25 bg-white/15 text-white backdrop-blur-md hover:bg-white/25 active:scale-[0.98]',
}

const SIZES = {
  sm: 'px-3.5 py-1.5 text-[11px]',
  md: 'px-4 py-2.5 text-xs',
  lg: 'px-6 py-3.5 text-sm',
}

/**
 * Botão do Design System — microinteração em hover/active.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl font-bold uppercase tracking-[0.12em] transition-all duration-200 ease-sport disabled:cursor-not-allowed',
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size] ?? SIZES.md,
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
