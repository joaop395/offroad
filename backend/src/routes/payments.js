import { Router } from 'express'
import { z } from 'zod'
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import prisma from '../lib/prisma.js'

const router = Router()

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
})

const checkoutSchema = z.object({
  eventId:         z.number().int().positive(),
  adults:          z.number().int().min(0),
  children:        z.number().int().min(0),
  responsibleName: z.string().min(1).max(120),
  responsiblePhone:z.string().min(8).max(20),
  email:           z.string().email(),
}).refine(d => d.adults + d.children >= 1, {
  message: 'Selecione ao menos 1 participante.',
})

function buildCheckoutMetadata({
  eventId,
  adults,
  children,
  responsibleName,
  responsiblePhone,
  email,
  total,
}) {
  return {
    // Mantemos as duas convenções para compatibilidade com payloads antigos e leitura do webhook.
    eventId,
    event_id: eventId,
    adults,
    children,
    responsibleName,
    responsible_name: responsibleName,
    responsiblePhone,
    responsible_phone: responsiblePhone,
    email,
    total,
  }
}

function pickFirst(...values) {
  return values.find(value => value !== undefined && value !== null && value !== '')
}

function normalizePaymentMetadata(metadata) {
  if (!metadata) return null

  const eventId = Number(pickFirst(metadata.event_id, metadata.eventId))
  const adults = Number(pickFirst(metadata.adults, 0))
  const children = Number(pickFirst(metadata.children, 0))
  const total = Number(pickFirst(metadata.total, 0))

  if (!Number.isInteger(eventId) || eventId <= 0) return null
  if (!Number.isFinite(adults) || adults < 0) return null
  if (!Number.isFinite(children) || children < 0) return null
  if (!Number.isFinite(total) || total < 0) return null

  return {
    eventId,
    adults,
    children,
    total,
    responsibleName: pickFirst(metadata.responsible_name, metadata.responsibleName, ''),
    responsiblePhone: pickFirst(metadata.responsible_phone, metadata.responsiblePhone, ''),
    email: pickFirst(metadata.email, ''),
  }
}

// POST /api/payments/checkout
router.post('/checkout', async (req, res) => {
  const result = checkoutSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: result.error.flatten() })
  }

  const { eventId, adults, children, responsibleName, responsiblePhone, email } = result.data

  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event) return res.status(404).json({ error: 'Evento não encontrado.' })

  // Verifica vagas disponíveis
  const agg = await prisma.registration.aggregate({
    where: { eventId },
    _sum: { adults: true, children: true },
  })
  const used = (agg._sum.adults ?? 0) + (agg._sum.children ?? 0)
  if (used + adults + children > event.maxSlots) {
    return res.status(409).json({ error: 'Vagas insuficientes para esta inscrição.' })
  }

  // Total calculado no backend — nunca aceita valor do frontend
  const total = (adults * event.priceAdult) + (children * event.priceChild)

  const frontendUrl = process.env.FRONTEND_URL

  const preference = new Preference(mp)
  const pref = await preference.create({
    body: {
      items: [{
        title: event.name,
        quantity: 1,
        unit_price: total,
        currency_id: 'BRL',
        description: `${adults} adulto(s) + ${children} criança(s)`,
      }],
      payer: { email, name: responsibleName },
      back_urls: {
        success: `${frontendUrl}/inscricao/sucesso`,
        failure: `${frontendUrl}/inscricao/erro`,
        pending: `${frontendUrl}/inscricao/pendente`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.BACKEND_URL ?? ''}/api/payments/webhook`,
      // Metadados para recuperar no webhook
      metadata: buildCheckoutMetadata({ eventId, adults, children, responsibleName, responsiblePhone, email, total }),
    },
  })

  res.json({ initPoint: pref.init_point, preferenceId: pref.id })
})

// POST /api/payments/webhook — Mercado Pago notifica aqui
router.post('/webhook', async (req, res) => {
  // Verificação de assinatura X-Signature do MP
  const xSignature = req.headers['x-signature']
  const xRequestId = req.headers['x-request-id']
  const dataId = req.query['data.id'] ?? req.query.id

  if (process.env.MP_WEBHOOK_SECRET && xSignature) {
    const parts = xSignature.split(',')
    const ts = parts.find(p => p.startsWith('ts='))?.split('=')[1]
    const v1 = parts.find(p => p.startsWith('v1='))?.split('=')[1]

    if (ts && v1) {
      const { createHmac } = await import('crypto')
      const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
      const expected = createHmac('sha256', process.env.MP_WEBHOOK_SECRET)
        .update(manifest)
        .digest('hex')

      if (expected !== v1) {
        return res.status(401).json({ error: 'Assinatura inválida.' })
      }
    }
  }

  const body = JSON.parse(req.body.toString())

  // Só processa notificações de pagamento aprovado
  if (body.type !== 'payment') return res.sendStatus(200)

  const paymentId = String(body.data?.id)
  if (!paymentId) return res.sendStatus(200)

  // Idempotência: ignora pagamentos já processados
  const existing = await prisma.registration.findUnique({ where: { mpPaymentId: paymentId } })
  if (existing) return res.sendStatus(200)

  // Consulta status real na API do MP (nunca confia só no webhook)
  const paymentApi = new Payment(mp)
  const payment = await paymentApi.get({ id: paymentId })

  if (payment.status !== 'approved') return res.sendStatus(200)

  const meta = normalizePaymentMetadata(payment.metadata)
  if (!meta) return res.sendStatus(200)

  await prisma.registration.create({
    data: {
      eventId:         meta.eventId,
      responsibleName: meta.responsibleName,
      responsiblePhone:meta.responsiblePhone,
      email:           meta.email,
      adults:          meta.adults,
      children:        meta.children,
      totalPaid:       meta.total,
      mpPaymentId:     paymentId,
    },
  })

  res.sendStatus(200)
})

export default router
