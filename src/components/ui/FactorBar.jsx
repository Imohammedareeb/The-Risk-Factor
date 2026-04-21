import { motion } from 'framer-motion'

const DIR_CONFIG = {
  positive: { color: 'var(--success)', label: 'OPTIMAL' },
  neutral:  { color: 'var(--warning)', label: 'STABLE'  },
  negative: { color: 'var(--danger)',  label: 'VULNERABLE' },
}

export default function FactorBar({ factor, index = 0 }) {
  const conf     = DIR_CONFIG[factor.direction] ?? DIR_CONFIG.neutral
  const barWidth = Math.abs(factor.weight) * 100

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col gap-3"
    >
      <div className="flex items-end justify-between px-1">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">
            {factor.name}
          </span>
          <span className="font-headline text-lg font-black uppercase tracking-tight text-[var(--text-primary)]">
            {typeof factor.value === 'number' && factor.value > 1000
                ? '₹' + factor.value.toLocaleString('en-IN')
                : String(factor.value).toUpperCase()}
          </span>
        </div>
        <div className="text-right">
           <span
            className="text-[9px] font-black tracking-[0.2em] uppercase px-3 py-1.5 rounded-xl bg-[var(--bg-color)] border border-[var(--border)] shadow-sm"
            style={{ color: conf.color }}
          >
            {conf.label}
          </span>
        </div>
      </div>

      <div
        className="relative h-3 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-inner"
      >
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full shadow-lg"
          style={{ 
            backgroundColor: conf.color,
            boxShadow: `0 0 12px ${conf.color}33`
          }}
          initial={{ width: 0 }}
          animate={{ width: `${barWidth}%` }}
          transition={{ delay: index * 0.05 + 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <div className="flex items-center justify-between opacity-40 group-hover:opacity-100 transition-all duration-300 px-1">
         <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.15em]">
            Model Weighting: <span className="text-[var(--text-primary)]">{(factor.weight * 100).toFixed(0)}%</span>
         </p>
         <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.15em]">
            Net Impact: <span style={{ color: conf.color }}>{factor.impact > 0 ? '+' : ''}{factor.impact?.toFixed ? factor.impact.toFixed(2) : factor.impact}</span>
         </p>
      </div>
    </motion.div>
  )
}
