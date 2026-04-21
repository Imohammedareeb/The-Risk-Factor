import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell, CartesianGrid } from 'recharts'
import { AlertCircle, RefreshCw, Map } from 'lucide-react'
import BentoCard from '../ui/BentoCard'
import { dataService } from '../../data/dataService'
import { getHeatColor, predictRisk } from '../../data/riskEngine'

// FIX: Baseline sector/loan-type profiles for cells with no real applicants.
// Uses median-typical values per sector so the heatmap is meaningful from day 1.
const BASELINE_PROFILES = {
  'IT Services':   { income: 120000, creditScore: 730, ltvRatio: 0.65, existingEMI: 8000,  employmentYears: 6 },
  'Healthcare':    { income: 100000, creditScore: 700, ltvRatio: 0.70, existingEMI: 10000, employmentYears: 5 },
  'Education':     { income:  60000, creditScore: 680, ltvRatio: 0.72, existingEMI:  6000, employmentYears: 4 },
  'Manufacturing': { income:  75000, creditScore: 650, ltvRatio: 0.78, existingEMI: 12000, employmentYears: 7 },
  'Retail':        { income:  55000, creditScore: 620, ltvRatio: 0.80, existingEMI: 15000, employmentYears: 3 },
  'Agriculture':   { income:  45000, creditScore: 600, ltvRatio: 0.82, existingEMI: 10000, employmentYears: 5 },
  'Construction':  { income:  80000, creditScore: 590, ltvRatio: 0.88, existingEMI: 20000, employmentYears: 8 },
  'Other':         { income:  65000, creditScore: 640, ltvRatio: 0.75, existingEMI: 10000, employmentYears: 4 },
}
const LOAN_AMOUNTS = {
  'Home Loan': 1500000, 'Personal Loan': 300000,
  'Business Loan': 2000000, 'Education Loan': 500000,
}
function getBaselineScore(sector, loanType) {
  const p = BASELINE_PROFILES[sector] || BASELINE_PROFILES['Other']
  const { score } = predictRisk({ ...p, loanAmount: LOAN_AMOUNTS[loanType] || 500000, sector, age: 35 })
  return score
}
import { useTheme } from '../../context/ThemeContext'

const SECTORS = [
  'IT Services', 'Healthcare', 'Education', 'Manufacturing',
  'Retail', 'Construction', 'Agriculture', 'Other',
]
const LOAN_TYPES = ['Home Loan', 'Personal Loan', 'Business Loan', 'Education Loan']

function HeatLegend() {
  return (
    <div className="flex items-center gap-4 bg-[var(--surface)] px-5 py-3 rounded-2xl border border-[var(--border)] shadow-sm transition-colors">
      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
        Risk Quotient
      </span>
      <div className="w-40 h-2.5 rounded-full shadow-inner border border-black/5"
        style={{ background: 'linear-gradient(90deg, #10b981, #f59e0b, #ef4444)' }} />
      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]">Critical</span>
    </div>
  )
}

function HeatCell({ score, sector, loanType, onClick }) {
  const color   = getHeatColor(score)
  const opacity = 0.25 + (score / 100) * 0.75

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      whileHover={{ scale: 1.05, zIndex: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
      onClick={() => onClick({ score, sector, loanType })}
      className="relative flex flex-col items-center justify-center rounded-[1.25rem] cursor-pointer select-none aspect-square border-2 border-white/20 shadow-sm"
      style={{ background: color, opacity }}
      title={`${sector} / ${loanType}: ${score}`}
    >
      {score > 0 && (
        <span className="font-headline text-2xl font-black text-white drop-shadow-md">
          {score}
        </span>
      )}
      <span className="text-[9px] font-black uppercase tracking-widest text-white/90 text-center px-1 mt-1 leading-tight">
        {loanType.replace(' Loan', '')}
      </span>
    </motion.div>
  )
}

function HeatTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="glass-panel rounded-2xl px-6 py-5 shadow-2xl border border-[var(--border)] bg-[var(--surface)]">
      <p className="font-black text-[var(--text-muted)] mb-1 uppercase tracking-[0.15em] text-[10px]">{d.sector}</p>
      <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">{d.lt}</p>
      <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center gap-3">
         <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: getHeatColor(d.z) }} />
         <p className="font-headline text-lg font-black text-[var(--text-primary)]">
           INDEX: {d.z}
         </p>
      </div>
    </div>
  )
}

function SectorRow({ row, index }) {
  const avg = row.avg
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.38 }}
      className="flex items-center gap-5 py-4 border-b border-[var(--border)] last:border-0 group"
    >
      <span className="text-[10px] font-black w-32 flex-shrink-0 text-[var(--text-muted)] uppercase tracking-widest group-hover:text-[var(--text-primary)] transition-colors">
        {row.sector}
      </span>
      <div className="flex-1 h-3 rounded-full bg-[var(--bg-color)] border border-[var(--border)] overflow-hidden shadow-inner">
        <motion.div
          className="h-full rounded-full shadow-lg"
          style={{ 
            background: getHeatColor(avg),
            boxShadow: `0 0 10px ${getHeatColor(avg)}33`
          }}
          initial={{ width: 0 }}
          animate={{ width: `${avg}%` }}
          transition={{ delay: index * 0.06 + 0.2, duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </div>
      <span className="font-headline text-base font-black w-10 text-right"
        style={{ color: getHeatColor(avg) }}>
        {avg}
      </span>
    </motion.div>
  )
}

export default function HeatmapPage() {
  const [selected, setSelected] = useState(null)
  const [heatmapMatrix, setHeatmapMatrix] = useState([])
  const [scatterData, setScatterData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { theme } = useTheme()

  const isDark = theme === 'dark'
  const gridColor = 'var(--chart-grid)'
  const axisColor = 'var(--chart-axis)'

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const apps = await dataService.getApplicants()
      
      const matrix = SECTORS.map(sector => {
        const sectorApps = apps.filter(a => a.sector === sector)
        const row = { sector }
        let totalScore = 0
        let count = 0

        LOAN_TYPES.forEach(lt => {
          const ltApps = sectorApps.filter(a => a.loanType === lt)
          // FIX: Use baseline prediction for cells with no real data instead of showing 0 (grey)
          const avgScore = ltApps.length > 0
            ? Math.round(ltApps.reduce((acc, curr) => acc + (curr.score || 0), 0) / ltApps.length)
            : getBaselineScore(sector, lt)
          row[lt] = avgScore
          row[lt + '_isBaseline'] = ltApps.length === 0 // track which cells are estimated
          totalScore += avgScore
          count++
        })
        
        row.avg = Math.round(totalScore / LOAN_TYPES.length)
        return row
      })

      setHeatmapMatrix(matrix)

      const scatter = []
      matrix.forEach((row, si) => {
        LOAN_TYPES.forEach((lt, li) => {
          if (true) {
            scatter.push({ x: li, y: si, z: row[lt], sector: row.sector, lt })
          }
        })
      })
      setScatterData(scatter)
    } catch (err) {
      console.error('Failed to load heatmap data:', err)
      setError(err.message || 'Identity vault locked')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-8">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-red-100 dark:border-red-900/30" />
          <div className="absolute inset-0 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
        </div>
        <p className="font-headline text-xl font-black text-[var(--text-muted)] uppercase tracking-[0.25em] animate-pulse">Rendering Matrix...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-8 text-center">
        <div className="w-20 h-20 rounded-[2rem] bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-500 shadow-lg border border-red-200 dark:border-red-800/30">
           <AlertCircle size={40} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="font-headline text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">Access Denied</h2>
          <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest max-w-xs mx-auto">{error}</p>
        </div>
        <button onClick={loadData} className="btn-secondary px-10 flex items-center gap-3 uppercase tracking-widest text-[10px] font-black">
           <RefreshCw size={16} strokeWidth={3} /> Re-initialize
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
        <h1 className="display-lg text-[var(--text-primary)]">
          Sector <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400 italic">Surveillance.</span>
        </h1>
        <p className="text-lg text-[var(--text-secondary)] mt-2 font-medium">
          Visualize actuarial risk concentration across institutional sectors.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <BentoCard delay={0.1} span="lg:col-span-2" hoverable={false} className="flex flex-col gap-10 shadow-lg !p-10 border-[var(--border)]">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-600 shadow-inner">
                  <Map size={24} strokeWidth={3} />
               </div>
               <h2 className="font-headline text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter">
                Risk Matrix
              </h2>
            </div>
            <HeatLegend />
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: '8rem repeat(4, 1fr)' }}>
            <div />
            {LOAN_TYPES.map(lt => (
              <div key={lt} className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] py-3 border-b-2 border-[var(--bg-color)]">
                {lt.replace(' Loan', '')}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {heatmapMatrix.map((row) => (
              <div key={row.sector} className="grid gap-4 items-center"
                style={{ gridTemplateColumns: '8rem repeat(4, 1fr)' }}>
                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest truncate pr-4">
                  {row.sector}
                </span>
                {LOAN_TYPES.map(lt => (
                  <HeatCell
                    key={lt}
                    score={row[lt]}
                    sector={row.sector}
                    loanType={lt}
                    onClick={setSelected}
                  />
                ))}
              </div>
            ))}
          </div>
        </BentoCard>

        <div className="flex flex-col gap-8">
          <BentoCard delay={0.2} hoverable={false} className="flex flex-col gap-6 shadow-md !p-8 border-[var(--border)]">
            <h3 className="font-headline text-xs font-black text-[var(--text-primary)] uppercase tracking-[0.3em]">
              Sovereign Averages
            </h3>
            <div className="flex flex-col">
              {heatmapMatrix.filter(r => r.avg > 0).map((row, i) => <SectorRow key={row.sector} row={row} index={i} />)}
            </div>
          </BentoCard>

          {selected && (
            <motion.div
              key={`${selected.sector}-${selected.loanType}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            >
              <BentoCard
                hoverable={false}
                style={{ background: getHeatColor(selected.score) + '15', borderColor: getHeatColor(selected.score) + '44' }}
                className="flex flex-col gap-6 shadow-xl border-2 !p-8"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60" style={{ color: getHeatColor(selected.score) }}>
                      Selected Segment
                    </p>
                    <p className="font-headline text-6xl font-black tracking-tighter mt-2" style={{ color: getHeatColor(selected.score) }}>
                      {selected.score}
                    </p>
                  </div>
                </div>
                <div className="bg-[var(--surface)] p-6 rounded-3xl border border-white/20 shadow-inner">
                  <p className="font-headline text-lg font-black uppercase tracking-tight text-[var(--text-primary)]">
                    {selected.sector}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-1">
                    {selected.loanType} Classification
                  </p>
                </div>
                <p className="text-sm font-bold uppercase tracking-wide leading-relaxed text-[var(--text-secondary)] opacity-80">
                  {selected.score === 0 
                    ? 'Aggregate data insufficient for analysis.'
                    : selected.score < 35
                    ? 'Security protocol optimal. expansion viable.'
                    : selected.score < 65
                    ? 'Moderate vulnerability. Standard underwriting applies.'
                    : 'High risk concentration. Restrict further exposure.'}
                </p>
              </BentoCard>
            </motion.div>
          )}
        </div>
      </div>

      <BentoCard delay={0.4} hoverable={false} className="flex flex-col gap-10 shadow-lg !p-10 border-[var(--border)]">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary)] mb-1">Actuarial Scatter</p>
          <h2 className="font-headline text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter">
            Distribution <span className="opacity-20 italic">Variance.</span>
          </h2>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="6 6" stroke={gridColor} vertical={false} />
            <XAxis type="number" dataKey="x" domain={[-0.5, 3.5]} hide />
            <YAxis type="number" dataKey="y" domain={[-0.5, SECTORS.length - 0.5]} hide width={90} />
            <ZAxis type="number" dataKey="z" range={[500, 2000]} />
            <Tooltip content={<HeatTooltip />} cursor={{ strokeDasharray: '8 8', stroke: axisColor, strokeWidth: 2 }} />
            <Scatter data={scatterData} shape="circle">
              {scatterData.map((entry, i) => (
                <Cell key={i} fill={getHeatColor(entry.z)} fillOpacity={0.9} stroke="var(--surface-solid)" strokeWidth={3} className="shadow-lg" />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </BentoCard>
    </div>
  )
}
