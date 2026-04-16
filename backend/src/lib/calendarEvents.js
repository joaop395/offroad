import prisma from './prisma.js'

export async function slotsUsed(eventId) {
  const agg = await prisma.registration.aggregate({
    where: { eventId },
    _sum: { adults: true, children: true },
  })

  return (agg._sum.adults ?? 0) + (agg._sum.children ?? 0)
}

export async function withSlots(event) {
  return {
    ...event,
    slotsUsed: await slotsUsed(event.id),
  }
}

export async function buildOwnCalendarItem(event) {
  const used = await slotsUsed(event.id)

  return {
    kind: 'own',
    id: event.id,
    name: event.name,
    date: event.date,
    location: event.location,
    description: null,
    bannerUrl: null,
    isBookable: true,
    classification: event.classification,
    priceAdult: event.priceAdult,
    priceChild: event.priceChild,
    maxSlots: event.maxSlots,
    slotsUsed: used,
    availableSlots: event.maxSlots - used,
  }
}

export function buildPartnerCalendarItem(event) {
  return {
    kind: 'partner',
    id: event.id,
    name: event.name,
    date: event.date,
    location: event.location,
    description: event.description,
    bannerUrl: event.bannerUrl,
    isBookable: false,
    classification: null,
    priceAdult: null,
    priceChild: null,
    maxSlots: null,
    slotsUsed: null,
    availableSlots: null,
  }
}

export async function getCalendarEvents() {
  const [events, partnerEvents] = await Promise.all([
    prisma.event.findMany({ orderBy: { date: 'asc' } }),
    prisma.partnerEvent.findMany({ orderBy: { date: 'asc' } }),
  ])

  const ownItems = await Promise.all(events.map(buildOwnCalendarItem))
  const partnerItems = partnerEvents.map(buildPartnerCalendarItem)

  return [...ownItems, ...partnerItems].sort((a, b) => {
    const delta = new Date(a.date).getTime() - new Date(b.date).getTime()
    if (delta !== 0) return delta

    if (a.kind !== b.kind) return a.kind === 'own' ? -1 : 1
    return a.id - b.id
  })
}
