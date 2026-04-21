import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Bell, Menu, LayoutDashboard, Cpu, Map, Download, Calculator, GitCompare, LogOut, User, CheckCircle2, Clock } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { dataService } from '../../data/dataService'
import ThemeToggle from '../ui/ThemeToggle'
import MobileNav from './MobileNav'

const NAV_ITEMS = [
  { label: 'Overview',  id: 'dashboard', path: '/dashboard', Icon: LayoutDashboard },
  { label: 'Assess',    id: 'evaluate',  path: '/evaluate',  Icon: Cpu            },
  { label: 'Heatmap',   id: 'heatmap',   path: '/heatmap',   Icon: Map            },
  { label: 'Planner',   id: 'emi',       path: '/emi',       Icon: Calculator     },
  { label: 'Compare',   id: 'compare',   path: '/compare',   Icon: GitCompare     },
  { label: 'Export',    id: 'export',    path: '/export',    Icon: Download       },
]

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function Navbar() {
  const [scrolled, setScrolled]         = useState(false)
  const [mobileOpen, setMobileOpen]     = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [bellOpen, setBellOpen]         = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notifLoading, setNotifLoading] = useState(false)
  const [unread, setUnread]             = useState(0)

  const { user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  const userMenuRef = useRef(null)
  const bellRef     = useRef(null)

  const activePage = NAV_ITEMS.find(item => item.path === location.pathname)?.id || 'dashboard'

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const openBell = async () => {
    const next = !bellOpen
    setBellOpen(next)
    if (next && notifications.length === 0) {
      setNotifLoading(true)
      try {
        const logs = await dataService.getAuditLogs()
        const sorted = [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 6)
        setNotifications(sorted)
        setUnread(0)
      } catch {
        setNotifications([])
      } finally {
        setNotifLoading(false)
      }
    } else if (next) {
      setUnread(0)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 transition-all duration-500"
        style={{
          background: scrolled ? 'var(--surface)' : 'var(--bg-color)',
          boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
          borderBottom: '1px solid var(--border)'
        }}
      >
        <Link to="/dashboard" className="flex items-center gap-3 cursor-pointer group flex-shrink-0 no-underline">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-indigo-500 to-violet-600"
          >
            <ShieldCheck size={24} className="text-white" strokeWidth={2.5} />
          </motion.div>
          <div className="hidden lg:block">
            <span className="font-headline text-xl leading-none tracking-tighter font-black block text-[var(--text-primary)]">
              Risk Factor
            </span>
            <span className="font-label text-[10px] font-black uppercase tracking-[0.2em] block text-[var(--primary)] mt-1">
               Intelligence
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 bg-[var(--surface)] p-1.5 rounded-3xl border border-[var(--border)] shadow-sm">
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.id
            return (
              <Link
                key={item.id}
                to={item.path}
                className="relative flex items-center gap-2 px-6 py-3 rounded-2xl font-headline text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer no-underline hover:text-[var(--text-primary)]"
                style={{ color: isActive ? '#ffffff' : 'var(--text-primary)' }}
              >
                <item.Icon size={14} strokeWidth={2.5} />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-2xl shadow-md"
                    style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', zIndex: -1 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block" ref={bellRef}>
            <motion.button
              whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.06 }}
              onClick={openBell}
              className="relative w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-300 bg-[var(--surface)] shadow-sm border border-[var(--border)] text-[var(--text-primary)]"
              aria-label="Notifications"
            >
              <Bell size={20} strokeWidth={2.5} />
              {unread > 0 && (
                <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500 border-2 border-[var(--surface)]" />
              )}
            </motion.button>

            <AnimatePresence>
              {bellOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-80 bento-card !p-0 z-50 overflow-hidden"
                >
                  <div className="px-6 py-5 border-b border-[var(--border)]">
                    <p className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">Activity Feed</p>
                    <p className="text-[10px] mt-1 text-[var(--text-muted)] font-bold uppercase tracking-wider">System Surveillance</p>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                    {notifLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="flex flex-col items-center py-12 gap-3 opacity-50">
                        <CheckCircle2 size={32} className="text-[var(--text-muted)]" />
                        <p className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)]">System Secure</p>
                      </div>
                    ) : (
                      notifications.map((n, i) => (
                        <div key={n.id || i}
                          className="flex items-start gap-4 px-6 py-4 border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-color)] transition-colors"
                        >
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-[var(--bg-color)] text-[var(--primary)] shadow-inner">
                            <Clock size={14} strokeWidth={2.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black uppercase tracking-tight truncate text-[var(--text-primary)]">
                              {n.action} — {n.appId}
                            </p>
                            <p className="text-xs mt-0.5 text-[var(--text-secondary)] line-clamp-2 font-medium">{n.note}</p>
                            <p className="text-[10px] mt-2 font-bold text-[var(--text-muted)] uppercase tracking-widest">
                              {n.officer} · {timeAgo(n.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden sm:block"><ThemeToggle /></div>

          <div className="relative" ref={userMenuRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              aria-label="Open user menu"
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
              data-cy="user-avatar"
              className="w-11 h-11 rounded-2xl flex items-center justify-center font-headline text-xs font-black cursor-pointer ml-1 select-none shadow-lg border border-indigo-200 dark:border-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                color: '#ffffff',
              }}
            >
              {user?.name?.substring(0, 2).toUpperCase() || 'UA'}
            </motion.button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-64 bento-card !p-2 z-50 overflow-hidden"
                >
                  <div className="px-5 py-5 border-b border-[var(--border)] mb-2">
                    <p className="text-base font-black uppercase tracking-tighter text-[var(--text-primary)]">{user?.name}</p>
                    <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5 font-semibold">{user?.email}</p>
                    <div className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[var(--bg-color)] text-[var(--text-primary)] border border-[var(--border)] shadow-inner">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      {user?.role || 'Analyst'}
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-5 py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-300 no-underline hover:bg-[var(--bg-color)] text-[var(--text-primary)]"
                  >
                    <User size={16} strokeWidth={2.5} />
                    My Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-5 py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 mt-1"
                  >
                    <LogOut size={16} strokeWidth={2.5} />
                    Log Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            className="md:hidden w-11 h-11 flex items-center justify-center rounded-2xl bg-[var(--surface)] shadow-sm border border-[var(--border)] text-[var(--text-primary)]"
          >
            <Menu size={22} strokeWidth={2.5} />
          </motion.button>
        </div>
      </motion.header>

      <MobileNav
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        activePage={activePage}
        onNavigate={(id) => {
          const path = NAV_ITEMS.find(i => i.id === id)?.path
          if (path) navigate(path)
          setMobileOpen(false)
        }}
      />
    </>
  )
}
