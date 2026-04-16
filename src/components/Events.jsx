import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

import { useCalendarEvents } from '../hooks/useCalendarEvents'
import RegistrationModal from './RegistrationModal'
import {
  isOwnEvent,
  isUpcomingEvent,
} from '../lib/calendarEvents'
import EventDetailPanel from './events/EventDetailPanel'

export default function Events() {
  const { events, loading, error } = useCalendarEvents()
  const [bookingEvent, setBookingEvent] = useState(null)

  const highlights = events
    .filter(event => isOwnEvent(event) && isUpcomingEvent(event))
    .slice(0, 3)

  const featuredEvent = highlights[0] ?? null

  return (
    <section id="eventos" className="relative py-28 overflow-hidden">
      {/* Vídeo de fundo */}
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-offblack/70" />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 50%, rgba(74,92,40,0.55) 0%, transparent 70%)'
      }} />

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
            Ainda nao temos novos eventos proprios publicados. Acompanhe a pagina de eventos para ver toda a agenda.
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
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <EventDetailPanel event={featuredEvent} onBook={setBookingEvent} />
          </motion.div>

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
