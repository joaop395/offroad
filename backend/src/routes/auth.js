import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// Rate limit específico para login: 5 tentativas / 15 min por IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

function generateTokens(adminId) {
  const accessToken = jwt.sign(
    { sub: adminId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  )
  const refreshToken = jwt.sign(
    { sub: adminId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )
  return { accessToken, refreshToken }
}

function setRefreshCookie(res, token) {
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    path: '/api/auth',
  })
}

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
  const result = loginSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: 'Credenciais inválidas.' })
  }

  const { email, password } = result.data
  const admin = await prisma.admin.findUnique({ where: { email } })

  // Timing-safe: sempre roda bcrypt mesmo se admin não existe
  const hash = admin?.passwordHash ?? '$2a$12$invalidhashfortimingsafety000000000000000000000'
  const valid = await bcrypt.compare(password, hash)

  if (!admin || !valid) {
    return res.status(401).json({ error: 'Credenciais inválidas.' })
  }

  const { accessToken, refreshToken } = generateTokens(admin.id)
  setRefreshCookie(res, refreshToken)

  res.json({ accessToken })
})

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  const token = req.cookies?.refresh_token
  if (!token) return res.status(401).json({ error: 'Não autorizado.' })

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
    const { accessToken, refreshToken } = generateTokens(payload.sub)
    setRefreshCookie(res, refreshToken)
    res.json({ accessToken })
  } catch {
    return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' })
  }
})

// POST /api/auth/logout
router.post('/logout', requireAuth, (_req, res) => {
  res.clearCookie('refresh_token', { path: '/api/auth' })
  res.json({ ok: true })
})

export default router
