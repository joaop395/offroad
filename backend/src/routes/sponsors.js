import { Router } from 'express'
import multer from 'multer'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import {
  sponsorUpload,
  buildSponsorImageUrl,
  removeSponsorImageByUrl,
  removeUploadedFileByPath,
} from '../lib/sponsorUploads.js'

const router = Router()

const sponsorSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório.').max(120),
  url: z.string().url('Link inválido.').nullable().or(z.literal('')),
  order: z.number().int().nonnegative(),
})

function normalizeSponsorBody(body) {
  return {
    name: String(body?.name ?? ''),
    url: String(body?.url ?? '').trim() || null,
    order: Number(body?.order ?? 0),
  }
}

function parseUpload(req, res) {
  return new Promise((resolve, reject) => {
    sponsorUpload.single('image')(req, res, (error) => {
      if (error) reject(error)
      else resolve()
    })
  })
}

function handleUploadError(error, res) {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'Imagem deve ter no máximo 5MB.' })
      return true
    }
    res.status(400).json({ error: 'Imagem inválida. Envie uma imagem compatível.' })
    return true
  }
  return false
}

// GET /api/sponsors — público
router.get('/', async (_req, res) => {
  const sponsors = await prisma.sponsor.findMany({ orderBy: { order: 'asc' } })
  res.json(sponsors)
})

// POST /api/sponsors — admin
router.post('/', requireAuth, async (req, res) => {
  try {
    await parseUpload(req, res)
  } catch (error) {
    if (handleUploadError(error, res)) return
    throw error
  }

  if (!req.file) {
    return res.status(400).json({ error: 'Imagem é obrigatória.' })
  }

  const result = sponsorSchema.safeParse(normalizeSponsorBody(req.body))
  if (!result.success) {
    await removeUploadedFileByPath(req.file?.path)
    return res.status(400).json({ error: result.error.flatten() })
  }

  const sponsor = await prisma.sponsor.create({
    data: {
      filename: req.file.filename,
      name: result.data.name,
      url: result.data.url || null,
      order: result.data.order,
    },
  })

  res.status(201).json(sponsor)
})

// PUT /api/sponsors/:id — admin
router.put('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id)
  const existing = await prisma.sponsor.findUnique({ where: { id } })
  if (!existing) return res.status(404).json({ error: 'Patrocinador não encontrado.' })

  try {
    await parseUpload(req, res)
  } catch (error) {
    if (handleUploadError(error, res)) return
    throw error
  }

  const result = sponsorSchema.safeParse(normalizeSponsorBody(req.body))
  if (!result.success) {
    await removeUploadedFileByPath(req.file?.path)
    return res.status(400).json({ error: result.error.flatten() })
  }

  const nextFilename = req.file ? req.file.filename : existing.filename

  const sponsor = await prisma.sponsor.update({
    where: { id },
    data: {
      filename: nextFilename,
      name: result.data.name,
      url: result.data.url || null,
      order: result.data.order,
    },
  })

  if (req.file && existing.filename) {
    await removeSponsorImageByUrl(buildSponsorImageUrl(existing.filename))
  }

  res.json(sponsor)
})

// DELETE /api/sponsors/:id — admin
router.delete('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id)
  const existing = await prisma.sponsor.findUnique({ where: { id } })
  if (!existing) return res.status(404).json({ error: 'Patrocinador não encontrado.' })

  await prisma.sponsor.delete({ where: { id } })
  await removeSponsorImageByUrl(buildSponsorImageUrl(existing.filename))

  res.json({ ok: true })
})

export default router
