import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

import { useCalendarEvents } from '../hooks/useCalendarEvents'
import RegistrationModal from './RegistrationModal'
import {
  isUpcomingEvent,
} from '../lib/calendarEvents'
import EventDetailPanel from './events/EventDetailPanel'

export default function Events() {
  const { events, loading, error } = useCalendarEvents()
  const [bookingEvent, setBookingEvent] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const highlights = useMemo(() => (
    events
      .filter((event) => isUpcomingEvent(event))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  ), [events])

  useEffect(() => {
    if (highlights.length === 0) {
      setCurrentIndex(0)
      return
    }

    setCurrentIndex((prev) => Math.min(prev, highlights.length - 1))
  }, [highlights])

  const featuredEvent = highlights[currentIndex] ?? null
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < highlights.length - 1

  function handlePrev() {
    if (!hasPrev) return
    setCurrentIndex((prev) => prev - 1)
  }

  function handleNext() {
    if (!hasNext) return
    setCurrentIndex((prev) => prev + 1)
  }

  return (
    <section id="eventos" className="relative py-28 overflow-hidden">
      {/* Imagem de fundo */}
      <img
        src="https://images.unsplash.com/photo-1773522918526-19adcbba988d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920"
        alt="Jeep off-road adventure"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-offblack/76" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(74,92,40,0.42) 0%, transparent 70%), linear-gradient(180deg, rgba(6,6,6,0.2) 0%, rgba(6,6,6,0.38) 34%, rgba(6,6,6,0.62) 100%)',
        }}
      />

      {/* Listras diagonais */}
      <div className="absolute top-8 -left-10 w-72 h-px bg-white/10 rotate-[-11deg]" />
      <div className="absolute bottom-12 -right-6 w-56 h-px bg-white/10 rotate-[-11deg]" />
      <div className="absolute top-1/2 -left-16 w-40 h-px bg-gold/10 rotate-[-11deg]" />

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative z-10 text-center mb-16 px-6"
      >
        <p className="font-mono text-gold/50 text-[10px] tracking-[0.4em] uppercase mb-3">— agenda —</p>
        <h2 className="font-display text-gold tracking-[0.12em]" style={{ fontSize: 'clamp(42px, 6.5vw, 72px)' }}>
          Próximos Rolês
        </h2>
      </motion.div>

      {/* Loading */}
      {loading && (
        <p className="relative z-10 text-center font-mono text-white/30 text-sm tracking-widest">
          carregando...
        </p>
      )}

      {!loading && error && (
        <p className="relative z-10 text-center font-mono text-sm tracking-widest text-red-300/80">
          {error}
        </p>
      )}

      {!loading && !error && highlights.length === 0 && (
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <p className="font-body text-[16px] leading-relaxed text-white/58">
            Ainda nao temos novos eventos publicados. Acompanhe a pagina de eventos para ver toda a agenda.
          </p>
          <Link
            to="/eventos"
            className="mt-6 inline-flex border border-gold bg-gold px-6 py-3 font-display text-[18px] tracking-[0.16em] text-offblack transition-colors duration-200 hover:bg-transparent hover:text-gold"
          >
            Abrir calendario
          </Link>
        </div>
      )}

      {!loading && !error && highlights.length > 0 && (
        <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
          <div className="relative">
            {hasPrev && (
              <motion.div
                aria-hidden="true"
                animate={{ x: [0, -4, 0] }}
                transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 3.2, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-none absolute inset-y-10 left-[-14px] hidden w-12 rounded-l-[32px] bg-[linear-gradient(90deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015)_55%,transparent)] opacity-55 blur-[2px] md:block"
              />
            )}

            {hasNext && (
              <motion.div
                aria-hidden="true"
                animate={{ x: [0, 6, 0] }}
                transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 3.2, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-none absolute inset-y-10 right-[-14px] hidden w-12 rounded-r-[32px] bg-[linear-gradient(90deg,transparent,rgba(212,184,39,0.06)_48%,rgba(255,255,255,0.03))] opacity-55 blur-[2px] md:block"
              />
            )}

            <motion.div
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="relative px-0 md:px-16"
            >
              {(hasPrev || hasNext) && (
                <motion.div
                  animate={{ x: hasNext ? [0, 8, 0] : [0, -8, 0] }}
                  transition={{ duration: 0.95, repeat: Infinity, repeatDelay: 3.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${featuredEvent.kind}-${featuredEvent.id}`}
                      initial={{ opacity: 0, x: 26 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -26 }}
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <EventDetailPanel event={featuredEvent} onBook={setBookingEvent} teaser />
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              )}

              {!hasPrev && !hasNext && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${featuredEvent.kind}-${featuredEvent.id}`}
                    initial={{ opacity: 0, x: 26 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -26 }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <EventDetailPanel event={featuredEvent} onBook={setBookingEvent} teaser />
                  </motion.div>
                </AnimatePresence>
              )}

              <div className="mt-5 flex flex-col gap-4 md:hidden">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/34">
                    {String(currentIndex + 1).padStart(2, '0')} / {String(highlights.length).padStart(2, '0')}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrev}
                      disabled={!hasPrev}
                      className="flex items-center gap-2 border border-white/15 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-white/68 transition-colors hover:border-gold/50 hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <span className="text-sm">←</span>
                      Anterior
                    </button>

                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!hasNext}
                      className="flex items-center gap-2 border border-gold/40 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-gold transition-colors hover:border-gold hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      Proximo
                      <span className="text-sm">→</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {(hasPrev || hasNext) && (
              <>
                <div className="absolute left-0 top-1/2 hidden -translate-y-1/2 md:flex">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={!hasPrev}
                    className="group flex h-14 w-14 items-center justify-center border border-white/12 bg-offblack/72 text-white/72 backdrop-blur-sm transition-all duration-200 hover:border-gold/50 hover:text-gold disabled:cursor-not-allowed disabled:opacity-25"
                    aria-label="Abrir evento anterior"
                  >
                    <span className="font-display text-[24px] transition-transform duration-200 group-hover:-translate-x-1">
                      ←
                    </span>
                  </button>
                </div>

                <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 md:flex md:flex-col md:items-end md:gap-3">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!hasNext}
                  className="group flex h-14 w-14 items-center justify-center border border-gold/45 bg-offblack/78 text-gold backdrop-blur-sm transition-all duration-200 hover:border-gold hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-25"
                  aria-label="Abrir proximo evento"
                >
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={hasNext ? { duration: 0.9, repeat: Infinity, repeatDelay: 2.6, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
                    className="font-display text-[24px] transition-transform duration-200 group-hover:translate-x-1"
                  >
                    →
                  </motion.span>
                </button>

                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/30">
                  {String(currentIndex + 1).padStart(2, '0')} / {String(highlights.length).padStart(2, '0')}
                </p>
                </div>
              </>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <Link
              to="/eventos"
              className="border border-white/15 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.28em] text-white/66 transition-colors duration-200 hover:border-gold/60 hover:text-gold"
            >
              Ver calendario completo
            </Link>
          </div>
        </div>
      )}

      {/* Modal de inscrição */}
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
