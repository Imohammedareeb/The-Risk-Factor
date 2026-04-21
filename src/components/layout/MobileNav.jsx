import { motion, AnimatePresence } from 'framer-motion'
import { X, LayoutDashboard, Cpu, Map, Download, Calculator, GitCompare, ShieldCheck } from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle'

const NAV_ITEMS = [
  { label: 'Overview',  id: 'dashboard', Icon: LayoutDashboard },
  { label: 'Assess',    id: 'evaluate',  Icon: Cpu            },
  { label: 'Heatmap',   id: 'heatmap',   Icon: Map            },
  { label: 'Planner',   id: 'emi',       Icon: Calculator     },
  { label: 'Compare',   id: 'compare',   Icon: GitCompare     },
  { label: 'Export',    id: 'export',    Icon: Download       },
]

export default function MobileNav({ isOpen, onClose, activePage, onNavigate }) {
  const handleNav = (id) => {
    onNavigate(id)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="mob-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 z-40 md:hidden bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.aside
            key="mob-drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col md:hidden bg-[var(--surface)] border-r border-[var(--border)] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
                  <ShieldCheck size={20} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="font-headline text-lg font-black tracking-tighter text-[var(--text-primary)]">
                  Risk Factor
                </span>
              </div>
              <motion.button 
                whileTap={{ scale: 0.88 }} 
                onClick={onClose} 
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-color)] border border-[var(--border)] text-[var(--text-muted)]"
              >
                <X size={20} strokeWidth={2.5} />
              </motion.button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
              {NAV_ITEMS.map((item, i) => {
                const isActive = activePage === item.id
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.045, type: 'spring', stiffness: 300, damping: 24 }}
                    onClick={() => handleNav(item.id)}
                    className="flex items-center gap-4 px-5 py-4 rounded-2xl w-full text-left transition-all duration-300"
                    style={{
                      background: isActive ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'transparent',
                      color:      isActive ? '#ffffff' : 'var(--text-secondary)',
                      boxShadow: isActive ? '0 8px 16px -4px rgba(99, 102, 241, 0.3)' : 'none',
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <item.Icon size={18} strokeWidth={isActive ? 3 : 2.5} />
                    <span className="font-headline text-sm font-bold uppercase tracking-widest">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="mob-active"
                        className="ml-auto w-2 h-2 rounded-full bg-white shadow-sm"
                      />
                    )}
                  </motion.button>
                )
              })}
            </nav>

            {/* Footer */}
            <div className="px-6 py-6 border-t border-[var(--border)] flex items-center justify-between bg-[var(--bg-color)]/50">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Interface Mode
              </span>
              <ThemeToggle />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
