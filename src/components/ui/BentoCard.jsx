import { motion } from 'framer-motion'

export default function BentoCard({
  children,
  className = '',
  hoverable = true,
  elevated = false,
  span = '',
  onClick,
  style,
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={
        hoverable
          ? {
              y: -4,
              scale: 1.005,
              boxShadow: 'var(--shadow-ambient)',
              transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
            }
          : undefined
      }
      onClick={onClick}
      style={style}
      className={[
        'bento-card', // Use the pre-defined CSS class
        onClick ? 'cursor-pointer' : '',
        span,
        className,
      ].join(' ')}
    >
      {children}
    </motion.div>
  )
}
