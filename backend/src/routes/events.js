import { Router } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { slotsUsed, withSlots } from '../lib/calendarEvents.js'

const router = Router()

const classificationValues = ['LEVE_4X4', 'LEVE_AT_4X4', 'MODERADA_AT', 'MODERADA_MUD', 'AVANCADA', 'REUNIAO']

const ownEventSchema = z.object({
  name: z.string().trim().min(1, 'Nome do evento é obrigatório.').max(120),
  date: z.string().datetime('Data e hora inválidas.'),
  location: z.string().trim().min(1, 'Local é obrigatório.').max(200),
  classification: z.enum(classificationValues, {
    errorMap: () => ({ message: 'Classificação inválida.' }),
  }),
  priceAdult: z.number().nonnegative('Valor adulto não pode ser negativo.'),
  priceChild: z.number().nonnegative('Valor criança não pode ser negativo.'),
  maxSlots: z.number().int('Vagas devem ser um número inteiro.').positive('Vagas são obrigatórias e devem ser maiores que zero.'),
}).strict()

// GET /api/own-events — público
router.get('/', async (_req, res) => {
  const events = await prisma.event.findMany({ orderBy: { date: 'asc' } })
  const result = await Promise.all(events.map(withSlots))

  res.json(result)
})

// GET /api/own-events/:id/slots — público
router.get('/:id/slots', async (req, res) => {
  const id = Number(req.params.id)
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) return res.status(404).json({ error: 'Evento não encontrado.' })

  const used = await slotsUsed(id)
  res.json({ maxSlots: event.maxSlots, slotsUsed: used, available: event.maxSlots - used })
})

// GET /api/own-events/:id/registrations — admin
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

// POST /api/own-events — admin
router.post('/', requireAuth, async (req, res) => {
  const result = ownEventSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: result.error.flatten() })
  }

  const event = await prisma.event.create({ data: result.data })
  res.status(201).json(event)
})

// PUT /api/own-events/:id — admin
router.put('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id)
  const result = ownEventSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: result.error.flatten() })
  }

  const existing = await prisma.event.findUnique({ where: { id } })
  if (!existing) return res.status(404).json({ error: 'Evento não encontrado.' })

  const event = await prisma.event.update({ where: { id }, data: result.data })
  res.json(event)
})

// DELETE /api/own-events/:id — admin
router.delete('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id)
  const existing = await prisma.event.findUnique({ where: { id } })
  if (!existing) return res.status(404).json({ error: 'Evento não encontrado.' })

  await prisma.event.delete({ where: { id } })
  res.json({ ok: true })
})

export default router
