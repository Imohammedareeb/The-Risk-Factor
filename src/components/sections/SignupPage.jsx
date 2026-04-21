import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth, validateEmail, validatePassword, validateName } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { ShieldCheck, UserPlus, Mail, Lock, User, Loader2, Eye, EyeOff, CheckCircle2, ChevronRight } from 'lucide-react'

function PasswordStrength({ password }) {
  if (!password) return null
  const checks = [
    { label: '8+ Chars', ok: password.length >= 8 },
    { label: 'Uppercase', ok: /[A-Z]/.test(password) },
    { label: 'Numeric', ok: /[0-9]/.test(password) },
  ]
  const score = checks.filter(c => c.ok).length
  const colors = ['bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-emerald-500']
  return (
    <div className="mt-3 flex flex-col gap-2.5">
      <div className="flex gap-1.5 h-1.5">
        {[0,1,2].map(i => (
          <div key={i} className={`flex-1 rounded-full transition-all duration-500 ${i < score ? colors[score] : 'bg-slate-200 dark:bg-slate-700'}`} />
        ))}
      </div>
      <div className="flex gap-4">
        {checks.map(c => (
          <span key={c.label} className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${c.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
            <CheckCircle2 size={12} strokeWidth={3} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function SignupPage() {
  const [name, setName]                 = useState('')
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [confirmPassword, setConfirm]   = useState('')
  const [showPwd, setShowPwd]           = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [error, setError]               = useState('')
  const [fieldErrors, setFieldErrors]   = useState({})
  const { signup, loading } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const errs = {}
    const nameErr = validateName(name)
    if (nameErr) errs.name = nameErr
    if (!validateEmail(email)) errs.email = 'Invalid email format'
    const pwdErr = validatePassword(password)
    if (pwdErr) errs.password = pwdErr
    if (password !== confirmPassword) errs.confirm = 'Passwords do not match'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    try {
      await signup(email, password, name, confirmPassword)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    }
  }

  const Field = ({ id, label, icon: Icon, type, value, onChange, onBlur, showToggle, show, onToggle, placeholder, error: fieldErr, autoComplete }) => (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">{label}</label>
      <div className="relative group">
        <input
          id={id}
          type={showToggle ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`rf-input ${fieldErr ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
        />
        {showToggle ? (
          <button type="button" onClick={onToggle} tabIndex={-1}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
            {show ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
          </button>
        ) : (
          <Icon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        )}
      </div>
      {fieldErr && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">{fieldErr}</p>}
    </div>
  )

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
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-[1.25rem] flex items-center justify-center shadow-lg">
              <UserPlus className="text-white w-7 h-7" strokeWidth={2.5} />
            </div>
            <div>
               <h1 className="font-headline text-3xl font-extrabold text-[var(--text-primary)]">Create Account</h1>
               <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">Join Risk Factor today</p>
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <Field
            id="name" label="Full Name" icon={User} type="text"
            value={name} onChange={e => { setName(e.target.value); setFieldErrors(p => ({...p, name:''})) }}
            placeholder="John Doe" error={fieldErrors.name} autoComplete="name"
          />
          <Field
            id="email" label="Email Address" icon={Mail} type="email"
            value={email} onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({...p, email:''})) }}
            placeholder="name@company.com" error={fieldErrors.email} autoComplete="email"
          />
          <div className="flex flex-col">
            <Field
              id="password" label="Password" icon={Lock} type="password"
              value={password} onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({...p, password:''})) }}
              showToggle show={showPwd} onToggle={() => setShowPwd(!showPwd)}
              placeholder="••••••••" error={fieldErrors.password} autoComplete="new-password"
            />
            <PasswordStrength password={password} />
          </div>
          <Field
            id="confirm" label="Confirm Password" icon={Lock} type="password"
            value={confirmPassword} onChange={e => { setConfirm(e.target.value); setFieldErrors(p => ({...p, confirm:''})) }}
            showToggle show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)}
            placeholder="••••••••" error={fieldErrors.confirm} autoComplete="new-password"
          />

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary w-full py-4 rounded-2xl mt-4 justify-center text-base"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <span className="flex items-center gap-2 font-bold">
                Sign Up <ChevronRight size={18} strokeWidth={3} />
              </span>
            )}
          </motion.button>
        </form>

        <div className="mt-8 pt-6 border-t border-[var(--border-strong)]">
          <p className="text-center text-sm font-semibold text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors ml-1">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
