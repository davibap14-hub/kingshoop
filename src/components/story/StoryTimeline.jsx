import { motion, useReducedMotion } from 'framer-motion'

/**
 * Linha do tempo da cadeia — capítulos passados, atual e futuros.
 */
export default function StoryTimeline({ chapters = [], className = '' }) {
  const reduce = useReducedMotion()
  if (!chapters.length) return null

  return (
    <div className={className}>
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
        Linha do tempo da história
      </p>
      <ol className="relative grid gap-3 sm:grid-cols-3">
        <div
          className="pointer-events-none absolute left-0 right-0 top-5 hidden h-px bg-gradient-to-r from-transparent via-white/25 to-transparent sm:block"
          aria-hidden
        />
        {chapters.map((ch, i) => (
          <motion.li
            key={`${ch.index}-${ch.status}`}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className={[
              'relative rounded-xl border px-3 py-3 backdrop-blur-sm',
              ch.status === 'current'
                ? 'border-amber-300/50 bg-amber-400/15 shadow-[0_0_24px_rgba(232,163,23,0.25)]'
                : ch.status === 'past'
                  ? 'border-white/15 bg-white/5'
                  : 'border-dashed border-white/15 bg-black/20 opacity-80',
            ].join(' ')}
          >
            <div className="mb-2 flex items-center gap-2">
              <span
                className={[
                  'flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-black',
                  ch.status === 'current'
                    ? 'bg-amber-300 text-navy'
                    : ch.status === 'past'
                      ? 'bg-emerald-400/90 text-navy'
                      : 'bg-white/10 text-white/60',
                ].join(' ')}
              >
                {ch.status === 'future' ? '?' : ch.index + 1}
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">
                  {ch.label}
                  {ch.status === 'current'
                    ? ' · Agora'
                    : ch.status === 'past'
                      ? ' · Vivido'
                      : ' · Futuro'}
                </p>
                <p className="font-display text-sm font-bold leading-tight text-white">
                  {ch.title}
                </p>
              </div>
            </div>
            <p className="text-[11px] leading-snug text-white/65 line-clamp-3">
              {ch.summary}
            </p>
            {ch.week != null ? (
              <p className="mt-2 text-[10px] uppercase tracking-wider text-white/40">
                T{ch.season ?? '?'} · Sem {ch.week}
              </p>
            ) : null}
          </motion.li>
        ))}
      </ol>
    </div>
  )
}
