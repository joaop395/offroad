import { Router } from 'express'
import multer from 'multer'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import {
  tipImageUpload,
  buildTipImageUrl,
  removeTipImageByUrl,
  removeUploadedFileByPath,
} from '../lib/tipUploads.js'

const router = Router()

const YT_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  /^([a-zA-Z0-9_-]{11})$/,
]

function extractYoutubeId(url) {
  const trimmed = String(url ?? '').trim()
  for (const pattern of YT_PATTERNS) {
    const match = trimmed.match(pattern)
    if (match) return match[1]
  }
  return null
}

const tipSchema = z.object({
  title: z.string().trim().min(1, 'Título é obrigatório.').max(120),
  description: z.string().trim().max(2000).nullable().optional(),
  youtubeUrl: z.string().trim().min(1, 'URL do YouTube é obrigatória.'),
  order: z.number().int().nonnegative(),
  published: z.boolean(),
})

function normalizeTipBody(body) {
  return {
    title: String(body?.title ?? ''),
    description: String(body?.description ?? '').trim() || null,
    youtubeUrl: String(body?.youtubeUrl ?? ''),
    order: Number(body?.order ?? 0),
    published: String(body?.published ?? 'true').toLowerCase() === 'true',
  }
}

function parseUpload(req, res) {
  return new Promise((resolve, reject) => {
    tipImageUpload.single('image')(req, res, (error) => {
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

async function handleYouTubeValidation(body) {
  const videoId = extractYoutubeId(body.youtubeUrl)
  if (!videoId) {
    return { error: 'URL do YouTube inválida. Use link de vídeo do YouTube.' }
  }
  return { videoId }
}

// GET /api/tips — público
router.get('/', async (_req, res) => {
  const tips = await prisma.tip.findMany({
    where: { published: true },
    orderBy: { order: 'asc' },
  })
  res.json(tips)
})

// GET /api/tips/all — admin
router.get('/all', requireAuth, async (_req, res) => {
  const tips = await prisma.tip.findMany({ orderBy: { order: 'asc' } })
  res.json(tips)
})

// POST /api/tips — admin
router.post('/', requireAuth, async (req, res) => {
  try {
    await parseUpload(req, res)
  } catch (error) {
    if (handleUploadError(error, res)) return
    throw error
  }

  const parsed = tipSchema.safeParse(normalizeTipBody(req.body))
  if (!parsed.success) {
    await removeUploadedFileByPath(req.file?.path)
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const { videoId, error: ytError } = await handleYouTubeValidation(parsed.data)
  if (ytError) {
    await removeUploadedFileByPath(req.file?.path)
    return res.status(400).json({ error: ytError })
  }

  const imageUrl = req.file ? buildTipImageUrl(req.file.filename) : null

  const tip = await prisma.tip.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      youtubeUrl: `https://youtu.be/${videoId}`,
      imageUrl,
      order: parsed.data.order,
      published: parsed.data.published,
    },
  })

  res.status(201).json(tip)
})

// PUT /api/tips/:id — admin
router.put('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id)
  const existing = await prisma.tip.findUnique({ where: { id } })
  if (!existing) return res.status(404).json({ error: 'Dica não encontrada.' })

  try {
    await parseUpload(req, res)
  } catch (error) {
    if (handleUploadError(error, res)) return
    throw error
  }

  const parsed = tipSchema.safeParse(normalizeTipBody(req.body))
  if (!parsed.success) {
    await removeUploadedFileByPath(req.file?.path)
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const { videoId, error: ytError } = await handleYouTubeValidation(parsed.data)
  if (ytError) {
    await removeUploadedFileByPath(req.file?.path)
    return res.status(400).json({ error: ytError })
  }

  const nextImageUrl = req.file
    ? buildTipImageUrl(req.file.filename)
    : req.body.removeImage === 'true'
      ? null
      : existing.imageUrl

  const tip = await prisma.tip.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      youtubeUrl: `https://youtu.be/${videoId}`,
      imageUrl: nextImageUrl,
      order: parsed.data.order,
      published: parsed.data.published,
    },
  })

  if (req.file && existing.imageUrl) {
    await removeTipImageByUrl(existing.imageUrl)
  } else if (!req.file && req.body.removeImage === 'true' && existing.imageUrl) {
    await removeTipImageByUrl(existing.imageUrl)
  }

  res.json(tip)
})

// PATCH /api/tips/reorder — admin (lote)
router.patch('/reorder', requireAuth, async (req, res) => {
  const { items } = req.body
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Lista de itens é obrigatória.' })
  }

  await prisma.$transaction(
    items.map(({ id, order }) =>
      prisma.tip.update({ where: { id: Number(id) }, data: { order: Number(order) } })
    )
  )

  res.json({ ok: true })
})

// DELETE /api/tips/:id — admin
router.delete('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id)
  const existing = await prisma.tip.findUnique({ where: { id } })
  if (!existing) return res.status(404).json({ error: 'Dica não encontrada.' })

  await prisma.tip.delete({ where: { id } })
  await removeTipImageByUrl(existing.imageUrl)

  res.json({ ok: true })
})

export default router
