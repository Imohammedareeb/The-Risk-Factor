const CONFIG = {
  low:     { label: 'Secure',    bg: 'var(--success-bg)', text: 'var(--success)' },
  medium:  { label: 'Moderate',  bg: 'var(--warning-bg)', text: 'var(--warning)' },
  high:    { label: 'Critical',  bg: 'var(--danger-bg)',  text: 'var(--danger)' },
  approved:{ label: 'Commit',    bg: 'var(--success-bg)', text: 'var(--success)' },
  rejected:{ label: 'Terminated',bg: 'var(--danger-bg)',  text: 'var(--danger)' },
  pending: { label: 'Queue',     bg: 'var(--primary-light)', text: 'var(--primary)' },
  review:  { label: 'Surveillance', bg: 'var(--warning-bg)', text: 'var(--warning)' },
  approve: { label: 'Approve',   bg: 'var(--success-bg)', text: 'var(--success)' },
  reject:  { label: 'Reject',    bg: 'var(--danger-bg)',  text: 'var(--danger)' },
  flagged: { label: 'Flagged',   bg: 'var(--danger-bg)',  text: 'var(--danger)' },
  reviewed:{ label: 'Verified',  bg: 'var(--info-bg)',    text: 'var(--info)' },
  created: { label: 'Origin',    bg: 'var(--bg-color)',   text: 'var(--text-primary)' },
}

export default function RiskBadge({ type, className = '' }) {
  const key  = (type ?? '').toLowerCase()
  const conf = CONFIG[key] ?? { label: type, bg: 'var(--bg-color)', text: 'var(--text-primary)' }
  
  return (
    <span
      className={[
        'inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border border-black/5 dark:border-white/5',
        className
      ].join(' ')}
      style={{ 
        background: conf.bg, 
        color: conf.text
      }}
    >
      {conf.label}
    </span>
  )
}
