import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { rateLimit } from 'express-rate-limit'

import authRoutes from './routes/auth.js'
import eventsRoutes from './routes/events.js'
import paymentsRoutes from './routes/payments.js'
import settingsRoutes from './routes/settings.js'

const app = express()
const PORT = process.env.PORT || 3001
const allowedOrigins = [
  ...new Set([
    ...String(process.env.FRONTEND_URL ?? '')
      .split(',')
      .map(origin => origin.trim())
      .filter(Boolean),
    'http://localhost:5173',
    'http://localhost:3000',
  ]),
]

// ── Segurança ──────────────────────────────────────────────────────────────
app.set('trust proxy', 1)

app.use(helmet())

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    return callback(new Error('Origem não permitida pelo CORS.'))
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

// ── Rotas ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/payments', paymentsRoutes)
app.use('/api/settings', settingsRoutes)

app.get('/api/health', (_req, res) => res.json({ ok: true }))

// ── Erro global ────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Erro interno do servidor.' })
})

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`)
})
