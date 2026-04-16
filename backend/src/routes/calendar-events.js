import { Router } from 'express'

import { getCalendarEvents } from '../lib/calendarEvents.js'

const router = Router()

router.get('/', async (_req, res) => {
  const events = await getCalendarEvents()
  res.json(events)
})

export default router
