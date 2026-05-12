import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { useCalendarEvents } from '../hooks/useCalendarEvents'
import { formatEventDate, isOwnEvent } from '../lib/calendarEvents'
import { resolveApiAssetUrl } from '../lib/api'

function isPastEvent(event) {
  return new Date(event.date).getTime() < Date.now()
}

export default function TransparencyPage() {
  const { events, loading, error } = useCalendarEvents()
  const [openId, setOpenId] = useState(null)

  const accountabilityEvents = useMemo(() => {
    return events
      .filter((event) => isOwnEvent(event))
      .filter(isPastEvent)
      .filter((event) => event.accountabilityImageUrl)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [events])

  return (
    <section className="relative min-h-screen overflow-hidden bg-offblack pt-24 pb-16 md:pt-28 md:pb-20">
      <div className="events-mud-base absolute inset-0" />
      <div className="events-mud-vignette absolute inset-0" />
      <div className="events-mud-blob events-mud-blob-a absolute" />
      <div className="events-mud-blob events-mud-blob-c absolute" />
      <div className="events-dust absolute inset-0" />
      <div className="diag-texture absolute inset-0 opacity-[0.16]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,6,4,0.08)_0%,rgba(8,8,8,0.34)_38%,rgba(8,8,8,0.74)_100%)]" />

      <div className="absolute top-24 left-0 right-0 h-px bg-gold/30" />
      <div className="absolute top-44 right-[-8%] h-px w-72 rotate-[14deg] bg-white/10" />
      <div className="absolute bottom-28 left-[-8%] h-px w-80 rotate-[-14deg] bg-gold/18" />

      <div className="relative z-10 mx-auto max-w-6xl px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.4em] text-gold/60">
            — transparencia —
          </p>
          <h1
            className="font-display leading-none tracking-[0.08em] text-gold"
            style={{ fontSize: 'clamp(38px, 6vw, 72px)' }}
          >
            Prestação de Contas
          </h1>
          <p className="mt-4 max-w-2xl font-body text-[15px] leading-relaxed text-white/68">
            Consulte os demonstrativos publicados dos eventos próprios já realizados pelo Offroad Sem Juizo.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 md:mt-10"
        >
          <div className="border border-gold/45 bg-[#0f0d0a]/74 p-4 backdrop-blur-md md:p-5">
            <div className="border-b border-white/10 pb-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-gold/55">
                eventos publicados
              </p>
              <h2 className="mt-3 font-display text-[24px] tracking-[0.08em] text-white md:text-[30px]">
                Demonstrativos por evento
              </h2>
            </div>

            {loading && (
              <p className="mt-8 font-mono text-sm uppercase tracking-[0.28em] text-white/34">
                carregando prestacoes...
              </p>
            )}

            {!loading && error && (
              <p className="mt-8 font-mono text-sm uppercase tracking-[0.28em] text-red-300/80">
                {error}
              </p>
            )}

            {!loading && !error && accountabilityEvents.length === 0 && (
              <div className="mt-6 border border-white/10 bg-offblack/28 p-5">
                <p className="font-body text-sm leading-relaxed text-white/58">
                  Nenhuma prestação de contas foi publicada até o momento.
                </p>
              </div>
            )}

            {!loading && !error && accountabilityEvents.length > 0 && (
              <div className="mt-5 space-y-3">
                {accountabilityEvents.map((event) => {
                  const isOpen = openId === event.id
                  const imageUrl = resolveApiAssetUrl(event.accountabilityImageUrl)

                  return (
                    <div key={event.id} className="border border-white/10 bg-offblack/34">
                      <button
                        type="button"
                        onClick={() => setOpenId(isOpen ? null : event.id)}
                        className="flex w-full flex-col gap-3 px-4 py-4 text-left transition-colors hover:bg-white/[0.03] md:flex-row md:items-center md:justify-between md:px-5"
                        aria-expanded={isOpen}
                      >
                        <span>
                          <span className="block font-display text-[22px] tracking-[0.08em] text-gold md:text-[26px]">
                            {event.name}
                          </span>
                          <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
                            {formatEventDate(event.date)} · {event.location}
                          </span>
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/54">
                          {isOpen ? 'fechar' : 'ver prestação'}
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-white/10 p-3 md:p-5">
                              <a
                                href={imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block border border-gold/24 bg-[#050505]/70 p-2 transition-colors hover:border-gold/46 md:p-3"
                              >
                                <img
                                  src={imageUrl}
                                  alt={`Prestação de contas do evento ${event.name}`}
                                  className="mx-auto max-h-[78vh] w-full object-contain"
                                />
                              </a>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
