import { useEffect, useRef, useState } from 'react'
import { animate } from 'framer-motion'

export default function AnimatedCounter({
  value,
  duration = 1.4,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}) {
  const ref   = useRef(null)
  const prev  = useRef(0)

  useEffect(() => {
    const from = prev.current
    const to   = Number(value)
    prev.current = to

    const controls = animate(from, to, {
      duration,
      ease: [0.25, 0.46, 0.45, 0.94],
      onUpdate(v) {
        if (ref.current) {
          ref.current.textContent =
            prefix + v.toFixed(decimals) + suffix
        }
      },
    })
    return () => controls.stop()
  }, [value, duration, prefix, suffix, decimals])

  return (
    <span
      ref={ref}
      className={className}
    >
      {prefix}{Number(value).toFixed(decimals)}{suffix}
    </span>
  )
}
