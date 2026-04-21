import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import PageShell from './components/layout/PageShell'
import Dashboard from './components/sections/Dashboard'
import EvaluatePage from './components/sections/EvaluatePage'
import HeatmapPage from './components/sections/HeatmapPage'
import ExportPage from './components/sections/ExportPage'
import EMIPage from './components/sections/EMIPage'
import ComparePage from './components/sections/ComparePage'
import LoginPage from './components/sections/LoginPage'
import SignupPage from './components/sections/SignupPage'
import ProfilePage from './components/sections/ProfilePage'
import NotFoundPage from './components/sections/NotFoundPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--bg-color)]">
      <div className="w-12 h-12 border-4 border-[#000080] border-t-transparent rounded-full animate-spin" />
      <p className="text-[var(--text-muted)] text-sm font-medium">Loading RiskGuard...</p>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AlreadyAuthed({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

function MainLayout({ children, activePage }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--surface)' }}>
      <Navbar activePage={activePage} />
      <PageShell pageKey={activePage}>
        {children}
      </PageShell>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes — redirect to dashboard if already logged in */}
              <Route path="/login" element={<AlreadyAuthed><LoginPage /></AlreadyAuthed>} />
              <Route path="/signup" element={<AlreadyAuthed><SignupPage /></AlreadyAuthed>} />

              {/* Root redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <MainLayout activePage="dashboard"><Dashboard /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/evaluate" element={
                <ProtectedRoute>
                  <MainLayout activePage="evaluate"><EvaluatePage /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/heatmap" element={
                <ProtectedRoute>
                  <MainLayout activePage="heatmap"><HeatmapPage /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/emi" element={
                <ProtectedRoute>
                  <MainLayout activePage="emi"><EMIPage /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/compare" element={
                <ProtectedRoute>
                  <MainLayout activePage="compare"><ComparePage /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/export" element={
                <ProtectedRoute>
                  <MainLayout activePage="export"><ExportPage /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <MainLayout activePage="profile"><ProfilePage /></MainLayout>
                </ProtectedRoute>
              } />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
