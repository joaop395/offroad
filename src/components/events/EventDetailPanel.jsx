import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

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

function isBeneficenteEvent(event) {
  return isOwnEvent(event) && event?.isBeneficente === true
}

function parseDescription(value) {
  return value
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((block) => block.split('\n').map((line) => line.trim()).filter(Boolean))
    .filter((lines) => lines.length > 0)
}

function buildDescriptionSummary(blocks, maxLength = 220) {
  const text = (blocks[0] ?? [])
    .map((line) => (line.startsWith('* ') ? line.slice(2) : line))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!text) return null
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}...`
}

function DescriptionBlock({ lines }) {
  const bulletLines = lines.filter((line) => line.startsWith('* '))
  const textLines = lines.filter((line) => !line.startsWith('* '))

  if (bulletLines.length === lines.length) {
    return (
      <ul className="space-y-2">
        {bulletLines.map((line, index) => (
          <li key={`${line}-${index}`} className="flex gap-3 text-[15px] leading-7 text-white/76">
            <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold/80" />
            <span className="break-words">{line.slice(2)}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="space-y-3">
      {textLines.map((line, index) => {
        const looksLikeHeading = /[:：]$/.test(line) && line.length <= 48

        return (
          <p
            key={`${line}-${index}`}
            className={looksLikeHeading
              ? 'font-mono text-[11px] uppercase tracking-[0.24em] text-gold/78'
              : 'text-[15px] leading-7 text-white/76'}
          >
            {line}
          </p>
        )
      })}

      {bulletLines.length > 0 && (
        <ul className="space-y-2 pt-1">
          {bulletLines.map((line, index) => (
            <li key={`${line}-${index}`} className="flex gap-3 text-[15px] leading-7 text-white/76">
              <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold/80" />
              <span className="break-words">{line.slice(2)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function EventDetailPanel({ event, onBook, compact = false, teaser = false }) {
  const own = isOwnEvent(event)
  const beneficente = isBeneficenteEvent(event)
  const classification = getClassificationMeta(event)
  const bannerSrc = resolveApiAssetUrl(event?.bannerUrl)
  const logoSrc = resolveApiAssetUrl(event?.logoUrl)
  const partnerTeaser = teaser && !own
  const shellBackground = teaser ? 'bg-[#040403]/97' : 'bg-[#0c0b09]/82'
  const asideBackground = teaser ? 'bg-[#12100c]/82' : 'bg-white/[0.03]'
  const hasAvailabilityInfo = (
    own &&
    Number.isFinite(event?.maxSlots) &&
    event.maxSlots > 0 &&
    Number.isFinite(event?.availableSlots)
  )
  const descriptionBlocks = useMemo(
    () => (event?.description ? parseDescription(event.description) : []),
    [event?.description],
  )
  const descriptionSummary = useMemo(
    () => buildDescriptionSummary(descriptionBlocks),
    [descriptionBlocks],
  )
  const [imageFailed, setImageFailed] = useState(false)
  const [bannerExpanded, setBannerExpanded] = useState(false)

  useEffect(() => {
    setImageFailed(false)
    setBannerExpanded(false)
  }, [bannerSrc, event?.id])

  useEffect(() => {
    if (!bannerExpanded || typeof window === 'undefined') return undefined

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setBannerExpanded(false)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [bannerExpanded])

  if (!event) return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={`border border-gold/30 ${shellBackground} backdrop-blur-md`}
      >
        <div className={`grid ${compact ? 'gap-5 p-5 md:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] md:p-6' : 'gap-6 p-6 md:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)] md:p-8'}`}>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`font-mono text-[10px] uppercase tracking-[0.3em] px-3 py-1 ${
                beneficente ? 'bg-green-600 text-white' : own ? 'bg-gold text-offblack' : 'bg-white/10 text-white/78'
              }`}>
                {beneficente ? 'Beneficente' : own ? 'Offroad Sem Juizo' : 'Evento parceiro'}
              </span>

              {!beneficente && classification && (
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.22em] px-3 py-1 text-white"
                  style={{ backgroundColor: classification.color }}
                >
                  {classification.label}
                </span>
              )}
            </div>

            <h3 className={`mt-5 font-display leading-none tracking-[0.08em] text-gold ${compact ? 'text-[26px] md:text-[30px]' : 'text-[34px]'}`}>
              {event.name}
            </h3>

            <div className={`${compact ? 'mt-4 space-y-1' : 'mt-5 space-y-1'}`}>
              <p className="font-mono text-[11px] uppercase tracking-[0.36em] text-white/34">quando</p>
              <p className={`font-body leading-relaxed text-white/78 ${compact ? 'text-[15px]' : 'text-[16px]'}`}>
                {formatEventDateTime(event.date)}
              </p>
            </div>

            {partnerTeaser && descriptionSummary && (
              <div className={`${compact ? 'mt-5 border-l border-gold/30 pl-3.5' : 'mt-6 border-l border-gold/30 pl-4'}`}>
                <p className={`font-body leading-relaxed text-white/66 ${compact ? 'text-[14px]' : 'text-[15px]'}`}>
                  {descriptionSummary}
                </p>
              </div>
            )}

            {!partnerTeaser && descriptionBlocks.length > 0 && (
              <div className={`${compact ? 'mt-5 border-l border-gold/40 pl-3.5' : 'mt-6 border-l border-gold/40 pl-4'}`}>
                <div className="space-y-5 font-body">
                  {descriptionBlocks.map((lines, index) => (
                    <DescriptionBlock key={`${event.id}-${index}`} lines={lines} />
                  ))}
                </div>
              </div>
            )}

            {own && !beneficente && (
              <div className={`${compact ? 'mt-5 flex flex-wrap items-center gap-3' : 'mt-7 flex flex-wrap items-center gap-4'}`}>
                {!hasAvailabilityInfo || event.availableSlots > 0 ? (
                  <button
                    onClick={() => onBook?.(event)}
                    className={`bg-gold font-display tracking-[0.16em] text-offblack transition-colors duration-200 hover:bg-gold-dark ${compact ? 'px-5 py-2.5 text-[16px]' : 'px-6 py-3 text-[18px]'}`}
                  >
                    Inscrever-se
                  </button>
                ) : (
                  <div className={`border border-white/10 font-mono text-[11px] uppercase tracking-[0.26em] text-white/35 ${compact ? 'px-5 py-2.5' : 'px-6 py-3'}`}>
                    Vagas esgotadas
                  </div>
                )}

                {hasAvailabilityInfo && event.availableSlots > 0 && (
                  <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-white/28">
                    {event.availableSlots} vaga{event.availableSlots !== 1 ? 's' : ''} restante{event.availableSlots !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}

            {own && beneficente && (
              <div className={`${compact ? 'mt-5 flex flex-wrap items-center gap-3' : 'mt-7 flex flex-wrap items-center gap-4'}`}>
                <a
                  href={`/evento-beneficente/${event.id}`}
                  className={`bg-green-600 font-display tracking-[0.16em] text-white transition-colors duration-200 hover:bg-green-700 ${compact ? 'px-5 py-2.5 text-[16px]' : 'px-6 py-3 text-[18px]'}`}
                >
                  Cadastrar Veiculo
                </a>
              </div>
            )}
          </div>

          <div className={`border border-white/10 ${asideBackground} ${compact ? 'p-4' : 'p-5'}`}>
            {/* Logo para eventos beneficentes */}
            {beneficente && logoSrc && !imageFailed && (
              <div className="mb-5 border border-white/8 bg-offblack/40 overflow-hidden">
                <img
                  src={logoSrc}
                  alt={event.name}
                  className={`w-full object-contain ${compact ? 'max-h-40' : 'max-h-48'}`}
                  onError={() => setImageFailed(true)}
                />
              </div>
            )}

            {/* Banner para eventos normais */}
            {!beneficente && bannerSrc && !imageFailed && (
              <button
                type="button"
                onClick={() => setBannerExpanded(true)}
                className="group mb-5 block w-full overflow-hidden border border-white/8 bg-offblack/40 text-left"
              >
                <img
                  src={bannerSrc}
                  alt={event.name}
                  className={`w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] ${compact ? 'aspect-[16/9]' : 'aspect-[16/10]'}`}
                  onError={() => setImageFailed(true)}
                />
                <div className={`flex items-center justify-between border-t border-white/8 bg-offblack/68 ${compact ? 'px-3 py-2.5' : 'px-4 py-3'}`}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/52">
                    Clique para ampliar
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-gold/72">
                    Ver banner
                  </p>
                </div>
              </button>
            )}

            {(imageFailed || (!bannerSrc && !logoSrc && !own && !partnerTeaser)) && (
              <div className="mb-5 border border-dashed border-white/10 bg-[radial-gradient(circle_at_top,_rgba(212,184,39,0.18),_transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] px-5 py-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/35">
                  Material visual
                </p>
                <p className="mt-3 font-body text-[15px] leading-relaxed text-white/56">
                  {imageFailed
                    ? 'Nao foi possivel carregar o banner deste evento parceiro.'
                    : 'Esse evento parceiro ainda nao possui banner cadastrado.'}
                </p>
              </div>
            )}

            <InfoRow label="Local" value={event.location} />

            {own && !beneficente && (
              <>
                <InfoRow label="Adulto" value={formatCurrency(event.priceAdult)} />
                <InfoRow label="Crianca" value={formatCurrency(event.priceChild)} />
                {hasAvailabilityInfo && (
                  <InfoRow
                    label="Capacidade"
                    value={`${event.availableSlots}/${event.maxSlots} vagas disponiveis`}
                  />
                )}
              </>
            )}

            {own && beneficente && (
              <InfoRow label="Tipo" value="Gratuito · Cadastro de veiculos" />
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {bannerExpanded && bannerSrc && !imageFailed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-offblack/84 px-4 py-6 backdrop-blur-lg"
            onClick={() => setBannerExpanded(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className={`relative flex max-h-full w-full flex-col gap-4 ${compact ? 'max-w-5xl' : 'max-w-6xl'}`}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/42">
                    Banner ampliado
                  </p>
                  <p className="mt-2 font-display text-[24px] tracking-[0.08em] text-gold">
                    {event.name}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setBannerExpanded(false)}
                  className="border border-white/12 bg-offblack/74 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-white/72 transition-colors hover:border-gold/60 hover:text-gold"
                >
                  Fechar
                </button>
              </div>

              <div className="overflow-hidden border border-white/10 bg-offblack/50 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                <img
                  src={bannerSrc}
                  alt={event.name}
                  className="max-h-[78vh] w-full object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
