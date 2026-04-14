import { useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export function useApi() {
  const { token, refresh, logout } = useAuth()

  const apiFetch = useCallback(async (path, options = {}) => {
    const doRequest = async (t) => fetch(`${API}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
    })

    let res = await doRequest(token)

    // Token expirado → tenta refresh uma vez
    if (res.status === 401) {
      try {
        const newToken = await refresh()
        res = await doRequest(newToken)
      } catch {
        logout()
        throw new Error('Sessão expirada. Faça login novamente.')
      }
    }

    return res
  }, [token, refresh, logout])

  return { apiFetch, apiBase: API }
}
