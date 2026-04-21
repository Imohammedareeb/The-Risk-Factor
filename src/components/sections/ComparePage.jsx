import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Cell,
} from 'recharts'
import { Check, AlertTriangle, GitCompare } from 'lucide-react'
import BentoCard from '../ui/BentoCard'
import RiskBadge from '../ui/RiskBadge'
import RiskGauge from '../ui/RiskGauge'
import { dataService } from '../../data/dataService'
import { formatCurrency } from '../../data/riskEngine'
import { useTheme } from '../../context/ThemeContext'

function toRadar(app) {
  if (!app) return []
  return [
    { axis: 'CREDIT',    value: Math.round((app.creditScore / 900) * 100) },
    { axis: 'YIELD',     value: Math.min(100, Math.round((app.income / 200000) * 100)) },
    { axis: 'STABILITY', value: Math.min(100, Math.round((app.employmentYears / 20) * 100)) },
    { axis: 'LTV SAFE',  value: Math.round((1 - app.ltvRatio) * 100) },
    { axis: 'EMI RATIO', value: Math.round((1 - app.existingEMI / app.income) * 100) },
    { axis: 'SAFETY',    value: 100 - app.score },
  ]
}

const COLORS = { A: 'var(--primary)', B: 'var(--accent)' }

function CompareTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-panel rounded-xl px-4 py-3 shadow-xl border border-[var(--border)] bg-[var(--surface)]">
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color ?? 'var(--text-primary)' }} className="font-black uppercase tracking-widest text-[9px] mb-0.5 last:mb-0">
          {p.name}: <span className="text-[var(--text-primary)] text-xs ml-2">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

// FIX: Added missing ChartTooltip component that was causing a runtime crash → blank page
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-panel rounded-xl px-4 py-3 shadow-xl border border-[var(--border)] bg-[var(--surface)]">
      <p className="font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest text-[10px]">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-black text-xs uppercase tracking-tight">
          {p.name}: <span className="text-[var(--text-primary)] text-sm ml-2">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

function StatRow({ label, valA, valB, higherIsBetter = true, format = v => v }) {
  const numA  = typeof valA === 'number' ? valA : parseFloat(valA) || 0
  const numB  = typeof valB === 'number' ? valB : parseFloat(valB) || 0
  const aBetter = higherIsBetter ? numA > numB : numA < numB
  const bBetter = higherIsBetter ? numB > numA : numB < numA

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center py-3 border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-color)] px-4 rounded-xl transition-all group">
      <div className="text-right flex items-center justify-end gap-3">
        <span className="font-headline text-base font-black tracking-tight" style={{ color: aBetter ? 'var(--success)' : 'var(--text-primary)' }}>
          {format(valA)}
        </span>
        {aBetter && <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center"><Check size={12} strokeWidth={4} className="text-emerald-500" /></div>}
      </div>
      <span className="font-black text-[8px] uppercase tracking-[0.2em] text-center px-2 opacity-40 group-hover:opacity-100 transition-opacity"
        style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <div className="flex items-center gap-3">
        {bBetter && <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center"><Check size={12} strokeWidth={4} className="text-emerald-500" /></div>}
        <span className="font-headline text-lg font-black tracking-tight" style={{ color: bBetter ? 'var(--success)' : 'var(--text-primary)' }}>
          {format(valB)}
        </span>
      </div>
    </div>
  )
}

export default function ComparePage() {
  const [applicants, setApplicants] = useState([])
  const [appA, setAppA] = useState(null)
  const [appB, setAppB] = useState(null)
  const [loading, setLoading] = useState(true)
  const { theme } = useTheme()

  const isDark = theme === 'dark'
  const gridColor = 'var(--chart-grid)'
  const axisColor = 'var(--chart-axis)'

  useEffect(() => {
    async function loadData() {
      try {
        const data = await dataService.getApplicants()
        setApplicants(data)
        if (data.length > 0) setAppA(data[0])
        if (data.length > 1) setAppB(data[1])
      } catch (err) {
        console.error('Failed to load comparison data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  function ApplicantSelector({ label, selected, onSelect, otherSelected, accentColor }) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">
          {label}
        </p>
        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {applicants.length === 0 && (
            <div className="py-8 text-center bg-[var(--bg-color)] rounded-2xl border-2 border-dashed border-[var(--border)]">
               <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">No Vault Records</p>
            </div>
          )}
          {applicants.map(app => {
            const isSelected = selected?.id === app.id
            const isOther    = otherSelected?.id === app.id
            const name = app.name || 'Unknown'
            return (
              <motion.button
                key={app.id}
                whileHover={!isOther ? { scale: 1.02, x: 4 } : {}}
                whileTap={!isOther ? { scale: 0.98 } : {}}
                disabled={isOther}
                onClick={() => onSelect(app)}
                className="flex items-center gap-4 px-4 py-3 rounded-2xl text-left transition-all duration-300 w-full bg-[var(--surface)] border-2 shadow-sm"
                style={{
                  opacity:    isOther ? 0.35 : 1,
                  cursor:     isOther ? 'not-allowed' : 'pointer',
                  borderColor: isSelected ? accentColor : 'transparent',
                  boxShadow:  isSelected ? `0 6px 16px ${accentColor}15` : 'var(--shadow-sm)'
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-headline text-xs font-black flex-shrink-0 text-white shadow-lg"
                  style={{ background: isSelected ? accentColor : 'var(--text-muted)' }}>
                  {name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-headline text-sm font-black uppercase tracking-tight truncate text-[var(--text-primary)]">
                    {name}
                  </p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-1 opacity-60">
                    RISK {app.score} <span className="mx-1">·</span> {app.id}
                  </p>
                </div>
                <RiskBadge type={app.band} className="!text-[8px]" />
              </motion.button>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-8">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900/30" />
          <div className="absolute inset-0 rounded-full border-4 border-[var(--accent)] border-t-transparent animate-spin" />
        </div>
        <p className="font-headline text-sm font-bold text-[var(--text-muted)] uppercase tracking-[0.25em] animate-pulse">Syncing Protocols...</p>
      </div>
    )
  }

  // FIX: Show proper empty state when fewer than 2 applicants exist
  if (applicants.length < 2) {
    return (
      <div className="flex flex-col gap-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <h1 className="display-lg text-[var(--text-primary)]">
            Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 italic">Compare.</span>
          </h1>
          <p className="text-base text-[var(--text-secondary)] mt-1.5 font-medium">
            Quantifiable variance analysis between primary institutional candidates.
          </p>
        </motion.div>

        <div className="flex flex-col items-center justify-center py-32 px-6 text-center gap-10 bg-[var(--surface)] rounded-[2.5rem] border border-[var(--border)]">
          <div className="w-24 h-24 rounded-[2.5rem] bg-[var(--bg-color)] flex items-center justify-center shadow-xl border border-[var(--border)]">
            <GitCompare size={48} className="text-[var(--text-muted)]" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="font-headline text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter">
              Insufficient <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 italic">Data.</span>
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] max-w-sm mx-auto leading-relaxed">
              Minimum two active identity profiles required for side-by-side analysis.
              {applicants.length === 1 && ' You have 1 — add one more.'}
              {applicants.length === 0 && ' Submit at least two applicants to unlock comparison.'}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/evaluate'}
            className="btn-primary mt-4"
          >
            <span className="uppercase tracking-[0.2em] font-black px-6">Assess Applicant</span>
          </motion.button>
        </div>
      </div>
    )
  }

  const radarA  = appA ? toRadar(appA) : []
  const radarB  = appB ? toRadar(appB) : []

  const radarMerged = radarA.map((d, i) => ({
    axis: d.axis,
    [(appA?.name || 'A').toUpperCase()]: d.value,
    [(appB?.name || 'B').toUpperCase()]: radarB[i]?.value ?? 0,
  }))

  const barData = appA && appB ? [
    { metric: 'SCORE',   A: appA.creditScore,      B: appB.creditScore      },
    { metric: 'YIELD',   A: appA.income / 1000,    B: appB.income / 1000    },
    { metric: 'TENURE',  A: appA.employmentYears,  B: appB.employmentYears  },
    { metric: 'RISK',    A: appA.score,            B: appB.score            },
  ] : []

  const verdict = appA && appB
    ? appA.score < appB.score
      ? { winner: appA, loser: appB, msg: 'EXHIBITS SUPERIOR RISK RESILIENCE.' }
      : appB.score < appA.score
      ? { winner: appB, loser: appA, msg: 'EXHIBITS SUPERIOR RISK RESILIENCE.' }
      : null
    : null

  return (
    <div className="flex flex-col gap-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
        <h1 className="display-lg text-[var(--text-primary)]">
          Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 italic">Compare.</span>
        </h1>
        <p className="text-base text-[var(--text-secondary)] mt-1.5 font-medium">
          Quantifiable variance analysis between primary institutional candidates.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-[var(--surface)] border-2 border-[var(--border)] shadow-xl flex items-center justify-center z-10 hidden md:flex font-black text-[9px] tracking-[0.3em] text-[var(--text-muted)] uppercase">
           VS
        </div>
        <BentoCard delay={0.1} hoverable={false} className="border-t-4 shadow-md !p-6" style={{ borderColor: 'var(--primary)' }}>
          <ApplicantSelector label="PRIMARY ASSESSMENT" selected={appA} onSelect={setAppA} otherSelected={appB} accentColor="var(--primary)" />
        </BentoCard>
        <BentoCard delay={0.2} hoverable={false} className="border-t-4 shadow-md !p-6" style={{ borderColor: 'var(--accent)' }}>
          <ApplicantSelector label="SECONDARY ASSESSMENT" selected={appB} onSelect={setAppB} otherSelected={appA} accentColor="var(--accent)" />
        </BentoCard>
      </div>

      <AnimatePresence>
        {appA && appB && (
          <motion.div
            key={`${appA.id}-${appB.id}`}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-10"
          >
            {verdict ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-6 px-8 py-4 rounded-[2rem] bg-[var(--success-bg)] border border-[var(--success)]/20 shadow-md relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--success)]" />
                <div className="w-10 h-10 rounded-xl bg-[var(--success)] flex items-center justify-center flex-shrink-0 shadow-lg text-white">
                   <Check size={20} strokeWidth={4} />
                </div>
                <div>
                   <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--success)] mb-1">SOVEREIGN VERDICT</p>
                   <p className="font-headline text-base font-black text-[var(--text-primary)] uppercase tracking-tight leading-tight">
                    <strong className="text-lg italic tracking-tighter mr-2">{verdict.winner.name}</strong> {verdict.msg}
                   </p>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center gap-6 px-8 py-4 rounded-[2rem] bg-[var(--warning-bg)] border border-[var(--warning)]/20 shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--warning)]" />
                <div className="w-10 h-10 rounded-xl bg-[var(--warning)] flex items-center justify-center flex-shrink-0 shadow-lg text-white">
                  <AlertTriangle size={20} strokeWidth={4} />
                </div>
                <p className="font-headline text-base font-black text-[var(--text-primary)] uppercase tracking-tight">
                  Identical risk profiles. Manual review mandatory.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[{ app: appA, color: 'var(--primary)' }, { app: appB, color: 'var(--accent)' }].map(({ app, color }) => (
                <BentoCard key={app.id} hoverable={false} className="flex flex-col items-center gap-8 shadow-md !p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none rotate-12">
                     <GitCompare size={150} />
                  </div>
                  <div className="flex items-center justify-between w-full border-b border-[var(--border)] pb-4 relative z-10">
                    <div className="flex items-center gap-3">
                       <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                       <span className="font-headline text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter truncate max-w-[180px]">
                        {app.name}
                       </span>
                    </div>
                    <RiskBadge type={app.status} className="!text-[8px] shadow-none border border-black/5" />
                  </div>
                  <RiskGauge score={app.score} size={220} />
                  <div className="flex gap-4 relative z-10">
                    <RiskBadge type={app.band} className="!text-[9px] !px-4 !py-2 shadow-sm" />
                  </div>
                  <div className="w-full mt-2 grid grid-cols-2 gap-3 relative z-10">
                    <div className="bg-[var(--bg-color)] p-4 rounded-2xl border border-[var(--border)] shadow-inner text-center">
                       <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest block mb-1">Asset Value</span>
                       <span className="font-headline text-base font-black text-[var(--text-primary)]">{formatCurrency(app.loanAmount)}</span>
                    </div>
                    <div className="bg-[var(--bg-color)] p-4 rounded-2xl border border-[var(--border)] shadow-inner text-center">
                       <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest block mb-1">Class</span>
                       <span className="font-headline text-base font-black text-[var(--text-primary)] truncate">{app.loanType?.split(' ')[0].toUpperCase()}</span>
                    </div>
                  </div>
                </BentoCard>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <BentoCard delay={0} hoverable={false} className="flex flex-col gap-8 shadow-sm !p-8">
                <div>
                   <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--primary)] mb-1">Actuarial Capability</p>
                  <h3 className="font-headline text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter">Capabilities <span className="opacity-20 italic">Radar.</span></h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarMerged} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                    <PolarGrid stroke={gridColor} vertical={false} />
                    <PolarAngleAxis dataKey="axis"
                      tick={{ fontSize: 10, fontWeight: 900, fill: axisColor, fontFamily: 'Plus Jakarta Sans', letterSpacing: '0.05em' }} />
                    <Tooltip content={<CompareTooltip />} />
                    <Radar name={(appA?.name || 'A').toUpperCase()} dataKey={(appA?.name || 'A').toUpperCase()} stroke={COLORS.A} fill={COLORS.A} fillOpacity={0.25} strokeWidth={3} dot={{ r: 4, fill: COLORS.A, strokeWidth: 2, stroke: '#fff' }} />
                    <Radar name={(appB?.name || 'B').toUpperCase()} dataKey={(appB?.name || 'B').toUpperCase()} stroke={COLORS.B} fill={COLORS.B} fillOpacity={0.2} strokeWidth={3} dot={{ r: 4, fill: COLORS.B, strokeWidth: 2, stroke: '#fff' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </BentoCard>

              <BentoCard delay={0} hoverable={false} className="flex flex-col gap-8 shadow-sm !p-8">
                <div>
                   <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--accent)] mb-1">Quantifiable variance</p>
                  <h3 className="font-headline text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter">Metric <span className="opacity-20 italic">Indices.</span></h3>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={10}>
                    <CartesianGrid strokeDasharray="5 5" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="metric" tick={{ fontSize: 9, fontWeight: 900, fill: axisColor, letterSpacing: '0.1em' }} axisLine={false} tickLine={false} dy={12} />
                    <YAxis hide domain={[0, 'dataMax + 10']} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: gridColor, opacity: 0.4 }} />
                    <Bar dataKey="A" name={(appA?.name || 'A').toUpperCase()} radius={[6, 6, 6, 6]} barSize={16}>
                      {barData.map((_, i) => <Cell key={i} fill={COLORS.A} />)}
                    </Bar>
                    <Bar dataKey="B" name={(appB?.name || 'B').toUpperCase()} radius={[6, 6, 6, 6]} barSize={16}>
                      {barData.map((_, i) => <Cell key={i} fill={COLORS.B} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <div className="flex flex-col gap-1 mt-4">
                  <StatRow label="CIBIL RATING"  valA={appA.creditScore}      valB={appB.creditScore}      higherIsBetter />
                  <StatRow label="MONTHLY YIELD"  valA={appA.income}           valB={appB.income}           higherIsBetter format={formatCurrency} />
                  <StatRow label="MATURITY YRS"  valA={appA.employmentYears}  valB={appB.employmentYears}  higherIsBetter />
                  <StatRow label="RISK DELTA"    valA={appA.score}            valB={appB.score}            higherIsBetter={false} />
                </div>
              </BentoCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
