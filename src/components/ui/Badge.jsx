const TONES = {
  neutral: 'bg-slate-100/90 text-slate-600 ring-slate-200/80',
  blue: 'bg-[var(--ds-accent-soft)] text-[var(--ds-accent)] ring-[color-mix(in_srgb,var(--ds-accent)_25%,transparent)]',
  dark: 'bg-navy/10 text-navy ring-navy/10',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  warning: 'bg-amber-50 text-amber-800 ring-amber-100',
  danger: 'bg-rose-50 text-rose-700 ring-rose-100',
}

/**
 * Badge / chip — cantos suaves (não pill full).
 */
export default function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ring-1 ring-inset',
        TONES[tone] ?? TONES.neutral,
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
