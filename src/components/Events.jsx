import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import RegistrationModal from './RegistrationModal'
import { API_BASE } from '../lib/api'

const DIFF = {
  LEVE_4X4:    { label: 'Leve 4x4',           color: '#27AE60' },
  LEVE_AT_4X4: { label: 'Leve · Pneu AT',     color: '#2ECC71' },
  MODERADA_AT: { label: 'Moderada · Pneu AT',  color: '#D4682A' },
  MODERADA_MUD:{ label: 'Moderada · Pneu Mud', color: '#E67E22' },
  AVANCADA:    { label: 'Avançada · Lift',     color: '#C0392B' },
}

const CalIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8"  y1="2" x2="8"  y2="6" />
    <line x1="3"  y1="10" x2="21" y2="10" />
  </svg>
)

const PinIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function Events() {
  const [events, setEvents]   = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null) // evento aberto no modal

  useEffect(() => {
    fetch(`${API_BASE}/api/events`)
      .then(r => r.json())
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

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

      {/* Cards */}
      {!loading && (
        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 grid md:grid-cols-3 gap-5">
          {events.map((ev, i) => {
            const diff      = DIFF[ev.difficulty] ?? DIFF.LEVE_4X4
            const available = ev.maxSlots - ev.slotsUsed
            const soldOut   = available <= 0

            return (
              <motion.div
                key={ev.id}
                className="relative bg-offblack/60 backdrop-blur-sm border border-gold/70 p-8 group flex flex-col"
                initial={{ opacity: 0, y: 44 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, delay: i * 0.14 }}
                whileHover={!soldOut ? {
                  y: -8,
                  boxShadow: '0 20px 50px rgba(201,162,39,0.18)',
                  borderColor: 'rgba(201,162,39,1)',
                  transition: { duration: 0.25 },
                } : {}}
              >
                {/* Difficulty badge */}
                <span
                  className="absolute top-0 right-0 text-white font-mono text-[10px] tracking-[0.2em] uppercase px-4 py-1.5"
                  style={{ backgroundColor: diff.color }}
                >
                  {diff.label}
                </span>

                {/* Gold corner */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold" />

                <h3 className="font-display text-gold text-[26px] tracking-wide mt-6 mb-5 leading-tight">
                  {ev.name}
                </h3>

                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3 font-mono text-[13px] text-white/85 tracking-wide">
                    <span className="text-gold"><CalIcon /></span>
                    {formatDate(ev.date)}
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[13px] text-white/85 tracking-wide">
                    <span className="text-gold"><PinIcon /></span>
                    {ev.location}
                  </div>
                  <div className="font-mono text-[12px] text-white/50 pt-1">
                    Adulto: <span className="text-gold/80">R$ {ev.priceAdult.toFixed(2)}</span>
                    {ev.priceChild > 0 && (
                      <> · Criança: <span className="text-gold/80">R$ {ev.priceChild.toFixed(2)}</span></>
                    )}
                    {ev.priceChild === 0 && <> · Criança: <span className="text-gold/80">Grátis</span></>}
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-6">
                  {soldOut ? (
                    <div className="w-full text-center font-mono text-[11px] tracking-[0.2em] uppercase py-2.5 border border-white/10 text-white/30">
                      Vagas esgotadas
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelected(ev)}
                      className="w-full bg-gold text-offblack font-display tracking-[0.16em] uppercase text-sm py-2.5 hover:bg-gold-dark transition-colors"
                    >
                      Inscrever-se
                    </button>
                  )}
                  {!soldOut && (
                    <p className="font-mono text-[10px] text-white/25 text-center mt-2">
                      {available} vaga{available !== 1 ? 's' : ''} restante{available !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Modal de inscrição */}
      <AnimatePresence>
        {selected && (
          <RegistrationModal
            event={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
