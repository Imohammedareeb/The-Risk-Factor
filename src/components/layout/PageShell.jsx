import { motion, AnimatePresence } from 'framer-motion'

const PAGE_LABELS = {
  dashboard: 'Overview',
  evaluate:  'Risk Assessment',
  heatmap:   'Sector Analysis',
  emi:       'Financial Planner',
  profile:   'Identity Vault',
  compare:   'Smart Comparison',
  export:    'Reports & Logs',
}

export default function PageShell({ pageKey, children }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 relative bg-[var(--bg-color)] overflow-x-hidden">
      {/* Ambient background blur for Modern Glass effect */}
      <div className="fixed top-[-5%] left-[-5%] w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full filter blur-[120px] animate-blob pointer-events-none" style={{ mixBlendMode: 'var(--blob-blend)' }} />
      <div className="fixed bottom-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-violet-500/10 rounded-full filter blur-[120px] animate-blob animation-delay-2000 pointer-events-none" style={{ mixBlendMode: 'var(--blob-blend)' }} />

      {/* Top progress line animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pageKey + '-bar'}
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-0 left-0 right-0 h-1 origin-left z-20"
          style={{ background: 'linear-gradient(90deg, var(--primary), var(--accent))' }}
        />
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.main
          key={pageKey}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0  }}
          exit={{    opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 px-6 md:px-12 py-10 max-w-screen-2xl mx-auto w-full z-10 relative"
        >
          {children}
        </motion.main>
      </AnimatePresence>

      <div className="px-8 md:px-12 py-10 flex flex-col md:flex-row items-center justify-between z-10 border-t border-[var(--border)] bg-[var(--surface)] transition-colors duration-500">
        <span className="font-headline text-sm font-bold tracking-tight text-[var(--text-secondary)]">
          THE RISK FACTOR <span className="mx-2 opacity-20 text-[var(--text-muted)]">|</span> 2026
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={pageKey}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{    opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
            className="font-headline text-xs font-black uppercase tracking-[0.2em] mt-3 md:mt-0 text-[var(--primary)]"
          >
            {PAGE_LABELS[pageKey] ?? ''}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  )
}
