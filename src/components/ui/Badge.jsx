const TONES = {
  neutral: 'bg-slate-100 text-slate-600',
  blue: 'bg-accent-soft text-accent',
  dark: 'bg-navy/10 text-navy',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-rose-50 text-rose-700',
}

/**
 * Badge / chip reutilizável.
 */
export default function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
        TONES[tone] ?? TONES.neutral,
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
