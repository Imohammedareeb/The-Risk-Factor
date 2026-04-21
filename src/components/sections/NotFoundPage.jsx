import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ShieldAlert, Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color)] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-900 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <ShieldAlert className="text-white w-10 h-10" />
        </div>
        <h1 className="text-6xl font-black text-[var(--primary)] mb-4">404</h1>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Page Not Found</h2>
        <p className="text-[var(--text-secondary)] mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/dashboard"
          className="btn-primary inline-flex items-center gap-2 px-6 py-3"
        >
          <Home size={18} />
          Back to Dashboard
        </Link>
      </motion.div>
    </div>
  )
}
