import { motion } from 'framer-motion'

const RADIUS = 70
const CIRC   = Math.PI * RADIUS

function scoreToColor(score) {
  if (score < 35) return '#10b981' // Secure
  if (score < 65) return '#f59e0b' // Moderate
  return '#ef4444' // High Risk
}

export default function RiskGauge({ score = 0, size = 160 }) {
  const clampedScore = Math.min(Math.max(score, 0), 100)
  const dashOffset   = CIRC - (clampedScore / 100) * CIRC
  const color        = scoreToColor(clampedScore)
  const cx           = size / 2
  const cy           = size * 0.65 // Adjusted center for semi-circle

  return (
    <div className="relative flex items-center justify-center w-full">
      <svg
        viewBox={`0 0 ${size} ${size * 0.85}`}
        width={size}
        className="overflow-visible"
        aria-label={`Risk score: ${clampedScore}`}
      >
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
          <filter id="glow">
             <feGaussianBlur stdDeviation="3" result="blur" />
             <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Track */}
        <path
          d={`M ${cx - RADIUS} ${cy} A ${RADIUS} ${RADIUS} 0 0 1 ${cx + RADIUS} ${cy}`}
          fill="none"
          stroke="var(--border-strong)"
          strokeWidth="14"
          strokeLinecap="round"
          style={{ opacity: 0.3 }}
        />

        {/* Animated fill */}
        <motion.path
          d={`M ${cx - RADIUS} ${cy} A ${RADIUS} ${RADIUS} 0 0 1 ${cx + RADIUS} ${cy}`}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          initial={{ strokeDashoffset: CIRC }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          filter={clampedScore > 70 ? 'url(#glow)' : ''}
        />

        {/* Score label */}
        <motion.text
          x={cx}
          y={cy - 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--text-primary)"
          className="font-headline font-black"
          style={{ fontSize: size * 0.18, letterSpacing: '-0.02em' }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {clampedScore}
        </motion.text>

        <text
          x={cx}
          y={cy + 25}
          textAnchor="middle"
          fill="var(--text-muted)"
          className="font-headline font-bold"
          style={{ fontSize: size * 0.06, letterSpacing: '0.15em', textTransform: 'uppercase' }}
        >
          Risk Factor
        </text>
      </svg>
      
      {clampedScore > 70 && (
        <motion.div 
          className="absolute w-3 h-3 rounded-full bg-red-500 blur-[2px] z-10"
          style={{ top: '15%' }}
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.4, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      )}
    </div>
  )
}
