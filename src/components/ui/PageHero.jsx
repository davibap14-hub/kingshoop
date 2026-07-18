/**
 * PageHero — faixa de identidade da tela (AAA / broadcast).
 */

import Surface from './Surface'

export default function PageHero({
  eyebrow,
  title,
  description,
  meta,
  actions,
  children,
  className = '',
}) {
  return (
    <Surface
      variant="hero"
      padding="lg"
      className={['animate-rise', className].filter(Boolean).join(' ')}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 20% 0%, color-mix(in srgb, var(--ds-accent) 35%, transparent), transparent 55%), radial-gradient(ellipse at 90% 100%, rgba(255,255,255,0.08), transparent 45%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-18deg, transparent, transparent 14px, rgba(255,255,255,0.9) 14px, rgba(255,255,255,0.9) 15px)',
        }}
      />
      <div className="relative flex flex-wrap items-end justify-between gap-5">
        <div className="min-w-0 max-w-2xl">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/65">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 text-sm leading-relaxed text-white/80 sm:text-base">
              {description}
            </p>
          ) : null}
          {meta ? <div className="mt-3 flex flex-wrap gap-2">{meta}</div> : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
      {children ? <div className="relative mt-5">{children}</div> : null}
    </Surface>
  )
}
