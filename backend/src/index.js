import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { rateLimit } from 'express-rate-limit'
import path from 'path'
import { fileURLToPath } from 'url'

import authRoutes from './routes/auth.js'
import calendarEventsRoutes from './routes/calendar-events.js'
import eventsRoutes from './routes/events.js'
import partnerEventsRoutes from './routes/partner-events.js'
import paymentsRoutes from './routes/payments.js'
import settingsRoutes from './routes/settings.js'
import galleryRoutes from './routes/gallery.js'
import sponsorRoutes from './routes/sponsors.js'
import tipsRoutes from './routes/tips.js'
import vehicleRegistrationsRoutes from './routes/vehicle-registrations.js'
import { ensureAccountabilityUploadsReady } from './lib/accountabilityUploads.js'
import { ensureUploadsReady } from './lib/partnerEventUploads.js'
import { ensureGalleryUploadsReady } from './lib/galleryUploads.js'
import { ensureSponsorUploadsReady } from './lib/sponsorUploads.js'
import { ensureTipUploadsReady } from './lib/tipUploads.js'
import fs from 'fs/promises'
import path2 from 'path'
import { fileURLToPath as fileURLToPath2 } from 'url'

const __filename2 = fileURLToPath2(import.meta.url)
const __dirname2 = path2.dirname(__filename2)
const logoDir = path2.join(__dirname2, '..', 'uploads', 'event-logos')

async function ensureLogoUploadsReady() {
  await fs.mkdir(logoDir, { recursive: true })
}

const app = express()
const PORT = process.env.PORT || 3001
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function normalizeOrigin(value) {
  const trimmed = String(value ?? '').trim()
  if (!trimmed) return null

  try {
    return new URL(trimmed).origin
  } catch {
    return null
  }
}

const allowedOrigins = [
  ...new Set([
    ...String(process.env.FRONTEND_URL ?? '')
      .split(',')
      .map(origin => normalizeOrigin(origin))
      .filter(Boolean),
    'http://localhost:5173',
    'http://localhost:3000',
    'https://offroadsemjuizo.com.br',
    'http://offroadsemjuizo.com.br',
    'https://www.offroadsemjuizo.com.br',
    'http://www.offroadsemjuizo.com.br',
  ]),
]

const allowedHosts = new Set(
  allowedOrigins
    .map(origin => {
      try {
        return new URL(origin).hostname
      } catch {
        return null
      }
    })
    .filter(Boolean),
)

// ── Segurança ──────────────────────────────────────────────────────────────
app.set('trust proxy', 1)

app.use(helmet())

app.use(cors({
  origin(origin, callback) {
    const normalizedOrigin = normalizeOrigin(origin)

    if (!origin || !normalizedOrigin) {
      return callback(null, true)
    }

    try {
      const { hostname } = new URL(normalizedOrigin)
      if (allowedOrigins.includes(normalizedOrigin) || allowedHosts.has(hostname)) {
        return callback(null, true)
      }
    } catch {}

    return callback(null, false)
  },
  credentials: true,
}))

// Rate limit global: 100 req/min por IP
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em breve.' },
}))

// ── Parsers ────────────────────────────────────────────────────────────────
// /api/payments/webhook precisa do raw body para verificar assinatura do MP
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }))
app.use(express.json())
app.use(cookieParser())
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))
app.use('/api/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// ── Rotas ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/calendar-events', calendarEventsRoutes)
app.use('/api/own-events', eventsRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/partner-events', partnerEventsRoutes)
app.use('/api/payments', paymentsRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/gallery', galleryRoutes)
app.use('/api/sponsors', sponsorRoutes)
app.use('/api/tips', tipsRoutes)
app.use('/api/vehicle-registrations', vehicleRegistrationsRoutes)

app.get('/api/health', (_req, res) => res.json({ ok: true }))

// ── Erro global ────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Erro interno do servidor.' })
})

Promise.all([
  ensureUploadsReady(),
  ensureAccountabilityUploadsReady(),
  ensureGalleryUploadsReady(),
  ensureSponsorUploadsReady(),
  ensureTipUploadsReady(),
  ensureLogoUploadsReady(),
])
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend rodando na porta ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Falha ao preparar diretórios de upload', error)
    process.exit(1)
  })
