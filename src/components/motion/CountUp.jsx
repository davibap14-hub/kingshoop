import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion'

/**
 * Count Up — anima números até o valor alvo.
 */
export default function CountUp({
  value = 0,
  duration = 0.9,
  decimals = 0,
  className = '',
  prefix = '',
  suffix = '',
  format,
}) {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-20px' })
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, {
    stiffness: 90,
    damping: 22,
    mass: 0.6,
  })
  const [display, setDisplay] = useState(() => formatNumber(value, decimals, format))

  useEffect(() => {
    if (reduce || !inView) {
      setDisplay(formatNumber(value, decimals, format))
      return
    }
    motionValue.set(0)
    const frame = requestAnimationFrame(() => {
      motionValue.set(Number(value) || 0)
    })
    return () => cancelAnimationFrame(frame)
  }, [value, inView, reduce, motionValue, decimals, format])

  useEffect(() => {
    if (reduce) return undefined
    const unsub = spring.on('change', (v) => {
      setDisplay(formatNumber(v, decimals, format))
    })
    return unsub
  }, [spring, decimals, format, reduce])

  // duration hint — spring is preferred; duration unused except as scale
  void duration

  return (
    <motion.span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </motion.span>
  )
}

function formatNumber(v, decimals, format) {
  if (typeof format === 'function') return format(v)
  const n = Number(v) || 0
  if (decimals <= 0) return String(Math.round(n))
  return n.toFixed(decimals)
}
