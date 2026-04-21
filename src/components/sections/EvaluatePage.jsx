import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, RotateCcw, ChevronDown, Save, CheckCircle2, User, Landmark, Activity } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import BentoCard from '../ui/BentoCard'
import RiskGauge from '../ui/RiskGauge'
import RiskBadge from '../ui/RiskBadge'
import FactorBar from '../ui/FactorBar'
import { predictRisk, formatCurrency } from '../../data/riskEngine'
import { dataService } from '../../data/dataService'
import { useToast } from '../../context/ToastContext'

const SECTORS = [
  'IT Services', 'Healthcare', 'Education', 'Manufacturing',
  'Retail', 'Construction', 'Agriculture', 'Other',
]
const LOAN_TYPES = ['Home Loan', 'Personal Loan', 'Business Loan', 'Education Loan']

const DEFAULT_INPUTS = {
  creditScore:     680,
  loanAmount:      1000000,
  income:          80000,
  employmentYears: 5,
  existingEMI:     8000,
  ltvRatio:        0.75,
  sector:          'IT Services',
  loanType:        'Home Loan',
  name:            '',
  age:             35,
}

function InputGroup({ label, children, htmlFor }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] ml-1 cursor-pointer">
        {label}
      </label>
      {children}
    </div>
  )
}

function RangeSlider({ id, value, onChange, min, max, step = 1, formatVal, label }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="flex flex-col gap-3 p-5 bg-[var(--bg-color)] border border-[var(--border)] rounded-2xl transition-colors hover:bg-[var(--surface)]">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">{label}</span>
         <span className="font-headline text-lg font-black text-[var(--primary)] tracking-tight">
          {formatVal ? formatVal(value) : value}
        </span>
      </div>
      <div className="relative">
        <input
          id={id}
          type="range" min={min} max={max} step={step}
          value={value} onChange={e => onChange(Number(e.target.value))}
          aria-label={label}
          className="w-full"
          style={{
            background: `linear-gradient(90deg, var(--primary) ${pct}%, var(--border) ${pct}%)`,
          }}
        />
      </div>
      <div className="flex justify-between">
        <span className="text-[8px] font-black text-[var(--text-muted)] opacity-50 uppercase">{formatVal ? formatVal(min) : min}</span>
        <span className="text-[8px] font-black text-[var(--text-muted)] opacity-50 uppercase">{formatVal ? formatVal(max) : max}</span>
      </div>
    </div>
  )
}

export default function EvaluatePage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [inputs, setInputs] = useState(DEFAULT_INPUTS)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [nameError, setNameError] = useState(false)
  const [hasRun, setHasRun] = useState(false)

  const set = (key, val) => setInputs(prev => ({ ...prev, [key]: val }))

  useEffect(() => {
    if (!hasRun) return
    const t = setTimeout(() => setResult(predictRisk(inputs)), 150)
    return () => clearTimeout(t)
  }, [inputs, hasRun])

  const handleRun = () => {
    setLoading(true)
    setTimeout(() => {
      setResult(predictRisk(inputs))
      setLoading(false)
      setHasRun(true)
    }, 1200)
  }

  const handleSave = async () => {
    if (!inputs.name.trim()) {
      setNameError(true)
      toast({ message: 'Applicant name is required before saving', type: 'error' })
      document.getElementById('app-name')?.focus()
      return
    }
    setNameError(false)
    setIsSaving(true)
    try {
      await dataService.addApplicant(inputs)
      toast({ message: 'Identity Committed to Vault', type: 'success' })
      navigate('/dashboard')
    } catch (err) {
      toast({ message: err.message || 'System Write Failure', type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setInputs(DEFAULT_INPUTS)
    setResult(null)
    setHasRun(false)
  }

  const RECOMMENDATION_COLOR = result
    ? result.score < 35 ? 'var(--success)'
    : result.score < 55 ? 'var(--warning)'
    : result.score < 75 ? 'var(--warning)'
    : 'var(--danger)'
    : 'var(--text-primary)'

  return (
    <div className="flex flex-col gap-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
        <h1 className="display-lg text-[var(--text-primary)]">
          Risk <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 italic">Assessment.</span>
        </h1>
        <p className="text-base text-[var(--text-secondary)] mt-1.5 font-medium">
          Quantify credit liability using generative intelligence models.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Input Form ── col 1-3 */}
        <BentoCard
          delay={0.1}
          span="lg:col-span-3"
          hoverable={false}
          className="flex flex-col gap-8 relative overflow-hidden shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-inner">
               <User size={20} strokeWidth={3} />
            </div>
            <h2 className="font-headline text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter">
              Identity & Sector
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 stagger-in">
            <InputGroup label="Full Name" htmlFor="app-name">
              <input
                id="app-name"
                className={`rf-input !py-4 text-base font-black uppercase tracking-tight transition-all ${nameError ? 'border-red-500 ring-1 ring-red-500/30 !bg-red-50 dark:!bg-red-950/20' : ''}`}
                placeholder="E.G. PRIYA SHARMA"
                value={inputs.name}
                onChange={e => { set('name', e.target.value); setNameError(false) }}
              />
              {nameError && (
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1.5 ml-1">
                  Applicant name is required
                </p>
              )}
            </InputGroup>

            <InputGroup label="Operational Sector" htmlFor="app-sector">
              <div className="relative">
                <select
                  id="app-sector"
                  className="rf-input !py-4 appearance-none font-black text-xs uppercase tracking-widest"
                  value={inputs.sector}
                  onChange={e => set('sector', e.target.value)}
                >
                  {SECTORS.map(s => <option key={s}>{s}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]" strokeWidth={3} />
              </div>
            </InputGroup>

            <InputGroup label="Asset Classification" htmlFor="app-type">
              <div className="relative">
                <select
                  id="app-type"
                  className="rf-input !py-4 appearance-none font-black text-xs uppercase tracking-widest"
                  value={inputs.loanType}
                  onChange={e => set('loanType', e.target.value)}
                >
                  {LOAN_TYPES.map(l => <option key={l}>{l}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]" strokeWidth={3} />
              </div>
            </InputGroup>
            
            <RangeSlider id="app-age" label="Applicant Age" value={inputs.age} onChange={v => set('age', v)} min={21} max={65} formatVal={v => v + ' YRS'} />
          </div>

          <div className="h-px bg-[var(--border)] w-full opacity-40" />
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-600 shadow-inner">
               <Landmark size={20} strokeWidth={3} />
            </div>
            <h2 className="font-headline text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter">
              Financial Indices
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 stagger-in">
            <RangeSlider id="app-credit" label="CIBIL Rating" value={inputs.creditScore} onChange={v => set('creditScore', v)} min={300} max={900} />
            <RangeSlider
              id="app-loan" label="Capital Request" value={inputs.loanAmount} onChange={v => set('loanAmount', v)}
              min={50000} max={10000000} step={50000} formatVal={v => '₹' + (v / 100000).toFixed(1) + 'L'}
            />
            <RangeSlider
              id="app-income" label="Monthly Yield" value={inputs.income} onChange={v => set('income', v)}
              min={10000} max={500000} step={5000} formatVal={v => '₹' + (v / 1000).toFixed(0) + 'K'}
            />
            <RangeSlider
              id="app-emi" label="Existing Liabilities" value={inputs.existingEMI} onChange={v => set('existingEMI', v)}
              min={0} max={100000} step={500} formatVal={v => '₹' + (v / 1000).toFixed(1) + 'K'}
            />
            <RangeSlider
              id="app-ltv" label="LTV Quotient" value={inputs.ltvRatio} onChange={v => set('ltvRatio', v)}
              min={0.1} max={1.0} step={0.01} formatVal={v => (v * 100).toFixed(0) + '%'}
            />
            <RangeSlider id="app-employment" label="Tenure Stability" value={inputs.employmentYears} onChange={v => set('employmentYears', v)} min={0} max={30} formatVal={v => v + ' YRS'} />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 mt-auto">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
              onClick={handleRun} disabled={loading}
              className="btn-primary flex-1 py-4 text-xs font-black uppercase tracking-[0.2em] shadow-lg"
            >
              {loading ? <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}><Cpu size={18} strokeWidth={3}/></motion.span> : <Activity size={18} strokeWidth={3}/>}
              {loading ? 'PROCESSING...' : 'RUN ANALYSIS'}
            </motion.button>
            
            {result && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                onClick={handleSave} disabled={isSaving}
                className="btn-primary flex-1 py-4 text-xs font-black uppercase tracking-[0.2em] !bg-emerald-600 !shadow-[0_8px_24px_rgba(5,150,105,0.4)]"
              >
                {isSaving ? <CheckCircle2 size={18} className="animate-pulse" /> : <Save size={18} />}
                {isSaving ? 'COMMITTING...' : 'SAVE APPLICATION'}
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="btn-secondary px-8 text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100"
            >
              <RotateCcw size={14} strokeWidth={3} />
            </motion.button>
          </div>
        </BentoCard>

        {/* ── Result Panel ── col 4-5 */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          <BentoCard
            delay={0.2}
            hoverable={false}
            className="flex flex-col items-center gap-6 shadow-lg !p-8"
          >
            <AnimatePresence mode="wait">
              {!result && !loading && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4 py-16 text-center">
                  <div className="w-20 h-20 rounded-[1.5rem] flex items-center justify-center bg-[var(--bg-color)] border border-[var(--border)] shadow-inner">
                    <Activity size={32} className="text-[var(--text-muted)] opacity-40" strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-headline text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Awaiting Analysis</h3>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Injected Parameters Required</p>
                  </div>
                </motion.div>
              )}

              {loading && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-6 py-16 w-full text-center">
                  <div className="relative w-32 h-32">
                    <div className="absolute inset-0 rounded-full border-[5px] border-indigo-100 dark:border-indigo-900/30" />
                    <div className="absolute inset-0 rounded-full border-[5px] border-indigo-500 border-t-transparent animate-spin" />
                    <div className="absolute inset-3 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shadow-inner">
                        <Cpu size={32} className="text-indigo-500 animate-pulse" strokeWidth={3} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-headline text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Actuarial Computation</p>
                    <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-[0.3em] animate-pulse">Running Risk Model...</p>
                  </div>
                </motion.div>
              )}

              {result && !loading && (
                <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                  className="flex flex-col items-center gap-8 w-full"
                >
                  <RiskGauge score={result.score} size={220} />

                  <div className="flex gap-3">
                    <RiskBadge type={result.band} className="!text-[9px] !px-4 !py-2" />
                    <RiskBadge type={result.recommendation} className="!text-[9px] !px-4 !py-2" />
                  </div>

                  <div className="w-full p-8 rounded-[2rem] text-center bg-[var(--bg-color)] border border-[var(--border)] shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-30" />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-2">
                      Sovereign Mandate
                    </p>
                    <p className="font-headline text-3xl font-black tracking-tighter italic" style={{ color: RECOMMENDATION_COLOR }}>
                      {result.recommendation.toUpperCase()}
                    </p>
                    <div className="mt-5 flex items-center justify-center gap-3">
                       <span className="h-px w-6 bg-[var(--border)]" />
                       <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                         Prob: <strong className="text-[var(--text-primary)] ml-1">{(result.probability * 100).toFixed(1)}%</strong>
                       </p>
                       <span className="h-px w-6 bg-[var(--border)]" />
                    </div>
                  </div>

                  {inputs.name && (
                    <p className="font-headline text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] text-center px-4">
                      PROTOCOL SURVEILLANCE: <span className="text-[var(--text-primary)]">{inputs.name.toUpperCase()}</span>
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </BentoCard>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <BentoCard
                  hoverable={false}
                  className="flex flex-col gap-6 shadow-lg !p-8"
                >
                  <div className="flex flex-col gap-1">
                    <h3 className="font-headline text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter">
                      Risk Attribution
                    </h3>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Explainable AI Analysis</p>
                  </div>
                  <div className="flex flex-col gap-6 mt-1">
                    {result.factors.map((f, i) => (
                      <FactorBar key={f.name} factor={f} index={i} />
                    ))}
                  </div>
                </BentoCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
