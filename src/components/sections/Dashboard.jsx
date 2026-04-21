import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Users, AlertTriangle,
  CheckCircle, Clock, ArrowRight, Zap,
} from 'lucide-react'

import BentoCard from '../ui/BentoCard'
import RiskBadge from '../ui/RiskBadge'
import AnimatedCounter from '../ui/AnimatedCounter'
import FactorBar from '../ui/FactorBar'
import Modal from '../ui/Modal'
import RiskGauge from '../ui/RiskGauge'
import { dataService } from '../../data/dataService'
import { getRiskColor, formatCurrency } from '../../data/riskEngine'

// FIX: Generate real trend data from actual applicant submission timestamps
// Previously imported hardcoded mockData — now computed dynamically
function buildTrendData(applicants) {
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now = new Date()
  // Build last 6 months window
  const buckets = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    return { month: MONTHS[d.getMonth()], year: d.getFullYear(), monthNum: d.getMonth(), applications: 0, approvals: 0, npaRate: 0 }
  })
  applicants.forEach(app => {
    const d = new Date(app.submittedAt)
    const bucket = buckets.find(b => b.monthNum === d.getMonth() && b.year === d.getFullYear())
    if (bucket) {
      bucket.applications++
      if (app.status === 'approved') bucket.approvals++
      if (app.status === 'rejected') bucket.npaRate++
    }
  })
  return buckets.map(b => ({
    month: b.month,
    applications: b.applications,
    approvals: b.approvals,
    npaRate: b.applications > 0 ? parseFloat(((b.npaRate / b.applications) * 100).toFixed(1)) : 0
  }))
}
import { useTheme } from '../../context/ThemeContext'

const QUICK_ACTIONS = [
  { label: 'Assess',     sub: 'Risk Model',               path: '/evaluate', color: 'var(--primary)', icon: <Zap size={18} /> },
  { label: 'Planner',    sub: 'EMI Schedule',             path: '/emi',      color: 'var(--success)', icon: '🧮' },
  { label: 'Compare',    sub: 'Side-by-Side',             path: '/compare',  color: 'var(--warning)', icon: '⚖️'  },
  { label: 'Heatmap',    sub: 'Industry Matrix',          path: '/heatmap',  color: 'var(--danger)',  icon: '🔥' },
]

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-panel rounded-xl px-4 py-3 text-sm shadow-xl border border-[var(--border)] bg-[var(--surface)]">
      <p className="font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider text-[9px]">
        {label}
      </p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-bold uppercase text-[10px]">
          {p.name}: <span className="text-[var(--text-primary)] text-xs">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

function MetricTile({ label, value, sub, icon: Icon, trend, color, delay }) {
  return (
    <BentoCard delay={delay} className="flex flex-col gap-4 !p-6 shadow-sm border-[var(--border)]">
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner border border-[var(--border)]"
          style={{ background: color + '15' }}
        >
          <Icon size={20} style={{ color }} strokeWidth={2.5} />
        </div>
        {trend && (
          <span className={`font-bold text-[9px] uppercase tracking-wider flex items-center gap-0.5 px-2 py-1 rounded-lg border ${trend > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'}`}>
            {trend > 0 ? <TrendingUp size={10} strokeWidth={3} /> : <TrendingDown size={10} strokeWidth={3} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <div className="font-headline text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
          {value}
        </div>
        <p className="font-bold text-[10px] mt-1 text-[var(--text-muted)] uppercase tracking-widest">
          {label}
        </p>
        {sub && (
          <p className="text-[9px] mt-1 text-[var(--text-muted)] font-semibold uppercase tracking-wider opacity-60">
            {sub}
          </p>
        )}
      </div>
    </BentoCard>
  )
}

function ApplicantRow({ app, onClick, index }) {
  const colors = getRiskColor(app.band)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.03 * index, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onClick(app)}
      className="flex items-center justify-between px-6 py-4 rounded-2xl cursor-pointer transition-all duration-300 group mb-2 bg-[var(--surface)] border border-[var(--border)] shadow-sm hover:shadow-md hover:border-[var(--primary)]"
    >
      <div className="flex items-center gap-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center font-headline font-black text-sm flex-shrink-0 shadow-inner"
          style={{
            background: app.band === 'high' ? 'var(--danger-bg)' : app.band === 'medium' ? 'var(--warning-bg)' : 'var(--success-bg)',
            color:      app.band === 'high' ? 'var(--danger)' : app.band === 'medium' ? 'var(--warning)' : 'var(--success)',
          }}
        >
          {app.name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </div>
        <div>
          <p className="font-headline text-sm font-bold tracking-tight text-[var(--text-primary)] uppercase">
            {app.name}
          </p>
          <p className="text-[9px] font-bold text-[var(--text-muted)] mt-0.5 uppercase tracking-wider">
            {app.id} <span className="mx-1 opacity-20">|</span> {app.loanType}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right hidden sm:block">
          <p className="font-headline text-sm font-bold text-[var(--text-primary)]">
            {formatCurrency(app.loanAmount)}
          </p>
          <p className="text-[8px] font-black text-[var(--text-muted)] mt-0.5 uppercase tracking-wider">
            Exposure
          </p>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center font-headline font-black text-base flex-shrink-0 border border-black/5"
          style={{ background: colors.bg.replace('bg-', ''), color: colors.dot }}
        >
          {app.score}
        </div>
        <RiskBadge type={app.band} className="!text-[8px] !px-3 !py-1.5" />
        <ArrowRight size={16} strokeWidth={3} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
      </div>
    </motion.div>
  )
}

function HighRiskBanner({ app, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 25 }}
      onClick={() => onClick(app)}
      className="flex items-center gap-5 px-6 py-4 rounded-2xl cursor-pointer shadow-md border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 relative overflow-hidden group"
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(239, 68, 68, 0.12)' }}
    >
      <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
      <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0 border border-red-200 dark:border-red-800/30">
         <AlertTriangle size={20} className="text-red-600 dark:text-red-500" strokeWidth={3} />
      </div>
      <div className="flex-1">
        <p className="font-black text-red-600 dark:text-red-500 text-[8px] tracking-widest uppercase mb-0.5">Critical Surveillance</p>
        <p className="text-xs font-semibold text-[var(--text-primary)]">
          <strong className="font-bold uppercase">{app.name}</strong> ({app.id}) — Flagged with <span className="text-red-600 font-black italic">{app.score}%</span> Risk.
        </p>
      </div>
      <ArrowRight size={18} className="text-red-500 flex-shrink-0 transition-transform group-hover:translate-x-1" strokeWidth={3} />
    </motion.div>
  )
}

function ApplicantModal({ app, onClose }) {
  if (!app) return null
  return (
    <Modal isOpen={!!app} onClose={onClose} title={`${app.name.toUpperCase()} ASSESSMENT`} wide>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-5 py-8 rounded-[2rem] bg-[var(--bg-color)] border border-[var(--border)] shadow-inner">
            <RiskGauge score={app.score} size={200} />
            <div className="flex gap-2">
               <RiskBadge type={app.band} className="!text-[9px] !px-4 !py-2" />
               <RiskBadge type={app.status} className="!text-[9px] !px-4 !py-2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Amount',       value: formatCurrency(app.loanAmount) },
              { label: 'Yield',        value: formatCurrency(app.income)     },
              { label: 'CIBIL',        value: app.creditScore                },
              { label: 'Maturity',     value: app.employmentYears + ' YRS'   },
              { label: 'EMI',          value: formatCurrency(app.existingEMI)},
              { label: 'LTV Quotient', value: (app.ltvRatio * 100).toFixed(0) + '%' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)] shadow-sm">
                <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                  {label}
                </p>
                <p className="font-headline text-base font-black mt-1 text-[var(--text-primary)]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h3 className="font-headline text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">
              AI Insight Matrix
            </h3>
            <p className="text-[9px] font-bold text-[var(--text-muted)] mt-1 uppercase tracking-widest">
              Explainable Risk Attribution
            </p>
          </div>
          <div className="flex flex-col gap-6 mt-1">
            {app.factors.map((f, i) => (
              <FactorBar key={f.name} factor={f} index={i} />
            ))}
          </div>

          <div className="mt-auto p-6 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-lg relative overflow-hidden border border-white/10">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2 opacity-60 text-center">
              System Verdict
            </p>
            <p className="font-headline text-2xl font-black italic tracking-tighter text-center">
              {app.recommendation === 'Approve' ? 'PROCEED' : app.recommendation === 'Review' ? 'AUDIT REQ.' : 'TERMINATE'}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [selectedApp, setSelectedApp] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [applicants, setApplicants] = useState([])
  const [trendData, setTrendData] = useState([])
  const [loading, setLoading] = useState(true)

  const isDark = theme === 'dark'
  const gridColor = 'var(--chart-grid)'
  const axisColor = 'var(--chart-axis)'

  useEffect(() => {
    async function loadData() {
      try {
        const [m, a] = await Promise.all([
          dataService.getPortfolioMetrics(),
          dataService.getApplicants()
        ])
        setMetrics(m)
        setApplicants(a)
        setTrendData(buildTrendData(a))
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900/30" />
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        </div>
        <p className="font-headline text-sm font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] animate-pulse">Syncing Briefing...</p>
      </div>
    )
  }

  const highRisk = applicants.filter(a => a.band === 'high')

  return (
    <div className="flex flex-col gap-10">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
           <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--primary)] mb-2">Portfolio Intelligence</p>
          <h1 className="display-lg text-[var(--text-primary)] uppercase">
            Risk <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 italic">Command.</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 bg-[var(--surface)] px-4 py-2.5 rounded-xl shadow-sm border border-[var(--border)] transition-colors">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-primary)]">
            AI Engine Secure
          </span>
        </div>
      </motion.div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {QUICK_ACTIONS.map((qa, i) => (
          <motion.button
            key={qa.path}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(qa.path)}
            className="bento-card flex flex-col items-start gap-4 text-left shadow-sm !p-6 group border-[var(--border)]"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-color)] flex items-center justify-center text-lg shadow-inner border border-[var(--border)] transition-colors group-hover:border-[var(--primary)] group-hover:text-[var(--primary)]">
              {qa.icon}
            </div>
            <div>
              <p className="font-headline text-base font-black uppercase tracking-tight text-[var(--text-primary)]">
                {qa.label}
              </p>
              <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5 opacity-60">
                {qa.sub}
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* High-risk alerts */}
      {highRisk.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-headline text-[10px] font-black text-red-500 uppercase tracking-[0.25em] ml-1">Priority Surveillance</h2>
          {highRisk.slice(0, 2).map(a => (
            <HighRiskBanner key={a.id} app={a} onClick={setSelectedApp} />
          ))}
        </div>
      )}

      {/* Metric tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricTile
          delay={0.1}
          label="Vault Records"
          value={<AnimatedCounter value={metrics.totalApplications} />}
          sub="Indexed Intelligence"
          icon={Users}
          color="var(--text-primary)"
          trend={12.4}
        />
        <MetricTile
          delay={0.2}
          label="NPA Quotient"
          value={<><AnimatedCounter value={metrics.npaRate} decimals={1} />%</>}
          sub="Default Potential"
          icon={TrendingDown}
          color="var(--success)"
          trend={-0.9}
        />
        <MetricTile
          delay={0.3}
          label="Asset Commits"
          value={<AnimatedCounter value={metrics.approvedCount} />}
          sub={`${((metrics.approvedCount / metrics.totalApplications) * 100).toFixed(0)}% Yield Rate`}
          icon={CheckCircle}
          color="var(--primary)"
        />
        <MetricTile
          delay={0.4}
          label="Audit Queue"
          value={<AnimatedCounter value={metrics.pendingCount} />}
          sub="Review Required"
          icon={Clock}
          color="var(--warning)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BentoCard
          delay={0.5}
          span="lg:col-span-2"
          className="flex flex-col gap-8 shadow-sm border-[var(--border)]"
        >
          <div>
             <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--primary)] mb-1">Actuarial Flow</p>
            <h2 className="font-headline text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter">
              Application <span className="opacity-20 italic">Trends.</span>
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0}  />
                </linearGradient>
                <linearGradient id="gradApprv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--success)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--success)" stopOpacity={0.0}  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke={gridColor} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 9, fontWeight: 800, fill: axisColor, textTransform: 'uppercase' }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fontSize: 9, fontWeight: 800, fill: axisColor }} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--primary)', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="applications" name="Aggregate" stroke="var(--primary)" strokeWidth={3} fill="url(#gradApps)" activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--primary)' }} />
              <Area type="monotone" dataKey="approvals"    name="Commits"    stroke="var(--success)" strokeWidth={3} fill="url(#gradApprv)" activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--success)' }} />
            </AreaChart>
          </ResponsiveContainer>
        </BentoCard>

        <BentoCard
          delay={0.6}
          className="flex flex-col gap-8 shadow-sm border-[var(--border)]"
        >
          <div>
             <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--success)] mb-1">Composite Status</p>
            <h2 className="font-headline text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter">
              Yield <span className="opacity-20 italic">Index.</span>
            </h2>
          </div>
          <div className="flex flex-col items-center justify-center flex-1 py-2">
            <span className="font-headline text-6xl font-black text-[var(--success)] tracking-tighter">
              <AnimatedCounter value={metrics.npaRate} decimals={1} suffix="%" />
            </span>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--text-muted)] mt-2">Stability Rating</p>
          </div>
          <ResponsiveContainer width="100%" height={120} className="mt-auto">
            <BarChart data={trendData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 9, fontWeight: 800, fill: axisColor, textTransform: 'uppercase' }} axisLine={false} tickLine={false} dy={8} />
              <YAxis hide domain={[0, 10]} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: gridColor, opacity: 0.4 }} />
              <Bar dataKey="npaRate" name="NPA %" fill="var(--success)" radius={[6, 6, 6, 6]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </BentoCard>
      </div>

      <BentoCard
        delay={0.7}
        className="flex flex-col gap-8 shadow-sm border-[var(--border)]"
      >
        <div className="flex items-center justify-between mb-2">
          <div>
             <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--primary)] mb-1">Active Monitoring</p>
            <h2 className="font-headline text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter">
              Asset <span className="opacity-20 italic">Pipeline.</span>
            </h2>
          </div>
          <span className="text-[9px] font-black px-4 py-2 rounded-xl bg-[var(--bg-color)] text-[var(--primary)] border border-[var(--border)] shadow-inner uppercase tracking-widest">
            {applicants.length} Records
          </span>
        </div>

        {applicants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center border-2 border-dashed border-[var(--border)] rounded-[2.5rem] bg-[var(--bg-color)] shadow-inner">
            <div className="w-16 h-16 rounded-[1.25rem] bg-[var(--surface)] flex items-center justify-center mb-4 shadow-sm border border-[var(--border)]">
              <Users size={32} className="text-[var(--text-muted)] opacity-50" strokeWidth={2.5} />
            </div>
            <h3 className="font-headline text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Vault Empty</h3>
            <p className="text-xs font-bold mt-2 mb-8 max-w-xs text-[var(--text-muted)] uppercase tracking-widest opacity-60">
              No credit identities detected in briefing.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/evaluate')}
              className="btn-primary px-10"
            >
              Run Assessment
            </motion.button>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {applicants.map((app, i) => (
              <ApplicantRow
                key={app.id}
                app={app}
                index={i}
                onClick={setSelectedApp}
              />
            ))}
          </div>
        )}
      </BentoCard>

      <ApplicantModal app={selectedApp} onClose={() => setSelectedApp(null)} />
    </div>
  )
}
