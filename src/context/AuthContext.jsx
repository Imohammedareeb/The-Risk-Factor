import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'risk_factor_salt_2024')
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function validateEmail(email) {
  // FIX: Removed restrictive TLD whitelist that was blocking valid .in, .co.uk, .tech emails
  // The RFC 5322-compatible regex below is sufficient — any TLD with 2+ chars is valid
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return re.test(email)
}

export function validatePassword(password) {
  if (!password || password.length < 8) return 'Password must be at least 8 characters'
  if (password.length > 128) return 'Password is too long'
  if (!/[A-Z]/.test(password)) return 'Credential requires at least one uppercase letter'
  if (!/[0-9]/.test(password)) return 'Credential requires at least one number'
  if (!/[!@#$%^&*]/.test(password)) return 'Credential requires at least one special character (!@#$%^&*)'
  return null
}

export function validateName(name) {
  if (!name || name.trim().length < 2) return 'Name must be at least 2 characters'
  if (name.trim().length > 60) return 'Name must be under 60 characters'
  if (/[<>{}[\]\\^%`]/.test(name)) return 'Invalid characters in name'
  return null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('auth_user')
      if (storedUser) {
        const parsed = JSON.parse(storedUser)
        if (parsed?.id && parsed?.email && parsed?.name) {
          setUser(parsed)
        } else {
          localStorage.removeItem('auth_user')
        }
      }
    } catch {
      localStorage.removeItem('auth_user')
    }
    setLoading(false)
  }, [])

  const signup = async (email, password, name, confirmPassword) => {
    setLoading(true)
    try {
      if (!validateEmail(email)) throw new Error('Institutional email required (e.g. .com, .org, .ai)')
      const pwdError = validatePassword(password)
      if (pwdError) throw new Error(pwdError)
      const nameError = validateName(name)
      if (nameError) throw new Error(nameError)
      if (confirmPassword !== undefined && password !== confirmPassword) {
        throw new Error('Passwords do not match')
      }

      const sanitizedEmail = encodeURIComponent(email.toLowerCase().trim())
      const res = await fetch(`${API_URL}/users?email=${sanitizedEmail}`)
      if (!res.ok) throw new Error('Service unavailable. Run: npm run server')
      const existing = await res.json()
      if (existing.length > 0) throw new Error('An account with this email already exists')

      const hashedPassword = await hashPassword(password)
      const newUser = {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name.trim(),
        id: `USR-${crypto.randomUUID().split('-')[0].toUpperCase()}`,
        createdAt: new Date().toISOString(),
        role: 'analyst'
      }

      const createRes = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })
      if (!createRes.ok) throw new Error('Failed to create account. Please try again.')

      const savedUser = await createRes.json()
      const authUser = { email: savedUser.email, name: savedUser.name, id: savedUser.id, role: savedUser.role }
      localStorage.setItem('auth_user', JSON.stringify(authUser))
      setUser(authUser)
      return authUser
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    setLoading(true)
    try {
      if (!email || !password) throw new Error('Email and password are required')
      
      const sanitizedEmail = encodeURIComponent(email.toLowerCase().trim())
      const res = await fetch(`${API_URL}/users?email=${sanitizedEmail}`)
      if (!res.ok) throw new Error('Service unavailable. Run: npm run server')
      const users = await res.json()
      if (users.length === 0) throw new Error('Invalid email or password')

      const foundUser = users[0]
      const hashedInput = await hashPassword(password)
      const isHashMatch = foundUser.password === hashedInput
      if (!isHashMatch) throw new Error('Invalid email or password')

      const authUser = { email: foundUser.email, name: foundUser.name, id: foundUser.id, role: foundUser.role || 'analyst' }
      localStorage.setItem('auth_user', JSON.stringify(authUser))
      setUser(authUser)
      return authUser
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_user')
    setUser(null)
    // Navigation handled by the calling component (Navbar calls navigate('/login') after logout())
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
