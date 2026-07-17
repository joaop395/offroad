import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

function generateTokens(admin) {
  const payload = { sub: admin.id, email: admin.email, role: admin.role }
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  )
  const refreshToken = jwt.sign(
    payload,
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
router.post('/login', async (req, res) => {
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

  const { accessToken, refreshToken } = generateTokens(admin)
  setRefreshCookie(res, refreshToken)

  res.json({ accessToken, user: { email: admin.email, role: admin.role } })
})

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  const token = req.cookies?.refresh_token
  if (!token) return res.status(401).json({ error: 'Não autorizado.' })

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
    const admin = await prisma.admin.findUnique({ where: { id: payload.sub } })
    if (!admin) return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' })

    const { accessToken, refreshToken } = generateTokens(admin)
    setRefreshCookie(res, refreshToken)
    res.json({ accessToken, user: { email: admin.email, role: admin.role } })
  } catch {
    return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' })
  }
})

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  const admin = await prisma.admin.findUnique({
    where: { id: req.admin.sub },
    select: { id: true, email: true, role: true },
  })
  if (!admin) return res.status(404).json({ error: 'Usuário não encontrado.' })
  res.json({ user: admin })
})

// POST /api/auth/logout
router.post('/logout', requireAuth, (_req, res) => {
  res.clearCookie('refresh_token', { path: '/api/auth' })
  res.json({ ok: true })
})

export default router
