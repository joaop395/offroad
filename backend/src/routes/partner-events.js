import { Router } from 'express'
import multer from 'multer'
import { z } from 'zod'

import prisma from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import {
  buildPartnerBannerUrl,
  partnerBannerUpload,
  removePartnerBannerByUrl,
  removeUploadedFileByPath,
} from '../lib/partnerEventUploads.js'

const router = Router()

const partnerEventBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  date: z.string().datetime(),
  description: z.string().trim().min(1).max(5000),
  location: z.string().trim().max(200).nullable(),
  removeBanner: z.boolean(),
})

function normalizePartnerEventBody(body) {
  return {
    name: String(body?.name ?? ''),
    date: String(body?.date ?? ''),
    description: String(body?.description ?? ''),
    location: String(body?.location ?? '').trim() || null,
    removeBanner: String(body?.removeBanner ?? '').toLowerCase() === 'true',
  }
}

function parseMulterUpload(req, res) {
  return new Promise((resolve, reject) => {
    partnerBannerUpload.single('banner')(req, res, (error) => {
      if (error) reject(error)
      else resolve()
    })
  })
}

function handleUploadError(error, res) {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'Banner deve ter no máximo 5MB.' })
      return true
    }

    res.status(400).json({ error: 'Banner inválido. Envie uma imagem compatível.' })
    return true
  }

  return false
}

router.get('/', requireAuth, async (_req, res) => {
  const events = await prisma.partnerEvent.findMany({ orderBy: { date: 'asc' } })
  res.json(events)
})

router.post('/', requireAuth, async (req, res) => {
  try {
    await parseMulterUpload(req, res)
  } catch (error) {
    if (handleUploadError(error, res)) return
    throw error
  }

  const parsed = partnerEventBodySchema.safeParse(normalizePartnerEventBody(req.body))
  if (!parsed.success) {
    await removeUploadedFileByPath(req.file?.path)
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const bannerUrl = req.file ? buildPartnerBannerUrl(req.file.filename) : null

  const event = await prisma.partnerEvent.create({
    data: {
      name: parsed.data.name,
      date: new Date(parsed.data.date),
      description: parsed.data.description,
      location: parsed.data.location,
      bannerUrl,
    },
  })

  res.status(201).json(event)
})

router.put('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id)
  const existing = await prisma.partnerEvent.findUnique({ where: { id } })
  if (!existing) return res.status(404).json({ error: 'Evento parceiro não encontrado.' })

  try {
    await parseMulterUpload(req, res)
  } catch (error) {
    if (handleUploadError(error, res)) return
    throw error
  }

  const parsed = partnerEventBodySchema.safeParse(normalizePartnerEventBody(req.body))
  if (!parsed.success) {
    await removeUploadedFileByPath(req.file?.path)
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const nextBannerUrl = req.file
    ? buildPartnerBannerUrl(req.file.filename)
    : parsed.data.removeBanner
      ? null
      : existing.bannerUrl

  const event = await prisma.partnerEvent.update({
    where: { id },
    data: {
      name: parsed.data.name,
      date: new Date(parsed.data.date),
      description: parsed.data.description,
      location: parsed.data.location,
      bannerUrl: nextBannerUrl,
    },
  })

  if (req.file && existing.bannerUrl) {
    await removePartnerBannerByUrl(existing.bannerUrl)
  } else if (!req.file && parsed.data.removeBanner && existing.bannerUrl) {
    await removePartnerBannerByUrl(existing.bannerUrl)
  }

  res.json(event)
})

router.delete('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id)
  const existing = await prisma.partnerEvent.findUnique({ where: { id } })
  if (!existing) return res.status(404).json({ error: 'Evento parceiro não encontrado.' })

  await prisma.partnerEvent.delete({ where: { id } })
  await removePartnerBannerByUrl(existing.bannerUrl)

  res.json({ ok: true })
})

export default router
