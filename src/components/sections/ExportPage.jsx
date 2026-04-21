import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, FileText, CheckCircle, XCircle, AlertTriangle, Eye, Clock, DownloadCloud, AlertCircle, RefreshCw, Users } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import BentoCard from '../ui/BentoCard'
import RiskBadge from '../ui/RiskBadge'
import { dataService } from '../../data/dataService'

function exportCSV(rows, filename) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(','),
    ...rows.map(r =>
      headers.map(h => {
        const v = r[h]
        const s = (v === null || v === undefined) ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v); return s.includes(',') ? `"${s}"` : s
      }).join(',')
    ),
  ].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function ActionIcon({ action }) {
  const cfg = {
    Approved: { icon: CheckCircle,    color: 'var(--success)' },
    Rejected: { icon: XCircle,        color: 'var(--danger)' },
    Flagged:  { icon: AlertTriangle,  color: 'var(--warning)' },
    Reviewed: { icon: Eye,            color: 'var(--accent)' },
    Created:  { icon: FileText,       color: 'var(--primary)' },
  }[action] ?? { icon: Clock, color: 'var(--text-muted)' }
  const Icon = cfg.icon
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner bg-[var(--bg-color)] border border-[var(--border)]">
       <Icon size={18} style={{ color: cfg.color }} strokeWidth={3} />
    </div>
  )
}

function StatBox({ label, value, color, delay }) {
  return (
    <BentoCard delay={delay} className="flex flex-col gap-3 shadow-md !p-6 border-[var(--border)]">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-0.5 border border-[var(--border)] shadow-inner" style={{ background: color + '10' }}>
        <FileText size={16} style={{ color }} strokeWidth={3} />
      </div>
      <div>
         <p className="font-headline text-3xl font-extrabold tracking-tight" style={{ color }}>
          {value}
        </p>
        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mt-1.5">
          {label}
        </p>
      </div>
    </BentoCard>
  )
}

export default function ExportPage() {
  const { toast } = useToast()
  const [filter, setFilter] = useState('All')
  const [downloading, setDownloading] = useState(false)
  const [applicants, setApplicants] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [a, l, m] = await Promise.all([
        dataService.getApplicants(),
        dataService.getAuditLogs(),
        dataService.getPortfolioMetrics()
      ])
      setApplicants(a)
      setAuditLogs(l)
      setMetrics(m)
    } catch (err) {
      console.error('Failed to load export data:', err)
      setError(err.message || 'Ledger Synchronization Failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const FILTERS = ['All', 'Approved', 'Rejected', 'Created', 'Flagged', 'Reviewed']

  const filteredLogs = filter === 'All'
    ? auditLogs
    : auditLogs.filter(l => l.action === filter)

  const handleExportAudit = () => {
    setDownloading(true)
    setTimeout(() => {
      exportCSV(
        filteredLogs.map(l => ({
          'Log ID':       l.id,
          'Application':  l.appId,
          'Action':       l.action,
          'Officer':      l.officer,
          'Timestamp':    new Date(l.timestamp).toLocaleString('en-IN'),
          'Note':         l.note,
        })),
        'rf_audit_log.csv'
      )
      setDownloading(false)
      toast({ message: 'Intelligence Ledger Exported', type: 'success' })
    }, 600)
  }

  const handleExportApplicants = () => {
    exportCSV(
      applicants.map(a => ({
        'App ID':         a.id,
        'Name':           a.name,
        'Age':            a.age,
        'Loan Amount':    a.loanAmount,
        'Income':         a.income,
        'Credit Score':   a.creditScore,
        'Emp. Years':     a.employmentYears,
        'Existing EMI':   a.existingEMI,
        'LTV Ratio':      a.ltvRatio,
        'Sector':         a.sector,
        'Loan Type':      a.loanType,
        'Risk Score':     a.score,
        'Risk Band':      a.band,
        'Status':         a.status,
      })),
      'rf_applicants.csv'
    )
    toast({ message: 'Asset Inventory Exported', type: 'success' })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900/30" />
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        </div>
        <p className="font-headline text-sm font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] animate-pulse">Compiling Ledger...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-500 shadow-lg border border-red-200 dark:border-red-800/30">
           <AlertCircle size={32} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="font-headline text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">System Error</h2>
          <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest max-w-xs mx-auto">{error}</p>
        </div>
        <button onClick={loadData} className="btn-secondary px-8 flex items-center gap-3 uppercase tracking-widest text-[9px] font-black">
           <RefreshCw size={14} strokeWidth={3} /> Re-initialize
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
        <h1 className="display-lg text-[var(--text-primary)] uppercase">
          Audit <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 italic text-3xl">Reports.</span>
        </h1>
        <p className="text-base text-[var(--text-secondary)] mt-1.5 font-medium">
          Export system reports and monitor historical audit logs.
        </p>
      </motion.div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatBox delay={0.1} label="VAULT RECORDS" value={metrics.totalApplications} color="var(--primary)" />
          <StatBox delay={0.2} label="ASSET COMMITS" value={metrics.approvedCount} color="var(--success)" />
          <StatBox delay={0.3} label="TERMINATIONS"  value={metrics.rejectedCount}  color="var(--danger)" />
          <StatBox delay={0.4} label="PENDING AUDIT" value={metrics.pendingCount}  color="var(--warning)" />
        </div>
      )}

      <BentoCard delay={0.5} hoverable={false} className="flex flex-col gap-8 shadow-lg !p-8 border-[var(--border)]">
        <h2 className="font-headline text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter">
          Intelligence Export
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ y: -3, scale: 1.01 }}
            className="flex flex-col md:flex-row items-center justify-between p-6 rounded-[2rem] gap-5 bg-[var(--bg-color)] border border-[var(--border)] shadow-inner group"
          >
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[var(--surface)] text-indigo-500 shadow-md border border-[var(--border)] transition-transform group-hover:rotate-[-5deg]">
                <FileText size={24} strokeWidth={3} />
              </div>
              <div>
                <p className="font-headline text-lg font-black uppercase tracking-tight text-[var(--text-primary)]">
                  Audit Ledger
                </p>
                <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-60">
                  {filteredLogs.length} Records · CSV
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportAudit}
              disabled={downloading}
              className="btn-primary py-3 px-6 rounded-xl w-full md:w-auto shadow-md"
            >
              <DownloadCloud size={18} strokeWidth={3} />
              <span className="font-black uppercase tracking-widest text-[9px] ml-1">Export</span>
            </motion.button>
          </motion.div>

          <motion.div
            whileHover={{ y: -3, scale: 1.01 }}
            className="flex flex-col md:flex-row items-center justify-between p-6 rounded-[2rem] gap-5 bg-[var(--bg-color)] border border-[var(--border)] shadow-inner group"
          >
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[var(--surface)] text-violet-500 shadow-md border border-[var(--border)] transition-transform group-hover:rotate-[-5deg]">
                <Users size={24} strokeWidth={3} />
              </div>
              <div>
                <p className="font-headline text-lg font-black uppercase tracking-tight text-[var(--text-primary)]">
                  Identity Vault
                </p>
                <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-60">
                  {applicants.length} Records · CSV
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportApplicants}
              className="btn-primary py-3 px-6 rounded-xl w-full md:w-auto shadow-md !bg-violet-600 !shadow-violet-500/20"
            >
              <DownloadCloud size={18} strokeWidth={3} />
              <span className="font-black uppercase tracking-widest text-[9px] ml-1">Export</span>
            </motion.button>
          </motion.div>
        </div>
      </BentoCard>

      <BentoCard delay={0.6} hoverable={false} className="flex flex-col gap-8 shadow-lg !p-8 border-[var(--border)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="font-headline text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter">
              Activity Feed
            </h2>
            <p className="text-[9px] font-black text-[var(--text-muted)] mt-1 uppercase tracking-[0.2em]">Real-time system audit timeline</p>
          </div>
          <div className="flex flex-wrap gap-2 bg-[var(--bg-color)] p-2 rounded-2xl border border-[var(--border)] shadow-inner">
            {FILTERS.map(f => (
              <motion.button
                key={f}
                whileTap={{ scale: 0.96 }}
                onClick={() => setFilter(f)}
                className="px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300"
                style={{
                  background: filter === f ? 'var(--surface)' : 'transparent',
                  color:      filter === f ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow:  filter === f ? 'var(--shadow-sm)' : 'none',
                  border:     filter === f ? '1px solid var(--border)' : '1px solid transparent'
                }}
              >
                {f}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 stagger-in">
          {filteredLogs.map((log, i) => {
            const app = applicants.find(a => a.id === log.appId)
            return (
              <motion.div
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-center gap-5 px-6 py-4 rounded-[1.5rem] bg-[var(--surface)] border border-[var(--border)] hover:shadow-lg hover:-translate-y-0.5 transition-all group"
              >
                <div className="flex items-center gap-5 flex-1">
                  <ActionIcon action={log.action} />
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-headline text-base font-black text-[var(--text-primary)] uppercase tracking-tight">
                        {log.appId}
                      </span>
                      <RiskBadge type={log.action} className="!text-[7px] border border-black/5" />
                    </div>
                    {app && (
                      <p className="text-xs font-bold text-[var(--text-secondary)] mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity uppercase tracking-tight">
                        {app.name} <span className="mx-1.5 opacity-20">|</span> {log.note}
                      </p>
                    )}
                  </div>
                </div>
                <div className="sm:text-right flex items-center sm:flex-col gap-5 sm:gap-1 mt-3 sm:mt-0 pl-14 sm:pl-0 border-t sm:border-t-0 border-[var(--border)] pt-3 sm:pt-0">
                  <p className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">
                    {log.officer}
                  </p>
                  <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] opacity-60">
                    {new Date(log.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            )
          })}

          {filteredLogs.length === 0 && (
            <div className="py-20 flex flex-col items-center opacity-30 bg-[var(--bg-color)] rounded-[2.5rem] border-4 border-dashed border-[var(--border)] shadow-inner">
               <CheckCircle size={40} className="text-[var(--text-muted)] mb-4" strokeWidth={2.5} />
               <p className="font-headline text-lg font-black text-[var(--text-primary)] uppercase tracking-widest">Protocol Verified</p>
            </div>
          )}
        </div>
      </BentoCard>
    </div>
  )
}
