import { createContext, useContext, useState, useCallback } from 'react'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('admin_token'))

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Erro ao fazer login.')
    sessionStorage.setItem('admin_token', data.accessToken)
    setToken(data.accessToken)
    return data.accessToken
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch(`${API}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      })
    } catch {}
    sessionStorage.removeItem('admin_token')
    setToken(null)
  }, [token])

  const refresh = useCallback(async () => {
    const res = await fetch(`${API}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
    if (!res.ok) {
      sessionStorage.removeItem('admin_token')
      setToken(null)
      throw new Error('Sessão expirada.')
    }
    const data = await res.json()
    sessionStorage.setItem('admin_token', data.accessToken)
    setToken(data.accessToken)
    return data.accessToken
  }, [])

  return (
    <AuthContext.Provider value={{ token, login, logout, refresh, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
