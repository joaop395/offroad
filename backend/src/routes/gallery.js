import { Router } from 'express'
import multer from 'multer'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import {
  galleryUpload,
  buildGalleryImageUrl,
  removeGalleryImageByUrl,
  removeUploadedFileByPath,
} from '../lib/galleryUploads.js'

const router = Router()

const gallerySchema = z.object({
  label: z.string().trim().min(1, 'Label é obrigatório.').max(120),
  order: z.number().int().nonnegative(),
})

function normalizeGalleryBody(body) {
  return {
    label: String(body?.label ?? ''),
    order: Number(body?.order ?? 0),
  }
}

function parseUpload(req, res) {
  return new Promise((resolve, reject) => {
    galleryUpload.single('image')(req, res, (error) => {
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

// GET /api/gallery — público
router.get('/', async (_req, res) => {
  const images = await prisma.galleryImage.findMany({ orderBy: { order: 'asc' } })
  res.json(images)
})

// POST /api/gallery — admin
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

  const result = gallerySchema.safeParse(normalizeGalleryBody(req.body))
  if (!result.success) {
    await removeUploadedFileByPath(req.file?.path)
    return res.status(400).json({ error: result.error.flatten() })
  }

  const filename = req.file.filename
  const image = await prisma.galleryImage.create({
    data: {
      filename,
      label: result.data.label,
      order: result.data.order,
    },
  })

  res.status(201).json(image)
})

// PUT /api/gallery/:id — admin
router.put('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id)
  const existing = await prisma.galleryImage.findUnique({ where: { id } })
  if (!existing) return res.status(404).json({ error: 'Imagem não encontrada.' })

  try {
    await parseUpload(req, res)
  } catch (error) {
    if (handleUploadError(error, res)) return
    throw error
  }

  const result = gallerySchema.safeParse(normalizeGalleryBody(req.body))
  if (!result.success) {
    await removeUploadedFileByPath(req.file?.path)
    return res.status(400).json({ error: result.error.flatten() })
  }

  const nextFilename = req.file ? req.file.filename : existing.filename

  const image = await prisma.galleryImage.update({
    where: { id },
    data: {
      filename: nextFilename,
      label: result.data.label,
      order: result.data.order,
    },
  })

  if (req.file && existing.filename) {
    await removeGalleryImageByUrl(buildGalleryImageUrl(existing.filename))
  }

  res.json(image)
})

// DELETE /api/gallery/:id — admin
router.delete('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id)
  const existing = await prisma.galleryImage.findUnique({ where: { id } })
  if (!existing) return res.status(404).json({ error: 'Imagem não encontrada.' })

  await prisma.galleryImage.delete({ where: { id } })
  await removeGalleryImageByUrl(buildGalleryImageUrl(existing.filename))

  res.json({ ok: true })
})

export default router
