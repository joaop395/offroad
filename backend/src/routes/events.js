import { Router } from 'express'
import multer from 'multer'
import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
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

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const backendRoot = path.resolve(__dirname, '..', '..')
const uploadsRoot = path.join(backendRoot, 'uploads')
const logoDir = path.join(uploadsRoot, 'event-logos')

async function ensureLogoDir() {
  await fs.mkdir(logoDir, { recursive: true })
}

const logoStorage = multer.diskStorage({
  async destination(_req, _file, cb) {
    try {
      await ensureLogoDir()
      cb(null, logoDir)
    } catch (error) {
      cb(error)
    }
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.bin'
    const safeExt = /^[.][a-z0-9]+$/.test(ext) ? ext : '.bin'
    const id = crypto.randomBytes(12).toString('hex')
    cb(null, `logo-${Date.now()}-${id}${safeExt}`)
  },
})

function logoFileFilter(_req, file, cb) {
  if (!file.mimetype?.startsWith('image/')) {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'eventLogo'))
    return
  }
  cb(null, true)
}

const logoUpload = multer({
  storage: logoStorage,
  fileFilter: logoFileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
})

const router = Router()

const classificationValues = ['LEVE_4X4', 'LEVE_AT_4X4', 'MODERADA_AT', 'MODERADA_MUD', 'AVANCADA', 'REUNIAO']

const baseEventSchema = {
  name: z.string().trim().min(1, 'Nome do evento e obrigatorio.').max(120),
  date: z.string().datetime('Data e hora invalidas.'),
  location: z.string().trim().min(1, 'Local e obrigatorio.').max(200),
  description: z.string().max(5000).optional().nullable(),
}

const ownEventSchema = z.object({
  ...baseEventSchema,
  isBeneficente: z.boolean(),
  classification: z.enum(classificationValues, {
    errorMap: () => ({ message: 'Classificacao invalida.' }),
  }),
  priceAdult: z.number().nonnegative('Valor adulto nao pode ser negativo.'),
  priceChild: z.number().nonnegative('Valor crianca nao pode ser negativo.'),
  maxSlots: z.number().int('Vagas devem ser um numero inteiro.').nonnegative(),
  removeAccountabilityImage: z.boolean(),
}).strict()

function normalizeOwnEventBody(body) {
  return {
    name: String(body?.name ?? ''),
    date: String(body?.date ?? ''),
    location: String(body?.location ?? ''),
    description: body?.description ? String(body.description) : null,
    isBeneficente: String(body?.isBeneficente ?? '').toLowerCase() === 'true',
    classification: String(body?.classification ?? 'REUNIAO'),
    priceAdult: Number(body?.priceAdult) || 0,
    priceChild: Number(body?.priceChild) || 0,
    maxSlots: Number(body?.maxSlots) || 0,
    removeAccountabilityImage: String(body?.removeAccountabilityImage ?? '').toLowerCase() === 'true',
  }
}

const eventUpload = multer({
  storage: multer.diskStorage({
    async destination(_req, _file, cb) {
      try {
        const dir = _file.fieldname === 'eventLogo' ? logoDir : accountabilityDir
        await fs.mkdir(dir, { recursive: true })
        cb(null, dir)
      } catch (error) {
        cb(error)
      }
    },
    filename(_req, file, cb) {
      const ext = path.extname(file.originalname || '').toLowerCase() || '.bin'
      const safeExt = /^[.][a-z0-9]+$/.test(ext) ? ext : '.bin'
      const id = crypto.randomBytes(12).toString('hex')
      const prefix = file.fieldname === 'eventLogo' ? 'logo' : 'accountability'
      cb(null, `${prefix}-${Date.now()}-${id}${safeExt}`)
    },
  }),
  fileFilter(_req, file, cb) {
    if (!file.mimetype?.startsWith('image/')) {
      cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname))
      return
    }
    cb(null, true)
  },
  limits: { fileSize: 5 * 1024 * 1024, files: 2 },
})

function parseEventUpload(req, res) {
  return new Promise((resolve, reject) => {
    eventUpload.fields([
      { name: 'accountabilityImage', maxCount: 1 },
      { name: 'eventLogo', maxCount: 1 },
    ])(req, res, (error) => {
      if (error) reject(error)
      else resolve()
    })
  })
}

function handleUploadError(error, res) {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'Imagem deve ter no maximo 5MB.' })
      return true
    }
    res.status(400).json({ error: 'Imagem invalida. Envie uma imagem compativel.' })
    return true
  }
  return false
}

function buildLogoUrl(filename) {
  return `/uploads/event-logos/${filename}`
}

async function removeLogoByUrl(logoUrl) {
  if (!logoUrl?.startsWith('/uploads/event-logos/')) return
  const fileName = path.basename(logoUrl)
  const filePath = path.join(logoDir, fileName)
  await removeUploadedFileByPath(filePath)
}

function buildRegistrationLink(id) {
  return `/evento-beneficente/${id}`
}

// GET /api/own-events — publico
router.get('/', async (_req, res) => {
  const events = await prisma.event.findMany({ orderBy: { date: 'asc' } })
  const result = await Promise.all(events.map(withSlots))
  res.json(result)
})

// GET /api/own-events/:id — publico (evento individual)
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) return res.status(404).json({ error: 'Evento nao encontrado.' })

  const result = await withSlots(event)
  res.json(result)
})

// GET /api/own-events/:id/slots — publico
router.get('/:id/slots', async (req, res) => {
  const id = Number(req.params.id)
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) return res.status(404).json({ error: 'Evento nao encontrado.' })

  const used = await slotsUsed(id)
  res.json({ maxSlots: event.maxSlots, slotsUsed: used, available: event.maxSlots - used })
})

// GET /api/own-events/:id/registrations — admin
router.get('/:id/registrations', requireAuth, async (req, res) => {
  const id = Number(req.params.id)
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) return res.status(404).json({ error: 'Evento nao encontrado.' })

  const registrations = await prisma.registration.findMany({
    where: { eventId: id },
    orderBy: { paidAt: 'desc' },
  })
  res.json(registrations)
})

// GET /api/own-events/:id/vehicles — admin
router.get('/:id/vehicles', requireAuth, async (req, res) => {
  const id = Number(req.params.id)
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) return res.status(404).json({ error: 'Evento nao encontrado.' })

  const vehicles = await prisma.vehicleRegistration.findMany({
    where: { eventId: id },
    orderBy: { createdAt: 'desc' },
  })
  res.json(vehicles)
})

// POST /api/own-events — admin
router.post('/', requireAuth, async (req, res) => {
  try {
    await parseEventUpload(req, res)
  } catch (error) {
    if (handleUploadError(error, res)) return
    throw error
  }

  const result = ownEventSchema.safeParse(normalizeOwnEventBody(req.body))
  if (!result.success) {
    const accountabilityFile = req.files?.accountabilityImage?.[0]
    const logoFile = req.files?.eventLogo?.[0]
    await removeUploadedFileByPath(accountabilityFile?.path)
    await removeUploadedFileByPath(logoFile?.path)
    return res.status(400).json({ error: result.error.flatten() })
  }

  const { removeAccountabilityImage: _ra, ...eventData } = result.data
  const accountabilityFile = req.files?.accountabilityImage?.[0]
  const accountabilityImageUrl = accountabilityFile ? buildAccountabilityImageUrl(accountabilityFile.filename) : null
  const logoFile = req.files?.eventLogo?.[0]
  const logoUrl = logoFile ? buildLogoUrl(logoFile.filename) : null

  const event = await prisma.event.create({
    data: {
      ...eventData,
      date: new Date(eventData.date),
      accountabilityImageUrl,
      logoUrl,
    },
  })

  const eventWithSlots = await withSlots(event)
  res.status(201).json(eventWithSlots)
})

// PUT /api/own-events/:id — admin
router.put('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id)
  const existing = await prisma.event.findUnique({ where: { id } })
  if (!existing) return res.status(404).json({ error: 'Evento nao encontrado.' })

  try {
    await parseEventUpload(req, res)
  } catch (error) {
    if (handleUploadError(error, res)) return
    throw error
  }

  const result = ownEventSchema.safeParse(normalizeOwnEventBody(req.body))
  if (!result.success) {
    const accountabilityFile = req.files?.accountabilityImage?.[0]
    const logoFile = req.files?.eventLogo?.[0]
    await removeUploadedFileByPath(accountabilityFile?.path)
    await removeUploadedFileByPath(logoFile?.path)
    return res.status(400).json({ error: result.error.flatten() })
  }

  const { removeAccountabilityImage, ...eventData } = result.data
  const accountabilityFile = req.files?.accountabilityImage?.[0]
  const nextAccountabilityImageUrl = accountabilityFile
    ? buildAccountabilityImageUrl(accountabilityFile.filename)
    : removeAccountabilityImage
      ? null
      : existing.accountabilityImageUrl

  const logoFile = req.files?.eventLogo?.[0]
  const nextLogoUrl = logoFile
    ? buildLogoUrl(logoFile.filename)
    : req.body.removeLogo === 'true'
      ? null
      : existing.logoUrl

  const event = await prisma.event.update({
    where: { id },
    data: {
      ...eventData,
      date: new Date(eventData.date),
      accountabilityImageUrl: nextAccountabilityImageUrl,
      logoUrl: nextLogoUrl,
    },
  })

  if (accountabilityFile && existing.accountabilityImageUrl) {
    await removeAccountabilityImageByUrl(existing.accountabilityImageUrl)
  } else if (!accountabilityFile && removeAccountabilityImage && existing.accountabilityImageUrl) {
    await removeAccountabilityImageByUrl(existing.accountabilityImageUrl)
  }

  if (logoFile && existing.logoUrl) {
    await removeLogoByUrl(existing.logoUrl)
  } else if (!logoFile && req.body.removeLogo === 'true' && existing.logoUrl) {
    await removeLogoByUrl(existing.logoUrl)
  }

  const eventWithSlots = await withSlots(event)
  res.json(eventWithSlots)
})

// DELETE /api/own-events/:id — admin
router.delete('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id)
  const existing = await prisma.event.findUnique({ where: { id } })
  if (!existing) return res.status(404).json({ error: 'Evento nao encontrado.' })

  await prisma.event.delete({ where: { id } })
  await removeAccountabilityImageByUrl(existing.accountabilityImageUrl)
  await removeLogoByUrl(existing.logoUrl)
  res.json({ ok: true })
})

export default router
