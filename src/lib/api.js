const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1'])

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '')
}

function resolveConfiguredApiBase() {
  const configured = import.meta.env.VITE_API_URL?.trim()
  if (!configured) return null

  if (typeof window === 'undefined') {
    return trimTrailingSlash(configured)
  }

  try {
    const url = new URL(configured)
    const currentHost = window.location.hostname

    // Se o build ficou com localhost, mas a app abriu por IP/domínio,
    // em ambiente público preferimos mesma origem e deixamos o nginx
    // encaminhar /api internamente para a 3001.
    if (!LOOPBACK_HOSTS.has(currentHost) && LOOPBACK_HOSTS.has(url.hostname)) {
      return trimTrailingSlash(window.location.origin)
    }

    return trimTrailingSlash(url.toString())
  } catch {
    return trimTrailingSlash(configured)
  }
}

function resolveRuntimeApiBase() {
  if (typeof window === 'undefined') {
    return 'http://localhost:3001'
  }

  if (!LOOPBACK_HOSTS.has(window.location.hostname)) {
    return trimTrailingSlash(window.location.origin)
  }

  const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:'
  return `${protocol}//${window.location.hostname}:3001`
}

export const API_BASE = resolveConfiguredApiBase() ?? resolveRuntimeApiBase()
export const API_PATHS = {
  ownEvents: '/api/own-events',
  legacyEvents: '/api/events',
  partnerEvents: '/api/partner-events',
  calendarEvents: '/api/calendar-events',
  vehicleRegistrations: '/api/vehicle-registrations',
  gallery: '/api/gallery',
  sponsors: '/api/sponsors',
  tips: '/api/tips',
}

export function resolveApiAssetUrl(path) {
  if (!path) return null

  const normalizedPath = path.startsWith('/uploads/') ? `/api${path}` : path

  try {
    return new URL(normalizedPath, `${API_BASE}/`).toString()
  } catch {
    return normalizedPath
  }
}
