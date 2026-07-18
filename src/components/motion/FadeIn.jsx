import { motion, useReducedMotion } from 'framer-motion'
import { fadeIn } from './variants'

/**
 * Fade In — entrada suave de opacidade.
 */
export default function FadeIn({
  children,
  className = '',
  delay = 0,
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

  return (
    <Tag
      className={className}
      variants={fadeIn}
      initial="hidden"
      animate="show"
      transition={{ delay }}
      {...props}
    >
      {children}
    </Tag>
  )
}
