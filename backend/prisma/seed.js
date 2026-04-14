import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL e ADMIN_PASSWORD devem estar definidos no .env')
  }

  const existing = await prisma.admin.findUnique({ where: { email } })
  if (existing) {
    console.log(`Admin já existe: ${email}`)
  } else {
    const passwordHash = await bcrypt.hash(password, 12)
    await prisma.admin.create({ data: { email, passwordHash } })
    console.log(`✓ Admin criado: ${email}`)
  }

  // Garante que Settings existe com id=1
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, whatsappNumber: '' },
  })

  console.log('✓ Settings inicializado')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
