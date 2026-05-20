import { createContext, useContext, useState, useCallback } from 'react'
import { API_BASE } from '../lib/api'

const AuthContext = createContext(null)

function parseUser() {
  try {
    const raw = sessionStorage.getItem('admin_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('admin_token'))
  const [user, setUser] = useState(parseUser)

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Erro ao fazer login.')
    sessionStorage.setItem('admin_token', data.accessToken)
    sessionStorage.setItem('admin_user', JSON.stringify(data.user))
    setToken(data.accessToken)
    setUser(data.user)
    return data.accessToken
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      })
    } catch {}
    sessionStorage.removeItem('admin_token')
    sessionStorage.removeItem('admin_user')
    setToken(null)
    setUser(null)
  }, [token])

  const refresh = useCallback(async () => {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
    if (!res.ok) {
      sessionStorage.removeItem('admin_token')
      sessionStorage.removeItem('admin_user')
      setToken(null)
      setUser(null)
      throw new Error('Sessão expirada.')
    }
    const data = await res.json()
    sessionStorage.setItem('admin_token', data.accessToken)
    sessionStorage.setItem('admin_user', JSON.stringify(data.user))
    setToken(data.accessToken)
    setUser(data.user)
    return data.accessToken
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, login, logout, refresh, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
