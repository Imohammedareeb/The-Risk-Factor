import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { Calculator, TrendingDown, IndianRupee, Calendar, Percent, Landmark } from 'lucide-react'
import BentoCard from '../ui/BentoCard'
import AnimatedCounter from '../ui/AnimatedCounter'
import { useToast } from '../../context/ToastContext'
import { useTheme } from '../../context/ThemeContext'

// ── Math ──────────────────────────────────────────────────
function calcEMI(principal, annualRate, tenureMonths) {
  if (annualRate === 0) return principal / tenureMonths
  const r = annualRate / 12 / 100
  return (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1)
}

function buildSchedule(principal, annualRate, tenureMonths) {
  const emi       = calcEMI(principal, annualRate, tenureMonths)
  const r         = annualRate / 12 / 100
  let   balance   = principal
  const schedule  = []

  for (let m = 1; m <= tenureMonths; m++) {
    const interest  = balance * r
    const principal_ = emi - interest
    balance        -= principal_
    schedule.push({
      month:     m,
      emi:       Math.round(emi),
      interest:  Math.round(interest),
      principal: Math.round(principal_),
      balance:   Math.max(0, Math.round(balance)),
    })
  }
  return schedule
}

function buildYearly(schedule) {
  const years = {}
  schedule.forEach(row => {
    const yr = Math.ceil(row.month / 12)
    if (!years[yr]) years[yr] = { year: yr, principal: 0, interest: 0 }
    years[yr].principal += row.principal
    years[yr].interest  += row.interest
  })
  return Object.values(years)
}

const fmt = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n)
const fmtC = (n) => '₹' + fmt(n)

function RangeInput({ label, value, onChange, min, max, step = 1, display }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="flex flex-col gap-4 p-6 bg-[var(--bg-color)] border border-[var(--border)] rounded-3xl shadow-inner transition-colors hover:bg-[var(--surface)]">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{label}</label>
        <span className="font-headline text-2xl font-black text-[var(--primary)] tracking-tighter">{display(value)}</span>
      </div>
      <div className="relative">
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full"
          style={{
            background: `linear-gradient(90deg, var(--primary) ${pct}%, var(--border) ${pct}%)`,
          }}
        />
      </div>
      <div className="flex justify-between">
        <span className="text-[9px] font-black text-[var(--text-muted)] opacity-60 uppercase">{display(min)}</span>
        <span className="text-[9px] font-black text-[var(--text-muted)] opacity-60 uppercase">{display(max)}</span>
      </div>
    </div>
  )
}

function CustomPieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-panel rounded-xl px-4 py-3 shadow-xl border border-[var(--border)] bg-[var(--surface)]">
      <p className="font-black text-[var(--text-muted)] mb-1 uppercase tracking-widest text-[10px]">{payload[0].name}</p>
      <p className="font-headline text-lg font-black text-[var(--text-primary)]">{fmtC(payload[0].value)}</p>
    </div>
  )
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-panel rounded-xl px-4 py-3 shadow-xl border border-[var(--border)] bg-[var(--surface)]">
      <p className="font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest text-[10px]">Year {label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-black text-xs uppercase tracking-tight">
          {p.name}: <span className="text-[var(--text-primary)] text-sm ml-2">{fmtC(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

export default function EMIPage() {
  const { toast } = useToast()
  const { theme } = useTheme()
  const [principal,  setPrincipal]  = useState(2000000)
  const [rate,       setRate]       = useState(8.5)
  const [tenure,     setTenure]     = useState(240)
  const [prepay,     setPrepay]     = useState(0)
  const [showSched,  setShowSched]  = useState(false)

  const isDark = theme === 'dark'
  const gridColor = 'var(--chart-grid)'
  const axisColor = 'var(--chart-axis)'

  const schedule    = useMemo(() => buildSchedule(principal, rate, tenure), [principal, rate, tenure])
  const yearlyData  = useMemo(() => buildYearly(schedule), [schedule])

  const emi         = schedule[0]?.emi ?? 0
  const totalPaid   = emi * tenure
  const totalInt    = totalPaid - principal

  const prepayMonths = useMemo(() => {
    if (prepay <= 0) return null
    const r = rate / 12 / 100
    let bal = principal
    let months = 0
    while (bal > 0 && months < tenure) {
      const interest  = bal * r
      const princ     = emi - interest
      bal            -= princ
      months++
      if (months % 12 === 0 && bal > 0) bal = Math.max(0, bal - prepay)
    }
    return months
  }, [principal, rate, tenure, emi, prepay])

  const prepayInterestSaved = prepayMonths
    ? totalInt - (emi * prepayMonths - principal + prepay * Math.floor(prepayMonths / 12))
    : 0
  const monthsSaved = prepayMonths ? tenure - prepayMonths : 0

  const pieData = [
    { name: 'PRINCIPAL', value: principal,  color: 'var(--primary)' },
    { name: 'INTEREST',  value: totalInt,   color: '#ef4444' },
  ]

  return (
    <div className="flex flex-col gap-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
        <h1 className="display-lg text-[var(--text-primary)]">
          Financial <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 italic">Planner.</span>
        </h1>
        <p className="text-lg text-[var(--text-secondary)] mt-2 font-medium">
          Quantify aggregate loan liabilities and amortization efficiencies.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <BentoCard delay={0.1} span="lg:col-span-2" hoverable={false} className="flex flex-col gap-10 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none rotate-12">
             <Landmark size={200} />
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-[1rem] bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-inner">
               <Calculator size={24} strokeWidth={3} />
            </div>
            <h2 className="font-headline text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter">
              Parameters
            </h2>
          </div>

          <div className="flex flex-col gap-8 stagger-in relative z-10">
            <RangeInput
              label="Asset Principal"
              value={principal} onChange={setPrincipal}
              min={100000} max={10000000} step={50000}
              display={v => '₹' + (v / 100000).toFixed(1) + 'L'}
            />
            <RangeInput
              label="Annual Yield Rate"
              value={rate} onChange={setRate}
              min={5} max={20} step={0.1}
              display={v => v.toFixed(1) + '%'}
            />
            <RangeInput
              label="Maturity Plan"
              value={tenure} onChange={setTenure}
              min={12} max={360} step={12}
              display={v => (v / 12).toFixed(0) + ' YRS'}
            />

            <div className="h-px bg-[var(--border)] w-full opacity-60 my-2" />

            <RangeInput
              label="Annual Amortization"
              value={prepay} onChange={setPrepay}
              min={0} max={500000} step={10000}
              display={v => v === 0 ? '₹0' : '₹' + fmt(v)}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              toast({ message: 'Ledger Synchronized', type: 'success' })
              setShowSched(true)
            }}
            className="btn-primary justify-center py-5 rounded-2xl mt-auto text-sm font-black uppercase tracking-[0.2em] shadow-lg relative z-10"
          >
            <span className="flex items-center gap-3">
               AUDIT LEDGER <TrendingDown size={18} strokeWidth={3} />
            </span>
          </motion.button>
        </BentoCard>

        <div className="lg:col-span-3 flex flex-col gap-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: 'MONTHLY EMI',    value: emi,      color: 'var(--primary)', prefix: '₹', Icon: IndianRupee },
              { label: 'AGGREGATE INT.', value: totalInt, color: '#ef4444',                  prefix: '₹', Icon: Percent     },
              { label: 'TOTAL PAYABLE',  value: totalPaid,color: 'var(--text-primary)',         prefix: '₹', Icon: Calendar   },
            ].map(({ label, value, color, prefix, Icon }, i) => (
              <BentoCard key={label} delay={0.2 + i * 0.1} hoverable={false}
                className="flex flex-col gap-5 shadow-md !p-8">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner border border-[var(--border)]"
                  style={{ background: color + '10' }}>
                  <Icon size={24} style={{ color }} strokeWidth={3} />
                </div>
                <div>
                   <p className="font-headline text-3xl font-black tracking-tighter" style={{ color }}>
                    <AnimatedCounter value={value} prefix={prefix} />
                  </p>
                  <p className="text-[10px] font-black text-[var(--text-muted)] mt-2 uppercase tracking-[0.2em]">{label}</p>
                </div>
              </BentoCard>
            ))}
          </div>

          <BentoCard delay={0.5} hoverable={false} className="flex flex-col md:flex-row items-center gap-12 shadow-lg !p-10">
            <div className="relative flex-shrink-0">
               <ResponsiveContainer width={240} height={240}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={75} outerRadius={110}
                    paddingAngle={6} dataKey="value" stroke="none">
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Burden</p>
                 <p className="font-headline text-3xl font-black text-[#ef4444] mt-1">{((totalInt / totalPaid) * 100).toFixed(0)}%</p>
              </div>
            </div>

            <div className="flex flex-col gap-5 flex-1 w-full">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center justify-between gap-6 bg-[var(--bg-color)] p-6 rounded-[2rem] border border-[var(--border)] shadow-inner transition-all hover:bg-[var(--surface)]">
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full shadow-[0_0_12px_rgba(0,0,0,0.1)]" style={{ background: d.color }} />
                    <div>
                       <p className="font-headline text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">
                        {d.name}
                      </p>
                      <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mt-1">Institutional Allocation</p>
                    </div>
                  </div>
                  <p className="font-headline text-xl font-black tracking-tight" style={{ color: d.color }}>
                    {fmtC(d.value)}
                  </p>
                </div>
              ))}
            </div>
          </BentoCard>

          <AnimatePresence>
            {prepay > 0 && prepayMonths && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 20 }}
                animate={{ opacity: 1, scale: 1,    y: 0  }}
                exit={{    opacity: 0, scale: 0.98, y: 20 }}
                className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-[3rem] p-10 border-2 border-emerald-500/20 shadow-xl relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-xl text-white transform transition-transform group-hover:scale-110">
                     <TrendingDown size={28} strokeWidth={3} />
                  </div>
                  <div className="flex flex-col">
                     <h3 className="font-headline text-2xl font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-tighter">
                       Protocol Optimization
                     </h3>
                     <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-[0.2em]">Liquidity efficiency results</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                  {[
                    { label: 'New Tenure', value: (prepayMonths / 12).toFixed(1) + ' YRS', sub: `VS ${(tenure / 12).toFixed(0)} YRS PLAN` },
                    { label: 'Time Saved',   value: monthsSaved + ' MO',                      sub: 'ACCELERATED CLOSURE' },
                    { label: 'Yield Saved', value: fmtC(Math.abs(prepayInterestSaved)),       sub: 'CAPITAL PRESERVATION' },
                  ].map(({ label, value, sub }) => (
                    <div key={label} className="rounded-2xl p-6 bg-white dark:bg-black/20 border border-emerald-100 dark:border-emerald-500/10 shadow-sm transition-transform hover:-translate-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 opacity-60 mb-2">{label}</p>
                      <p className="font-headline text-3xl font-black text-emerald-700 dark:text-emerald-400 tracking-tighter">{value}</p>
                      <p className="text-[9px] font-black uppercase tracking-[0.15em] mt-2 text-emerald-500">{sub}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <BentoCard delay={0.6} hoverable={false} className="flex flex-col gap-10 shadow-lg !p-10">
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary)] mb-1">Actuarial Progression</p>
              <h3 className="font-headline text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter">
                Asset <span className="opacity-20 italic">Timeline.</span>
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={yearlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gPrincipal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="gInterest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" stroke={gridColor} vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fontWeight: 900, fill: axisColor, textTransform: 'uppercase' }} axisLine={false} tickLine={false} dy={15} />
                <YAxis tick={{ fontSize: 11, fontWeight: 900, fill: axisColor }} axisLine={false} tickLine={false} dx={-15} tickFormatter={v => v >= 100000 ? '₹' + (v / 100000).toFixed(1) + 'L' : v > 0 ? '₹' + (v / 1000).toFixed(0) + 'K' : '₹0'} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--primary)', strokeWidth: 2, strokeDasharray: '6 6' }} />
                <Area type="monotone" dataKey="principal" name="PRINCIPAL" stroke="var(--primary)" strokeWidth={4} fill="url(#gPrincipal)" activeDot={{ r: 8, strokeWidth: 0, fill: 'var(--primary)' }} />
                <Area type="monotone" dataKey="interest"  name="INTEREST"  stroke="#ef4444" strokeWidth={4} fill="url(#gInterest)"  activeDot={{ r: 8, strokeWidth: 0, fill: '#ef4444' }} />
              </AreaChart>
            </ResponsiveContainer>
          </BentoCard>
        </div>
      </div>

      <AnimatePresence>
        {showSched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12 bg-slate-900/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-[var(--surface)] w-full max-w-6xl h-[85vh] rounded-[3rem] shadow-[0_32px_128px_rgba(0,0,0,0.5)] flex flex-col border-2 border-white/20 overflow-hidden relative"
            >
              <div className="flex items-center justify-between px-12 py-10 border-b border-[var(--border)] bg-[var(--surface)] relative z-10">
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--primary)]">Sovereign Audit</p>
                  <h2 className="font-headline text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter">
                    Amortization <span className="opacity-20 italic">Ledger.</span>
                  </h2>
                  <div className="flex items-center gap-6 mt-2">
                     <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">EMI: <span className="text-[var(--text-primary)]">{fmtC(emi)}</span></p>
                     <span className="w-1.5 h-1.5 rounded-full bg-[var(--border)]" />
                     <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">TENURE: <span className="text-[var(--text-primary)]">{tenure} MO</span></p>
                     <span className="w-1.5 h-1.5 rounded-full bg-[var(--border)]" />
                     <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">YIELD: <span className="text-[var(--text-primary)]">{rate}% P.A.</span></p>
                  </div>
                </div>
                <button onClick={() => setShowSched(false)} className="btn-secondary px-10 py-4 !rounded-2xl uppercase tracking-[0.2em] text-xs">
                  Close Audit
                </button>
              </div>

              <div className="overflow-auto flex-1 p-10 custom-scrollbar relative z-10">
                  <table className="w-full text-sm text-left border-separate" style={{ borderSpacing: '0 8px' }}>
                    <thead className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] sticky top-0 z-20 bg-[var(--surface)]">
                      <tr>
                        <th className="px-8 py-6 rounded-l-2xl">Index</th>
                        <th className="px-8 py-6">Mandatory EMI</th>
                        <th className="px-8 py-6 text-[var(--primary)]">Principal Δ</th>
                        <th className="px-8 py-6 text-[#ef4444]">Yield Comp</th>
                        <th className="px-8 py-6 rounded-r-2xl">Ledger Bal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.map((row) => (
                        <tr key={row.month} className="group transition-all hover:bg-[var(--bg-color)]">
                          <td className="px-8 py-5 rounded-l-2xl font-black opacity-30 group-hover:opacity-100">{row.month}</td>
                          <td className="px-8 py-5 font-headline font-black text-[var(--text-primary)]">{fmtC(row.emi)}</td>
                          <td className="px-8 py-5 font-headline font-black text-[var(--primary)]">{fmtC(row.principal)}</td>
                          <td className="px-8 py-5 font-headline font-black text-[#ef4444]">{fmtC(row.interest)}</td>
                          <td className="px-8 py-5 rounded-r-2xl font-headline font-black text-[var(--text-muted)] group-hover:text-[var(--text-primary)]">{fmtC(row.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
