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
    if (!selected && events.length > 0) {
      setSelected(events[0])
    }
  }, [events, selected])

  function eventsForDate(date) {
    return events.filter((event) => isSameDay(new Date(event.date), date))
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-offblack pt-32 pb-24">
      <div className="events-mud-base absolute inset-0" />
      <div className="events-mud-vignette absolute inset-0" />
      <div className="events-mud-blob events-mud-blob-a absolute" />
      <div className="events-mud-blob events-mud-blob-b absolute" />
      <div className="events-mud-blob events-mud-blob-c absolute" />
      <div className="events-mud-blob events-mud-blob-d absolute" />
      <div className="events-dust absolute inset-0" />
      <div className="diag-texture absolute inset-0 opacity-[0.18]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,6,4,0.06)_0%,rgba(8,8,8,0.24)_32%,rgba(8,8,8,0.62)_100%)]" />

      <div className="absolute top-28 left-0 right-0 h-px bg-green-500/35" />
      <div className="absolute top-52 left-[-8%] h-px w-64 rotate-[-14deg] bg-gold/20" />
      <div className="absolute bottom-24 right-[-6%] h-px w-72 rotate-[-14deg] bg-white/10" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl flex-col justify-center px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl"
        >
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.45em] text-gold/60">
            — calendario —
          </p>
          <h1
            className="font-display leading-none tracking-[0.08em] text-gold"
            style={{ fontSize: 'clamp(56px, 10vw, 112px)' }}
          >
            Eventos
          </h1>
          <p className="mt-6 max-w-2xl font-body text-[17px] leading-relaxed text-white/72">
            Acompanhe a agenda completa do Offroad Sem Juizo e dos nossos parceiros em um calendario mensal unico.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12"
        >
          <div className="border border-gold/45 bg-[#0f0d0a]/74 p-6 backdrop-blur-md md:p-8">
            <div className="flex flex-col gap-5 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-gold/55">agenda completa</p>
                <h2 className="mt-4 font-display text-[34px] tracking-[0.08em] text-white md:text-[40px]">
                  {visibleMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h2>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}
                  className="border border-white/15 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.28em] text-white/66 transition-colors hover:border-gold/60 hover:text-gold"
                >
                  ← Mes anterior
                </button>
                <button
                  onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}
                  className="border border-white/15 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.28em] text-white/66 transition-colors hover:border-gold/60 hover:text-gold"
                >
                  Proximo mes →
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-7 gap-2">
              {weekDays.map((label) => (
                <div key={label} className="px-2 py-2 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-gold/55">
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
                    className={`min-h-[120px] border p-2 text-left transition-colors duration-200 ${
                      cell.inCurrentMonth
                        ? 'border-white/10 bg-offblack/30'
                        : 'border-white/5 bg-offblack/10 text-white/24'
                    } ${
                      hasSelectedDay ? 'border-gold/70 bg-offblack/50' : 'hover:border-gold/35'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-mono text-[11px] uppercase tracking-[0.24em] ${
                        cell.inCurrentMonth ? 'text-white/68' : 'text-white/24'
                      }`}>
                        {cell.dayNumber}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-gold/60">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 space-y-2">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={`${event.kind}-${event.id}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelected(event)
                          }}
                          className={`cursor-pointer border px-2 py-1.5 ${
                            isOwnEvent(event)
                              ? 'border-gold/28 bg-gold/10'
                              : 'border-white/10 bg-white/[0.03]'
                          }`}
                        >
                          <p className="truncate font-mono text-[9px] uppercase tracking-[0.16em] text-white/76">
                            {formatEventDateShort(event.date)}
                          </p>
                          <p className="truncate font-body text-[12px] text-white/78">{event.name}</p>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/32">
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

        {!loading && !error && selected && (
          <div className="relative z-10 mt-6">
            <EventDetailPanel event={selected} onBook={setBookingEvent} />
          </div>
        )}
      </div>

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
