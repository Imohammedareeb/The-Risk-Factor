import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth, validateEmail } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { ShieldCheck, Mail, Lock, Loader2, Eye, EyeOff, ChevronRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [error, setError]       = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const errs = {}
    if (!email) errs.email = 'Email required'
    else if (!validateEmail(email)) errs.email = 'Invalid email format'
    if (!password) errs.password = 'Password required'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color)] p-6 relative overflow-hidden">
      {/* Ambient background blur for Glassmorphism effect */}
      <div className="fixed top-[0%] left-[-10%] w-96 h-96 bg-[var(--primary)] rounded-full filter blur-[128px] opacity-30 animate-blob pointer-events-none" style={{ mixBlendMode: 'var(--blob-blend)' }} />
      <div className="fixed bottom-[-10%] right-[-10%] w-96 h-96 bg-[var(--accent)] rounded-full filter blur-[128px] opacity-30 animate-blob animation-delay-2000 pointer-events-none" style={{ mixBlendMode: 'var(--blob-blend)' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-lg w-full bento-card relative z-10"
      >
        <div className="flex flex-col gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-[1.25rem] flex items-center justify-center shadow-lg">
              <ShieldCheck className="text-white w-7 h-7" strokeWidth={2.5} />
            </div>
            <div>
               <h1 className="font-headline text-3xl font-extrabold text-[var(--text-primary)]">Welcome Back</h1>
               <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">Sign in to Risk Factor</p>
            </div>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-8 text-sm font-semibold flex items-center gap-3 border border-red-200 dark:border-red-900/50"
          >
            <ShieldCheck size={18} strokeWidth={2.5} />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative group">
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({...p, email: ''})) }}
                className={`rf-input ${fieldErrors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                placeholder="name@company.com"
                autoComplete="email"
              />
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            </div>
            {fieldErrors.email && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">{fieldErrors.email}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">Password</label>
            <div className="relative group">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({...p, password: ''})) }}
                className={`rf-input ${fieldErrors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPwd ? <EyeOff size={20} strokeWidth={2} /> : <Eye size={20} strokeWidth={2} />}
              </button>
            </div>
            {fieldErrors.password && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">{fieldErrors.password}</p>}
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary w-full py-4 rounded-2xl mt-4 justify-center text-base"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <span className="flex items-center gap-2 font-bold">
                Sign In <ChevronRight size={18} strokeWidth={3} />
              </span>
            )}
          </motion.button>
        </form>

        <div className="mt-10 pt-8 border-t border-[var(--border-strong)] flex flex-col gap-6">
          <p className="text-center text-sm font-semibold text-[var(--text-secondary)]">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors ml-1">
              Sign up
            </Link>
          </p>

          <div className="p-5 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border-strong)] shadow-sm">
            <p className="text-xs text-[var(--text-muted)] text-center font-medium leading-relaxed">
               <span className="font-bold">Demo Credentials:</span><br/>
               <span className="text-indigo-600 dark:text-indigo-400 font-bold">admin@riskguard.com</span> / <span className="text-indigo-600 dark:text-indigo-400 font-bold">password123</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
