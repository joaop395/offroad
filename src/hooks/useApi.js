import { useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { API_BASE } from '../lib/api'

export function useApi() {
  const { token, refresh, logout } = useAuth()

  const apiFetch = useCallback(async (path, options = {}) => {
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

    const doRequest = async (t) => fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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

  return { apiFetch, apiBase: API_BASE }
}
