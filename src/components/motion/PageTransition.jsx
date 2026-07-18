import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { pageTransition } from './variants'

/**
 * Transição de página — Fade + Slide Up no conteúdo da rota.
 */
export default function PageTransition({ children, routeKey, className = '' }) {
  const reduce = useReducedMotion()

  if (reduce) {
    return (
      <div key={routeKey} className={className}>
        {children}
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={routeKey}
        className={className}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
