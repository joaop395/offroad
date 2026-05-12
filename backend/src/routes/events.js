import { Router } from 'express'
import multer from 'multer'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { slotsUsed, withSlots } from '../lib/calendarEvents.js'
import {
  accountabilityImageUpload,
  buildAccountabilityImageUrl,
  removeAccountabilityImageByUrl,
  removeUploadedFileByPath,
} from '../lib/accountabilityUploads.js'

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
  removeAccountabilityImage: z.boolean(),
}).strict()

function normalizeOwnEventBody(body) {
  return {
    name: String(body?.name ?? ''),
    date: String(body?.date ?? ''),
    location: String(body?.location ?? ''),
    classification: String(body?.classification ?? ''),
    priceAdult: Number(body?.priceAdult),
    priceChild: Number(body?.priceChild),
    maxSlots: Number(body?.maxSlots),
    removeAccountabilityImage: String(body?.removeAccountabilityImage ?? '').toLowerCase() === 'true',
  }
}

function parseAccountabilityUpload(req, res) {
  return new Promise((resolve, reject) => {
    accountabilityImageUpload.single('accountabilityImage')(req, res, (error) => {
      if (error) reject(error)
      else resolve()
    })
  })
}

function handleUploadError(error, res) {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'Print da prestação deve ter no máximo 5MB.' })
      return true
    }

    res.status(400).json({ error: 'Print da prestação inválido. Envie uma imagem compatível.' })
    return true
  }

  return false
}

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
  try {
    await parseAccountabilityUpload(req, res)
  } catch (error) {
    if (handleUploadError(error, res)) return
    throw error
  }

  const result = ownEventSchema.safeParse(normalizeOwnEventBody(req.body))
  if (!result.success) {
    await removeUploadedFileByPath(req.file?.path)
    return res.status(400).json({ error: result.error.flatten() })
  }

  const { removeAccountabilityImage: _removeAccountabilityImage, ...eventData } = result.data
  const accountabilityImageUrl = req.file ? buildAccountabilityImageUrl(req.file.filename) : null
  const event = await prisma.event.create({
    data: {
      ...eventData,
      date: new Date(eventData.date),
      accountabilityImageUrl,
    },
  })
  res.status(201).json(event)
})

// PUT /api/own-events/:id — admin
router.put('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id)
  const existing = await prisma.event.findUnique({ where: { id } })
  if (!existing) return res.status(404).json({ error: 'Evento não encontrado.' })

  try {
    await parseAccountabilityUpload(req, res)
  } catch (error) {
    if (handleUploadError(error, res)) return
    throw error
  }

  const result = ownEventSchema.safeParse(normalizeOwnEventBody(req.body))
  if (!result.success) {
    await removeUploadedFileByPath(req.file?.path)
    return res.status(400).json({ error: result.error.flatten() })
  }

  const { removeAccountabilityImage, ...eventData } = result.data
  const nextAccountabilityImageUrl = req.file
    ? buildAccountabilityImageUrl(req.file.filename)
    : removeAccountabilityImage
      ? null
      : existing.accountabilityImageUrl

  const event = await prisma.event.update({
    where: { id },
    data: {
      ...eventData,
      date: new Date(eventData.date),
      accountabilityImageUrl: nextAccountabilityImageUrl,
    },
  })

  if (req.file && existing.accountabilityImageUrl) {
    await removeAccountabilityImageByUrl(existing.accountabilityImageUrl)
  } else if (!req.file && removeAccountabilityImage && existing.accountabilityImageUrl) {
    await removeAccountabilityImageByUrl(existing.accountabilityImageUrl)
  }

  res.json(event)
})

// DELETE /api/own-events/:id — admin
router.delete('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id)
  const existing = await prisma.event.findUnique({ where: { id } })
  if (!existing) return res.status(404).json({ error: 'Evento não encontrado.' })

  await prisma.event.delete({ where: { id } })
  await removeAccountabilityImageByUrl(existing.accountabilityImageUrl)
  res.json({ ok: true })
})

export default router
