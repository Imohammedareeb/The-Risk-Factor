import { predictRisk } from './riskEngine'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Generic fetch with error handling
async function apiFetch(url, options = {}) {
  try {
    const res = await fetch(url, options)
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    return res.json()
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Make sure json-server is running: npm run server')
    }
    throw err
  }
}

export const dataService = {
  getApplicants: async () => {
    return apiFetch(`${API_URL}/applicants`)
  },

  getApplicantById: async (id) => {
    return apiFetch(`${API_URL}/applicants/${id}`)
  },

  addApplicant: async (data) => {
    // Validate required fields before sending
    const required = ['name', 'creditScore', 'loanAmount', 'income']
    for (const field of required) {
      if (data[field] === undefined || data[field] === '') {
        throw new Error(`Missing required field: ${field}`)
      }
    }

    // Range Validations with Max Boundaries
    if (data.creditScore < 300 || data.creditScore > 900) throw new Error('Credit score must be between 300 and 900')
    if (data.loanAmount <= 0) throw new Error('Loan amount must be greater than 0')
    if (data.loanAmount > 50000000) throw new Error('Loan amount exceeds institutional limit (5 Cr)')
    if (data.income <= 0) throw new Error('Monthly income must be greater than 0')
    if (data.income > 5000000) throw new Error('Monthly income exceeds processing limit (50 L)')

    const prediction = predictRisk(data)
    const newApp = {
      ...data,
      ...prediction,
      id: `APP-${crypto.randomUUID().split('-')[0].toUpperCase()}`,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      name: data.name.trim()
    }

    const savedApp = await apiFetch(`${API_URL}/applicants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newApp)
    })

    await dataService.addAuditLog({
      appId: savedApp.id,
      action: 'Created',
      officer: 'System User',
      note: 'New application submitted via portal.'
    })

    return savedApp
  },

  updateApplicantStatus: async (id, status, officer, note) => {
    if (!id) throw new Error('Applicant ID is required')
    const validStatuses = ['pending', 'approved', 'rejected', 'review']
    if (!validStatuses.includes(status)) throw new Error(`Invalid status: ${status}`)

    const app = await apiFetch(`${API_URL}/applicants/${id}`)
    const updatedApp = { ...app, status }

    await apiFetch(`${API_URL}/applicants/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedApp)
    })

    await dataService.addAuditLog({
      appId: id,
      action: status.charAt(0).toUpperCase() + status.slice(1),
      officer: officer || 'Unknown Officer',
      note: note || `Application ${status}.`
    })
  },

  getAuditLogs: async () => {
    return apiFetch(`${API_URL}/auditLogs`)
  },

  addAuditLog: async (log) => {
    const newLog = {
      ...log,
      id: `AUD-${crypto.randomUUID().split('-')[0].toUpperCase()}`,
      timestamp: new Date().toISOString()
    }
    return apiFetch(`${API_URL}/auditLogs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog)
    })
  },

  getPortfolioMetrics: async () => {
    const apps = await dataService.getApplicants()
    const total = apps.length
    if (total === 0) {
      return {
        totalApplications: 0, approvedCount: 0, rejectedCount: 0, pendingCount: 0,
        npaRate: '0.0', avgRiskScore: '0.0', totalExposure: '₹ 0.00 Cr',
        monthlyGrowth: '+0%', recoveryRate: 0, highRiskCount: 0, portfolioHealthScore: 100
      }
    }
    const approved  = apps.filter(a => a.status === 'approved').length
    const rejected  = apps.filter(a => a.status === 'rejected').length
    const pending   = apps.filter(a => a.status === 'pending').length
    const avgRisk   = apps.reduce((acc, curr) => acc + (curr.score || 0), 0) / total
    const totalExposure = apps.reduce((acc, curr) => acc + (curr.loanAmount || 0), 0)

    return {
      totalApplications: total,
      approvedCount: approved,
      rejectedCount: rejected,
      pendingCount: pending,
      npaRate: ((rejected / total) * 100).toFixed(1),
      avgRiskScore: avgRisk.toFixed(1),
      totalExposure: `₹ ${(totalExposure / 10000000).toFixed(2)} Cr`,
      // FIX: Compute real monthly growth from submission timestamps instead of hardcoding '+12.4%'
      monthlyGrowth: (() => {
        const now = new Date()
        const thisMonth = apps.filter(a => {
          const d = new Date(a.submittedAt)
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        }).length
        const lastMonth = apps.filter(a => {
          const d = new Date(a.submittedAt)
          const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear()
        }).length
        if (lastMonth === 0) return thisMonth > 0 ? '+100%' : '+0%'
        const pct = (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1)
        return (pct >= 0 ? '+' : '') + pct + '%'
      })(),
      // FIX: Compute real recovery rate from approved/(approved+rejected) ratio
      recoveryRate: approved + rejected > 0
        ? Math.round((approved / (approved + rejected)) * 100)
        : 0,
      highRiskCount: apps.filter(a => a.band === 'high').length,
      portfolioHealthScore: Math.round(100 - avgRisk),
    }
  }
}
