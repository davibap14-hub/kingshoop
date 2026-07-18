/**
 * Avatar com iniciais — placeholder premium.
 */
export default function Avatar({
  name = '?',
  size = 'md',
  className = '',
}) {
  const initials = String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?'

  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-11 w-11 text-sm',
    lg: 'h-14 w-14 text-base',
    xl: 'h-16 w-16 text-lg',
  }

  return (
    <div
      className={[
        'flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-navy via-navy-soft to-[#1a4570] font-display font-bold text-white shadow-soft ring-2 ring-white/70',
        sizes[size] ?? sizes.md,
        className,
      ].join(' ')}
      aria-hidden
    >
      {initials}
    </div>
  )
}
