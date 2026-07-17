export const CLASSIFICATION_META = {
  LEVE_4X4:    { label: 'Leve 4x4', color: '#27AE60' },
  LEVE_AT_4X4: { label: 'Leve · Pneu AT', color: '#2ECC71' },
  MODERADA_AT: { label: 'Moderada · Pneu AT', color: '#D4682A' },
  MODERADA_MUD:{ label: 'Moderada · Pneu Mud', color: '#E67E22' },
  AVANCADA:    { label: 'Avançada · Lift', color: '#C0392B' },
  REUNIAO:     { label: 'Reunião', color: '#4C6A92' },
}

export function formatEventDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function formatEventDateShort(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

export function formatEventDateTime(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatCurrency(value) {
  if (value == null) return null
  return value === 0 ? 'Grátis' : `R$ ${value.toFixed(2)}`
}

export function isOwnEvent(event) {
  return event?.kind === 'own'
}

export function isUpcomingEvent(event) {
  return new Date(event.date).getTime() >= Date.now()
}

export function getClassificationMeta(event) {
  return event?.classification ? CLASSIFICATION_META[event.classification] ?? null : null
}

export function getEventBadge(event) {
  if (isOwnEvent(event)) {
    if (event.isBeneficente) {
      return { label: 'Beneficente', tone: 'green' }
    }
    return { label: 'Offroad Sem Juízo', tone: 'gold' }
  }

  return { label: 'Parceiro', tone: 'stone' }
}

export function getMonthMatrix(monthDate) {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const firstWeekday = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevMonthDays = new Date(year, month, 0).getDate()

  const cells = []

  for (let index = 0; index < 42; index += 1) {
    const dayNumber = index - firstWeekday + 1

    if (dayNumber <= 0) {
      cells.push({
        key: `prev-${index}`,
        date: new Date(year, month - 1, prevMonthDays + dayNumber),
        dayNumber: prevMonthDays + dayNumber,
        inCurrentMonth: false,
      })
      continue
    }

    if (dayNumber > daysInMonth) {
      cells.push({
        key: `next-${index}`,
        date: new Date(year, month + 1, dayNumber - daysInMonth),
        dayNumber: dayNumber - daysInMonth,
        inCurrentMonth: false,
      })
      continue
    }

    cells.push({
      key: `current-${index}`,
      date: new Date(year, month, dayNumber),
      dayNumber,
      inCurrentMonth: true,
    })
  }

  return cells
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}
