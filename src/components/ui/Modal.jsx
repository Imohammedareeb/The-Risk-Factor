import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children, wide = false }) {
  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0, 0, 60, 0.35)', backdropFilter: 'blur(4px)' }}
          />

          {/* Panel */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className={[
              'fixed inset-0 z-50 m-auto overflow-y-auto rounded-[2rem]',
              wide ? 'max-w-5xl' : 'max-w-2xl',
              'max-h-[90vh] flex flex-col',
            ].join(' ')}
            style={{
              height: 'fit-content',
              background: 'var(--surface-solid)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 pt-8 pb-4">
              <h2
                className="font-headline text-2xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                {title}
              </h2>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-color)] border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-muted)]"
                aria-label="Close"
              >
                <X size={20} strokeWidth={2.5} />
              </motion.button>
            </div>

            {/* Divider */}
            <div className="h-px bg-[var(--border)] mx-8 my-2" />

            {/* Body */}
            <div className="px-8 py-6 flex-1 overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
