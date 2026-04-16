import { motion } from 'framer-motion'

import { resolveApiAssetUrl } from '../../lib/api'
import {
  formatCurrency,
  formatEventDateTime,
  getClassificationMeta,
  isOwnEvent,
} from '../../lib/calendarEvents'

function InfoRow({ label, value }) {
  if (!value) return null

  return (
    <div className="flex flex-col gap-1 border-b border-white/8 py-3 last:border-b-0">
      <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/30">{label}</span>
      <span className="font-body text-[15px] leading-relaxed text-white/78">{value}</span>
    </div>
  )
}

export default function EventDetailPanel({ event, onBook }) {
  if (!event) return null

  const own = isOwnEvent(event)
  const classification = getClassificationMeta(event)
  const bannerSrc = resolveApiAssetUrl(event.bannerUrl)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="border border-gold/30 bg-[#0c0b09]/82 backdrop-blur-md"
    >
      <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)] md:p-8">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`font-mono text-[10px] uppercase tracking-[0.3em] px-3 py-1 ${
              own ? 'bg-gold text-offblack' : 'bg-white/10 text-white/78'
            }`}>
              {own ? 'Offroad Sem Juizo' : 'Evento parceiro'}
            </span>

            {classification && (
              <span
                className="font-mono text-[10px] uppercase tracking-[0.22em] px-3 py-1 text-white"
                style={{ backgroundColor: classification.color }}
              >
                {classification.label}
              </span>
            )}
          </div>

          <h3 className="mt-5 font-display text-[34px] leading-none tracking-[0.08em] text-gold">
            {event.name}
          </h3>

          <div className="mt-5 space-y-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.36em] text-white/34">quando</p>
            <p className="font-body text-[16px] leading-relaxed text-white/78">
              {formatEventDateTime(event.date)}
            </p>
          </div>

          {event.description && (
            <div className="mt-6 border-l border-gold/40 pl-4">
              <p className="font-body text-[16px] leading-relaxed text-white/72">{event.description}</p>
            </div>
          )}

          {own && (
            <div className="mt-7 flex flex-wrap items-center gap-4">
              {event.availableSlots > 0 ? (
                <button
                  onClick={() => onBook?.(event)}
                  className="bg-gold px-6 py-3 font-display text-[18px] tracking-[0.16em] text-offblack transition-colors duration-200 hover:bg-gold-dark"
                >
                  Inscrever-se
                </button>
              ) : (
                <div className="border border-white/10 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.26em] text-white/35">
                  Vagas esgotadas
                </div>
              )}

              {event.availableSlots > 0 && (
                <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-white/28">
                  {event.availableSlots} vaga{event.availableSlots !== 1 ? 's' : ''} restante{event.availableSlots !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="border border-white/10 bg-white/[0.03] p-5">
          {bannerSrc && (
            <img
              src={bannerSrc}
              alt={event.name}
              className="mb-5 h-48 w-full object-cover"
            />
          )}

          <InfoRow label="Local" value={event.location} />

          {own && (
            <>
              <InfoRow label="Adulto" value={formatCurrency(event.priceAdult)} />
              <InfoRow label="Crianca" value={formatCurrency(event.priceChild)} />
              <InfoRow
                label="Capacidade"
                value={`${event.availableSlots}/${event.maxSlots} vagas disponiveis`}
              />
            </>
          )}

          {!own && !bannerSrc && !event.location && (
            <p className="font-body text-[15px] leading-relaxed text-white/48">
              Esse evento parceiro ainda nao possui material visual adicional cadastrado.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
