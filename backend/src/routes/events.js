import { Router } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const difficultyValues = ['LEVE_4X4', 'LEVE_AT_4X4', 'MODERADA_AT', 'MODERADA_MUD', 'AVANCADA']

const eventSchema = z.object({
  name:       z.string().min(1).max(120),
  date:       z.string().datetime(),
  location:   z.string().min(1).max(200),
  difficulty: z.enum(difficultyValues),
  priceAdult: z.number().nonnegative(),
  priceChild: z.number().nonnegative(),
  maxSlots:   z.number().int().positive(),
})

// Calcula vagas restantes para um evento
async function slotsUsed(eventId) {
  const agg = await prisma.registration.aggregate({
    where: { eventId },
    _sum: { adults: true, children: true },
  })
  return (agg._sum.adults ?? 0) + (agg._sum.children ?? 0)
}

// GET /api/events — público
router.get('/', async (_req, res) => {
  const events = await prisma.event.findMany({ orderBy: { date: 'asc' } })

  const result = await Promise.all(events.map(async (e) => ({
    ...e,
    slotsUsed: await slotsUsed(e.id),
  })))

  res.json(result)
})

// GET /api/events/:id/slots — público
router.get('/:id/slots', async (req, res) => {
  const id = Number(req.params.id)
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) return res.status(404).json({ error: 'Evento não encontrado.' })

  const used = await slotsUsed(id)
  res.json({ maxSlots: event.maxSlots, slotsUsed: used, available: event.maxSlots - used })
})

// GET /api/events/:id/registrations — admin
router.get('/:id/registrations', requireAuth, async (req, res) => {
  const id = Number(req.params.id)
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) return res.status(404).json({ error: 'Evento não encontrado.' })

  const registrations = await prisma.registration.findMany({
    where: { eventId: id },
    orderBy: { paidAt: 'desc' },
  })
  res.json(registrations)
})

// POST /api/events — admin
router.post('/', requireAuth, async (req, res) => {
  const result = eventSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: result.error.flatten() })
  }

  const event = await prisma.event.create({ data: result.data })
  res.status(201).json(event)
})

// PUT /api/events/:id — admin
router.put('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id)
  const result = eventSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: result.error.flatten() })
  }

  const existing = await prisma.event.findUnique({ where: { id } })
  if (!existing) return res.status(404).json({ error: 'Evento não encontrado.' })

  const event = await prisma.event.update({ where: { id }, data: result.data })
  res.json(event)
})

// DELETE /api/events/:id — admin
router.delete('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id)
  const existing = await prisma.event.findUnique({ where: { id } })
  if (!existing) return res.status(404).json({ error: 'Evento não encontrado.' })

  await prisma.event.delete({ where: { id } })
  res.json({ ok: true })
})

export default router
