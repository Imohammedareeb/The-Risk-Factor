import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Shield, Calendar, Save, Loader2, Key, Activity, Fingerprint, ChevronRight, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import BentoCard from '../ui/BentoCard'

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  // FIX: Derive createdAt from user object (stored in localStorage from signup)
  // Falls back gracefully if not present
  const createdDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
    : 'N/A'

  // FIX: handleUpdate now shows a meaningful message since fields are read-only by design
  // A proper edit flow would require a password-protected field unlock
  const handleUpdate = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      // Inform the user that credentials are read-only and explain why
      toast({ message: 'Profile is read-only. Contact admin to update credentials.', type: 'info' })
    }, 800)
  }

  if (!user) return null

  return (
    <div className="flex flex-col gap-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
        <h1 className="display-lg text-[var(--text-primary)]">
          Identity <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 italic">Vault.</span>
        </h1>
        <p className="text-base text-[var(--text-secondary)] mt-1.5 font-medium">
          Manage your sovereign credentials and institutional access clearance.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: ID Card */}
        <div className="lg:col-span-1 flex flex-col gap-6">
           <BentoCard hoverable={false} className="flex flex-col items-center gap-6 !p-8 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-violet-600" />
              <div className="relative">
                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-violet-700 flex items-center justify-center text-white text-3xl font-black shadow-xl border-4 border-white/20">
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="absolute bottom-[-2px] right-[-2px] w-8 h-8 rounded-xl bg-emerald-500 border-4 border-[var(--surface)] flex items-center justify-center text-white shadow-lg">
                   <Shield size={14} strokeWidth={3} />
                </div>
              </div>

              <div className="text-center flex flex-col gap-1">
                <h2 className="font-headline text-2xl font-black uppercase tracking-tighter text-[var(--text-primary)]">{user.name}</h2>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--bg-color)] border border-[var(--border)] self-center shadow-inner">
                   <Fingerprint size={12} className="text-indigo-500" strokeWidth={3} />
                   <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-primary)]">{user.id}</span>
                </div>
              </div>

              <div className="w-full flex flex-col gap-2.5 pt-5 border-t border-[var(--border)]">
                 <div className="flex items-center justify-between px-1">
                    <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Clearance</span>
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-500/20">Active</span>
                 </div>
                 <div className="flex items-center justify-between px-1">
                    <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Protocol</span>
                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-500/20">{user.role || 'Analyst'}</span>
                 </div>
              </div>
           </BentoCard>

           <BentoCard delay={0.2} hoverable={false} className="flex flex-col gap-5 shadow-sm !p-6">
              <h3 className="font-headline text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.25em] mb-1">Security Manifest</h3>
              <div className="flex flex-col gap-3">
                 {[
                   { label: 'Session Integrity', ok: true },
                   { label: 'Vault Encryption',  ok: true },
                   { label: 'Surveillance Active', ok: true },
                 ].map(item => (
                   <div key={item.label} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-lg bg-emerald-500 flex items-center justify-center shadow-sm">
                         <CheckCircle size={10} color="#fff" strokeWidth={4} />
                      </div>
                      <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{item.label}</span>
                   </div>
                 ))}
              </div>
           </BentoCard>
        </div>

        {/* Right Column: Details Form */}
        <div className="lg:col-span-2 flex flex-col gap-6">
           <BentoCard delay={0.1} hoverable={false} className="flex flex-col gap-8 shadow-lg !p-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-inner">
                   <Activity size={20} strokeWidth={3} />
                </div>
                <h2 className="font-headline text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter">
                  System Clearance
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-in">
                <div className="flex flex-col gap-2">
                   <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1">Identity Display</label>
                   <div className="relative group">
                      <input readOnly value={user.name} className="rf-input !bg-[var(--bg-color)] opacity-60 cursor-not-allowed font-black uppercase tracking-tight !py-3" />
                      <User size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" strokeWidth={2.5} />
                   </div>
                </div>

                <div className="flex flex-col gap-2">
                   <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1">Communication Channel</label>
                   <div className="relative group">
                      <input readOnly value={user.email} className="rf-input !bg-[var(--bg-color)] opacity-60 cursor-not-allowed font-black !py-3" />
                      <Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" strokeWidth={2.5} />
                   </div>
                </div>

                <div className="flex flex-col gap-2">
                   <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1">Assigned Role</label>
                   <div className="relative group">
                      <input readOnly value={user.role || 'Risk Analyst'} className="rf-input !bg-[var(--bg-color)] opacity-60 cursor-not-allowed font-black uppercase tracking-widest text-[10px] !py-3" />
                      <Shield size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" strokeWidth={2.5} />
                   </div>
                </div>

                {/* FIX: Use real createdAt from user object instead of hardcoded "19 APR 2026" */}
                <div className="flex flex-col gap-2">
                   <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1">Identity Created</label>
                   <div className="relative group">
                      <input readOnly value={createdDate} className="rf-input !bg-[var(--bg-color)] opacity-60 cursor-not-allowed font-black uppercase tracking-widest text-[10px] !py-3" />
                      <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" strokeWidth={2.5} />
                   </div>
                </div>
              </div>

              <div className="h-px bg-[var(--border)] w-full opacity-40" />

              <div className="flex flex-col gap-2">
                 <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1 text-indigo-500">Credential Protocol</label>
                 {/* FIX: "Rotate Security Credentials" now shows a descriptive toast instead of silent no-op */}
                 <motion.button
                   whileHover={{ scale: 1.02, y: -1 }}
                   whileTap={{ scale: 0.98 }}
                   onClick={() => toast({ message: 'Password change: Contact your system administrator.', type: 'info' })}
                   className="btn-secondary flex items-center justify-between px-6 py-4 border-2 border-indigo-100 dark:border-indigo-900/30 group !rounded-2xl"
                 >
                    <span className="flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                       <Key size={16} className="text-indigo-500 group-hover:rotate-45 transition-transform" strokeWidth={3} />
                       Rotate Security Credentials
                    </span>
                    <ChevronRight size={18} className="opacity-40" strokeWidth={3} />
                 </motion.button>
              </div>

              <div className="pt-4">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpdate}
                  disabled={saving}
                  className="btn-primary w-full py-4 text-xs font-black uppercase tracking-[0.3em] shadow-xl flex items-center justify-center gap-3"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save size={18} strokeWidth={3} /> Synchronize Profile</>}
                </motion.button>
              </div>
           </BentoCard>
        </div>

      </div>
    </div>
  )
}
