import { useEffect, useState } from 'react'

import { API_BASE, API_PATHS } from '../lib/api'

export function useCalendarEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError('')

      try {
        const res = await fetch(`${API_BASE}${API_PATHS.calendarEvents}`)
        if (!res.ok) throw new Error('Nao foi possivel carregar os eventos.')
        const data = await res.json()
        if (active) setEvents(data)
      } catch (err) {
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  return { events, loading, error }
}
