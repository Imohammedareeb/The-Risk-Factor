import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const ToastContext = createContext({ toast: () => {} })

const ICONS = {
  success: { Icon: CheckCircle, color: '#10b981', bg: '#d1fae5' },
  error:   { Icon: XCircle,     color: '#ef4444', bg: '#ffdad6' },
  warn:    { Icon: AlertTriangle,color: '#f59e0b', bg: '#fff3cd' },
  info:    { Icon: Info,         color: '#4b53bc', bg: '#e0e0ff' },
}

let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ message, type = 'info', duration = 3200 }) => {
    const id = ++idCounter
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  const dismiss = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast stack */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence initial={false}>
          {toasts.map(t => {
            const conf = ICONS[t.type] ?? ICONS.info
            const Icon = conf.Icon
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.92 }}
                animate={{ opacity: 1, y: 0,  scale: 1    }}
                exit={{    opacity: 0, y: 10,  scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-ambient"
                style={{
                  background:   'var(--surface-cl)',
                  minWidth:     '260px',
                  maxWidth:     '360px',
                  border:       `1px solid ${conf.bg}`,
                  boxShadow:    `0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px ${conf.bg}`,
                }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: conf.bg }}>
                  <Icon size={15} style={{ color: conf.color }} />
                </div>
                <p className="font-body text-body-sm flex-1" style={{ color: 'var(--on-surface)' }}>
                  {t.message}
                </p>
                <button
                  onClick={() => dismiss(t.id)}
                  className="w-6 h-6 flex items-center justify-center rounded-md transition-colors duration-150 flex-shrink-0"
                  style={{ color: 'var(--on-surface-variant)' }}
                >
                  <X size={12} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
