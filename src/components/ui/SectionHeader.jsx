/**
 * Cabeçalho de seção reutilizável.
 */
export default function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div
      className={`flex flex-wrap items-end justify-between gap-3 ${className}`}
    >
      <div>
        {eyebrow && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-1 max-w-xl text-sm text-slate-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
