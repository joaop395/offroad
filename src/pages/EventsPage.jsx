import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import EventDetailPanel from '../components/events/EventDetailPanel'
import RegistrationModal from '../components/RegistrationModal'
import { useCalendarEvents } from '../hooks/useCalendarEvents'
import {
  formatEventDateShort,
  getMonthMatrix,
  isOwnEvent,
  isSameDay,
} from '../lib/calendarEvents'

export default function EventsPage() {
  const { events, loading, error } = useCalendarEvents()
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const [selected, setSelected] = useState(null)
  const [bookingEvent, setBookingEvent] = useState(null)

  const monthCells = getMonthMatrix(visibleMonth)
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']

  useEffect(() => {
    if (!selected || typeof window === 'undefined') return undefined

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSelected(null)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selected])

  function eventsForDate(date) {
    return events.filter((event) => isSameDay(new Date(event.date), date))
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-offblack pt-24 pb-16 md:pt-28 md:pb-20">
      <div className="events-mud-base absolute inset-0" />
      <div className="events-mud-vignette absolute inset-0" />
      <div className="events-mud-blob events-mud-blob-a absolute" />
      <div className="events-mud-blob events-mud-blob-b absolute" />
      <div className="events-mud-blob events-mud-blob-c absolute" />
      <div className="events-mud-blob events-mud-blob-d absolute" />
      <div className="events-dust absolute inset-0" />
      <div className="diag-texture absolute inset-0 opacity-[0.18]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,6,4,0.06)_0%,rgba(8,8,8,0.24)_32%,rgba(8,8,8,0.62)_100%)]" />

      <div className="absolute top-24 left-0 right-0 h-px bg-green-500/35" />
      <div className="absolute top-44 left-[-8%] h-px w-64 rotate-[-14deg] bg-gold/20" />
      <div className="absolute bottom-24 right-[-6%] h-px w-72 rotate-[-14deg] bg-white/10" />

      <div className="relative z-10 mx-auto max-w-6xl px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.4em] text-gold/60">
            — calendario —
          </p>
          <h1
            className="font-display leading-none tracking-[0.08em] text-gold"
            style={{ fontSize: 'clamp(38px, 6vw, 72px)' }}
          >
            Eventos
          </h1>
          <p className="mt-4 max-w-xl font-body text-[15px] leading-relaxed text-white/68">
            Acompanhe a agenda completa do Offroad Sem Juizo e dos nossos parceiros em um calendario mensal unico.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 md:mt-10"
        >
          <div className="border border-gold/45 bg-[#0f0d0a]/74 p-4 backdrop-blur-md md:p-5">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-gold/55">agenda completa</p>
                <h2 className="mt-3 font-display text-[24px] tracking-[0.08em] text-white md:text-[30px]">
                  {visibleMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}
                  className="border border-white/15 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-white/66 transition-colors hover:border-gold/60 hover:text-gold"
                >
                  ← Mes anterior
                </button>
                <button
                  onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}
                  className="border border-white/15 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-white/66 transition-colors hover:border-gold/60 hover:text-gold"
                >
                  Proximo mes →
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1.5 md:gap-2">
              {weekDays.map((label) => (
                <div key={label} className="px-1 py-1.5 text-center font-mono text-[9px] uppercase tracking-[0.24em] text-gold/55 md:px-2 md:py-2 md:text-[10px]">
                  {label}
                </div>
              ))}

              {monthCells.map((cell) => {
                const dayEvents = eventsForDate(cell.date)
                const hasSelectedDay = selected && isSameDay(new Date(selected.date), cell.date)

                return (
                  <button
                    key={cell.key}
                    type="button"
                    onClick={() => {
                      if (dayEvents.length > 0) setSelected(dayEvents[0])
                    }}
                    className={`min-h-[88px] border p-1.5 text-left transition-colors duration-200 md:min-h-[104px] md:p-2 ${
                      cell.inCurrentMonth
                        ? 'border-white/10 bg-offblack/30'
                        : 'border-white/5 bg-offblack/10 text-white/24'
                    } ${
                      hasSelectedDay ? 'border-gold/70 bg-offblack/50' : 'hover:border-gold/35'
                    } ${dayEvents.length > 0 ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-mono text-[10px] uppercase tracking-[0.2em] md:text-[11px] md:tracking-[0.24em] ${
                        cell.inCurrentMonth ? 'text-white/68' : 'text-white/24'
                      }`}>
                        {cell.dayNumber}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-gold/60 md:text-[9px]">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 space-y-1.5 md:mt-2 md:space-y-2">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={`${event.kind}-${event.id}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelected(event)
                          }}
                          className={`cursor-pointer border px-1.5 py-1 md:px-2 md:py-1.5 ${
                            event.isBeneficente
                              ? 'border-green-500/28 bg-green-500/10'
                              : isOwnEvent(event)
                                ? 'border-gold/28 bg-gold/10'
                                : 'border-white/10 bg-white/[0.03]'
                          }`}
                        >
                          <p className="truncate font-mono text-[8px] uppercase tracking-[0.12em] text-white/76 md:text-[9px] md:tracking-[0.16em]">
                            {formatEventDateShort(event.date)}
                          </p>
                          <p className="truncate font-body text-[11px] text-white/78 md:text-[12px]">{event.name}</p>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/32 md:text-[10px] md:tracking-[0.22em]">
                          +{dayEvents.length - 3} itens
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </motion.div>

        {loading && (
          <p className="mt-8 font-mono text-sm uppercase tracking-[0.28em] text-white/34">
            carregando calendario...
          </p>
        )}

        {!loading && error && (
          <p className="mt-8 font-mono text-sm uppercase tracking-[0.28em] text-red-300/80">
            {error}
          </p>
        )}

      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-offblack/62 px-3 py-5 backdrop-blur-md md:px-4 md:py-8"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-h-[calc(100vh-2.5rem)] w-full max-w-5xl overflow-y-auto md:max-h-[calc(100vh-4rem)]"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="absolute right-3 top-3 z-10 border border-white/12 bg-offblack/78 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.22em] text-white/72 backdrop-blur-sm transition-colors hover:border-gold/60 hover:text-gold md:right-4 md:top-4 md:px-4 md:text-[10px] md:tracking-[0.26em]"
              >
                Fechar
              </button>

              <EventDetailPanel event={selected} onBook={setBookingEvent} compact />
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>

      <AnimatePresence>
        {bookingEvent && (
          <RegistrationModal
            event={bookingEvent}
            onClose={() => setBookingEvent(null)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
