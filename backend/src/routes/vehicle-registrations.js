import { Router } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/
const plateRegex = /^[A-Z]{3}-?\d[A-Z0-9]\d{2}$/i

const vehicleSchema = z.object({
  driverName: z.string().trim().min(2, 'Nome e obrigatorio.').max(120),
  cpf: z.string().regex(cpfRegex, 'CPF invalido. Use o formato XXX.XXX.XXX-XX.'),
  plate: z.string().regex(plateRegex, 'Placa invalida. Use o formato ABC-1234 ou ABC1D23.'),
  availableSlots: z.number().int().min(1, 'Vagas disponiveis e obrigatoria.').max(50),
}).strict()

function normalizeVehicleBody(body) {
  return {
    driverName: String(body?.driverName ?? ''),
    cpf: String(body?.cpf ?? '').trim(),
    plate: String(body?.plate ?? '').trim().toUpperCase(),
    availableSlots: Number(body?.availableSlots) || 0,
  }
}

// POST /api/vehicle-registrations/:eventId — publico (cadastro de veiculo)
router.post('/:eventId', async (req, res) => {
  const eventId = Number(req.params.eventId)
  const event = await prisma.event.findUnique({ where: { id: eventId } })

  if (!event) {
    return res.status(404).json({ error: 'Evento nao encontrado.' })
  }

  if (!event.isBeneficente) {
    return res.status(400).json({ error: 'Este evento nao aceita cadastro de veiculos.' })
  }

  const result = vehicleSchema.safeParse(normalizeVehicleBody(req.body))
  if (!result.success) {
    return res.status(400).json({ error: result.error.flatten() })
  }

  const existing = await prisma.vehicleRegistration.findFirst({
    where: {
      eventId,
      cpf: result.data.cpf,
    },
  })

  if (existing) {
    return res.status(409).json({ error: 'Este CPF ja esta cadastrado neste evento.' })
  }

  const vehicle = await prisma.vehicleRegistration.create({
    data: {
      eventId,
      ...result.data,
    },
  })

  res.status(201).json(vehicle)
})

// DELETE /api/vehicle-registrations/:eventId/:vehicleId — admin
router.delete('/:eventId/:vehicleId', requireAuth, async (req, res) => {
  const { eventId, vehicleId } = req.params
  const id = Number(vehicleId)
  const evId = Number(eventId)

  const vehicle = await prisma.vehicleRegistration.findFirst({
    where: { id, eventId: evId },
  })

  if (!vehicle) {
    return res.status(404).json({ error: 'Veiculo nao encontrado.' })
  }

  await prisma.vehicleRegistration.delete({ where: { id } })
  res.json({ ok: true })
})

export default router
