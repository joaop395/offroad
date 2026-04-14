import { Router } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const settingsSchema = z.object({
  whatsappNumber: z.string().min(1).max(20),
})

// GET /api/settings/public — público (só expõe o número do WhatsApp)
router.get('/public', async (_req, res) => {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } })
  res.json({ whatsappNumber: settings?.whatsappNumber ?? '' })
})

// GET /api/settings — admin
router.get('/', requireAuth, async (_req, res) => {
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, whatsappNumber: '' },
  })
  res.json(settings)
})

// PUT /api/settings — admin
router.put('/', requireAuth, async (req, res) => {
  const result = settingsSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: result.error.flatten() })
  }

  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: result.data,
    create: { id: 1, ...result.data },
  })
  res.json(settings)
})

export default router
