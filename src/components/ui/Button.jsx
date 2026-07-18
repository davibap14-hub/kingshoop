const VARIANTS = {
  primary:
    'bg-navy text-white hover:bg-navy-hover disabled:bg-slate-300 disabled:text-slate-500',
  secondary:
    'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50',
  accent:
    'bg-accent text-white hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 disabled:opacity-40',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-[11px]',
  md: 'px-4 py-2.5 text-xs',
  lg: 'px-5 py-3 text-sm',
}

/**
 * Botão reutilizável do dashboard.
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
        'inline-flex items-center justify-center gap-2 rounded-lg font-bold uppercase tracking-wider transition disabled:cursor-not-allowed',
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
