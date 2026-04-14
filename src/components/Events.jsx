import { motion } from 'framer-motion'

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

const EVENTS = [
  {
    badge:    'Média',
    badgeCls: 'bg-[#D4682A]',
    name:     'Trilha da Cachoeira',
    date:     '20 Abr 2026',
    location: 'Serra do Mar',
  },
  {
    badge:    'Alta',
    badgeCls: 'bg-[#C0392B]',
    name:     'Rali Noturno',
    date:     '04 Mai 2026',
    location: 'Interior SP',
  },
  {
    badge:    'Baixa',
    badgeCls: 'bg-[#27AE60]',
    name:     'Acampamento Off-Road',
    date:     '15 Mai 2026',
    location: 'Minas Gerais',
  },
]

export default function Events() {
  return (
    <section id="eventos" className="relative py-28 overflow-hidden">
      {/* Vídeo de fundo */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* Overlay escuro com glow verde-militar */}
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
        <h2
          className="font-display text-gold tracking-[0.12em]"
          style={{ fontSize: 'clamp(42px, 6.5vw, 72px)' }}
        >
          Próximos Rolês
        </h2>
      </motion.div>

      {/* Cards */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 grid md:grid-cols-3 gap-5">
        {EVENTS.map(({ badge, badgeCls, name, date, location }, i) => (
          <motion.div
            key={i}
            className="relative bg-offblack/60 backdrop-blur-sm border border-gold/70 p-8 group"
            initial={{ opacity: 0, y: 44 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: i * 0.14 }}
            whileHover={{
              y: -8,
              boxShadow: '0 20px 50px rgba(201,162,39,0.18)',
              borderColor: 'rgba(201,162,39,1)',
              transition: { duration: 0.25 },
            }}
          >
            {/* Difficulty badge */}
            <span className={`absolute top-0 right-0 ${badgeCls} text-white font-mono text-[10px] tracking-[0.2em] uppercase px-4 py-1.5`}>
              {badge}
            </span>

            {/* Gold corner accent */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold" />

            <h3 className="font-display text-gold text-[26px] tracking-wide mt-6 mb-7 leading-tight">
              {name}
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3 font-mono text-[13px] text-white/85 tracking-wide">
                <span className="text-gold"><CalIcon /></span>
                {date}
              </div>
              <div className="flex items-center gap-3 font-mono text-[13px] text-white/85 tracking-wide">
                <span className="text-gold"><PinIcon /></span>
                {location}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
