/**
 * Loan Risk Prediction Engine
 * Simulates a logistic-regression-style NPA risk model.
 * Returns a score 0–100 (higher = riskier) + factor breakdown.
 */

// ── Feature weights (derived from model training simulation) ──
const WEIGHTS = {
  creditScore:      -0.0082,   // higher score → lower risk
  incomeToLoan:     -1.8,      // higher ratio → lower risk
  ltvRatio:          2.2,      // higher LTV → higher risk
  employmentYears:  -0.11,     // more years → lower risk
  emiToIncome:       3.5,      // higher EMI burden → higher risk
  sectorRisk:        1.0,      // sector multiplier
  ageRisk:           0.05,     // slight age effect
}

const SECTOR_MULTIPLIERS = {
  'IT Services':   0.3,
  'Healthcare':    0.4,
  'Education':     0.35,
  'Manufacturing': 0.55,
  'Retail':        0.70,
  'Agriculture':   0.75,
  'Construction':  0.90,
  'Other':         0.60,
}

const INTERCEPT = 0.5

/** Sigmoid function */
const sigmoid = x => 1 / (1 + Math.exp(-x))

/**
 * @param {object} inputs
 * @returns {{ score: number, band: string, recommendation: string, factors: array }}
 */
export function predictRisk(inputs) {
  const {
    creditScore       = 650,
    loanAmount        = 500000,
    income            = 60000,
    employmentYears   = 3,
    existingEMI       = 5000,
    ltvRatio          = 0.75,
    sector            = 'Other',
  } = inputs

  const incomeToLoan  = income / loanAmount
  const emiToIncome   = existingEMI / income
  const sectorMult    = SECTOR_MULTIPLIERS[sector] ?? 0.60

  // Linear combination
  const z =
    INTERCEPT +
    WEIGHTS.creditScore      * (creditScore - 650) +
    WEIGHTS.incomeToLoan     * incomeToLoan +
    WEIGHTS.ltvRatio         * ltvRatio +
    WEIGHTS.employmentYears  * employmentYears +
    WEIGHTS.emiToIncome      * emiToIncome +
    WEIGHTS.sectorRisk       * sectorMult

  const probability = sigmoid(z)
  const score       = Math.round(Math.min(Math.max(probability * 100, 1), 99))

  // Risk band
  const band =
    score < 30 ? 'low' :
    score < 60 ? 'medium' : 'high'

  // Recommendation
  const recommendation =
    score < 30 ? 'Approve' :
    score < 50 ? 'Review'  :
    score < 70 ? 'Caution' : 'Reject'

  // Factor contributions for explainability
  const factors = [
    {
      name:      'Credit Score',
      value:     creditScore,
      impact:    Math.round(WEIGHTS.creditScore * (creditScore - 650) * 10) / 10,
      direction: creditScore >= 700 ? 'positive' : creditScore >= 600 ? 'neutral' : 'negative',
      weight:    0.28,
    },
    {
      name:      'Income-to-Loan Ratio',
      value:     (incomeToLoan * 100).toFixed(1) + '%',
      impact:    Math.round(WEIGHTS.incomeToLoan * incomeToLoan * 10) / 10,
      direction: incomeToLoan > 0.12 ? 'positive' : incomeToLoan > 0.07 ? 'neutral' : 'negative',
      weight:    0.22,
    },
    {
      name:      'Loan-to-Value Ratio',
      value:     (ltvRatio * 100).toFixed(0) + '%',
      impact:    Math.round(WEIGHTS.ltvRatio * ltvRatio * 10) / 10,
      direction: ltvRatio < 0.70 ? 'positive' : ltvRatio < 0.85 ? 'neutral' : 'negative',
      weight:    0.18,
    },
    {
      name:      'EMI Obligation Burden',
      value:     (emiToIncome * 100).toFixed(1) + '%',
      impact:    Math.round(WEIGHTS.emiToIncome * emiToIncome * 10) / 10,
      direction: emiToIncome < 0.20 ? 'positive' : emiToIncome < 0.40 ? 'neutral' : 'negative',
      weight:    0.16,
    },
    {
      name:      'Employment Stability',
      value:     employmentYears + ' yrs',
      impact:    Math.round(WEIGHTS.employmentYears * employmentYears * 10) / 10,
      direction: employmentYears >= 5 ? 'positive' : employmentYears >= 2 ? 'neutral' : 'negative',
      weight:    0.10,
    },
    {
      name:      'Sector Risk Index',
      value:     sector,
      impact:    Math.round(WEIGHTS.sectorRisk * sectorMult * 10) / 10,
      direction: sectorMult < 0.45 ? 'positive' : sectorMult < 0.65 ? 'neutral' : 'negative',
      weight:    0.06,
    },
  ]

  return { score, band, recommendation, factors, probability }
}

/** Color helpers */
export const getRiskColor = (band) => ({
  low:    { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', dot: '#10b981' },
  medium: { text: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-900/30',   dot: '#f59e0b' },
  high:   { text: 'text-red-600 dark:text-red-400',       bg: 'bg-red-50 dark:bg-red-900/30',       dot: '#ef4444' },
}[band] ?? { text: '', bg: '', dot: '#767684' })

export const getHeatColor = (score) => {
  if (score === 0) return 'var(--text-muted)'
  if (score < 25) return '#22c55e'
  if (score < 40) return '#84cc16'
  if (score < 55) return '#f59e0b'
  if (score < 70) return '#f97316'
  return '#ef4444'
}

export const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
