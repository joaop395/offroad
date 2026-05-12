import crypto from 'crypto'
import fs from 'fs/promises'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const backendRoot = path.resolve(__dirname, '..', '..')
const uploadsRoot = path.join(backendRoot, 'uploads')
const accountabilityDir = path.join(uploadsRoot, 'accountability')

async function ensureAccountabilityDir() {
  await fs.mkdir(accountabilityDir, { recursive: true })
}

const storage = multer.diskStorage({
  async destination(_req, _file, cb) {
    try {
      await ensureAccountabilityDir()
      cb(null, accountabilityDir)
    } catch (error) {
      cb(error)
    }
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.bin'
    const safeExt = /^[.][a-z0-9]+$/.test(ext) ? ext : '.bin'
    const id = crypto.randomBytes(12).toString('hex')
    cb(null, `accountability-${Date.now()}-${id}${safeExt}`)
  },
})

function fileFilter(_req, file, cb) {
  if (!file.mimetype?.startsWith('image/')) {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'accountabilityImage'))
    return
  }

  cb(null, true)
}

export const accountabilityImageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
})

export async function ensureAccountabilityUploadsReady() {
  await ensureAccountabilityDir()
}

export function buildAccountabilityImageUrl(filename) {
  return `/uploads/accountability/${filename}`
}

export async function removeUploadedFileByPath(filePath) {
  if (!filePath) return

  try {
    await fs.unlink(filePath)
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
}

export async function removeAccountabilityImageByUrl(imageUrl) {
  if (!imageUrl?.startsWith('/uploads/accountability/')) return

  const fileName = path.basename(imageUrl)
  const filePath = path.join(accountabilityDir, fileName)
  await removeUploadedFileByPath(filePath)
}
