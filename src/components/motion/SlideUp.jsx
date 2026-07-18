import { motion, useReducedMotion } from 'framer-motion'
import { slideUp, staggerContainer } from './variants'

/**
 * Slide Up — entrada de baixo para cima (com stagger opcional).
 */
export default function SlideUp({
  children,
  className = '',
  delay = 0,
  stagger = false,
  once = true,
  as = 'div',
  ...props
}) {
  const reduce = useReducedMotion()
  const Tag = motion[as] ?? motion.div

  if (reduce) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    )
  }

  if (stagger) {
    return (
      <Tag
        className={className}
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once, margin: '-40px' }}
        {...props}
      >
        {children}
      </Tag>
    )
  }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-40px' }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </Tag>
  )
}

/** Item filho para uso dentro de SlideUp stagger */
export function SlideUpItem({ children, className = '', as = 'div', ...props }) {
  const reduce = useReducedMotion()
  const Tag = motion[as] ?? motion.div

  if (reduce) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    )
  }

  return (
    <Tag className={className} variants={slideUp} {...props}>
      {children}
    </Tag>
  )
}
