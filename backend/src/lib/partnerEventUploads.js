import crypto from 'crypto'
import fs from 'fs/promises'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const backendRoot = path.resolve(__dirname, '..', '..')
const uploadsRoot = path.join(backendRoot, 'uploads')
const partnerBannerDir = path.join(uploadsRoot, 'partner-events')

async function ensurePartnerBannerDir() {
  await fs.mkdir(partnerBannerDir, { recursive: true })
}

const storage = multer.diskStorage({
  async destination(_req, _file, cb) {
    try {
      await ensurePartnerBannerDir()
      cb(null, partnerBannerDir)
    } catch (error) {
      cb(error)
    }
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.bin'
    const safeExt = /^[.][a-z0-9]+$/.test(ext) ? ext : '.bin'
    const id = crypto.randomBytes(12).toString('hex')
    cb(null, `partner-${Date.now()}-${id}${safeExt}`)
  },
})

function fileFilter(_req, file, cb) {
  if (!file.mimetype?.startsWith('image/')) {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'banner'))
    return
  }

  cb(null, true)
}

export const partnerBannerUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
})

export async function ensureUploadsReady() {
  await ensurePartnerBannerDir()
}

export function buildPartnerBannerUrl(filename) {
  return `/uploads/partner-events/${filename}`
}

export async function removeUploadedFileByPath(filePath) {
  if (!filePath) return

  try {
    await fs.unlink(filePath)
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
}

export async function removePartnerBannerByUrl(bannerUrl) {
  if (!bannerUrl?.startsWith('/uploads/partner-events/')) return

  const fileName = path.basename(bannerUrl)
  const filePath = path.join(partnerBannerDir, fileName)
  await removeUploadedFileByPath(filePath)
}
