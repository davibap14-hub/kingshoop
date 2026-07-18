import { motion, useReducedMotion } from 'framer-motion'
import { getThemeArt } from './themeArt'

/**
 * Imagem ilustrativa da cena — composição CSS estilo cinematic card.
 */
export default function StoryIllustration({
  themeId,
  title,
  chapterLabel,
  className = '',
}) {
  const art = getThemeArt(themeId)
  const reduce = useReducedMotion()

  return (
    <div
      className={[
        'relative h-[200px] overflow-hidden sm:h-[240px]',
        className,
      ].join(' ')}
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${art.from} 0%, ${art.via} 48%, ${art.to} 100%)`,
        }}
      />

      {/* Arena / depth */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 50% 100%, ${art.accent}66, transparent 60%),
            radial-gradient(circle at 20% 30%, rgba(255,255,255,0.12), transparent 35%)
          `,
        }}
      />

      {/* Court lines */}
      <div
        className="absolute inset-x-0 bottom-0 h-[55%] opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.25) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
          transform: 'perspective(320px) rotateX(55deg)',
          transformOrigin: 'center bottom',
        }}
      />

      {/* Silhuetas de elenco */}
      <motion.div
        className="absolute bottom-6 left-[12%] flex items-end gap-3"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <Silhouette tall accent={art.accent} />
        <Silhouette accent={art.accent} />
        <Silhouette tall wide accent={art.accent} />
      </motion.div>

      <motion.div
        className="absolute right-[10%] top-[18%] h-24 w-24 rounded-full border-2 opacity-30 sm:h-32 sm:w-32"
        style={{ borderColor: art.accent }}
        animate={
          reduce
            ? undefined
            : { scale: [1, 1.06, 1], opacity: [0.25, 0.4, 0.25] }
        }
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-5 pb-4 pt-16">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">
          {art.caption}
          {chapterLabel ? ` · ${chapterLabel}` : ''}
        </p>
        <p className="mt-1 line-clamp-2 font-display text-lg font-bold text-white/90 sm:text-xl">
          {title}
        </p>
      </div>
    </div>
  )
}

function Silhouette({ tall, wide, accent }) {
  return (
    <div
      className={[
        'rounded-t-full bg-black/45 shadow-lg ring-1 ring-white/10',
        tall ? 'h-28 w-10 sm:h-32 sm:w-11' : 'h-24 w-9 sm:h-28 sm:w-10',
        wide ? 'w-12 sm:w-14' : '',
      ].join(' ')}
      style={{
        background: `linear-gradient(180deg, ${accent}33, rgba(0,0,0,0.55))`,
      }}
    />
  )
}
