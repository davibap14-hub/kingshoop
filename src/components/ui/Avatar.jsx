/**
 * Avatar com iniciais — reutilizável.
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
        'flex shrink-0 items-center justify-center rounded-full bg-navy font-display font-bold text-white',
        sizes[size] ?? sizes.md,
        className,
      ].join(' ')}
      aria-hidden
    >
      {initials}
    </div>
  )
}
