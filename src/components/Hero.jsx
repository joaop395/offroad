import { motion } from 'framer-motion'

const InstaIcon = () => (
  <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16, delayChildren: 0.4 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 48 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
}

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden px-6"
    >
      {/* Background video */}
      <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full scale-105 object-cover blur-[3px]">
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-offblack/78" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 42%, rgba(201,162,39,0.08) 0%, transparent 26%), linear-gradient(180deg, rgba(10,10,10,0.26) 0%, rgba(10,10,10,0.34) 28%, rgba(10,10,10,0.72) 100%)',
        }}
      />

      {/* Static top accent line */}
      <div className="absolute top-[72px] left-0 right-0 h-px bg-green-500/50 z-10" />

      {/* Animated scan line */}
      <div
        className="scan-line absolute left-0 right-0 h-px bg-green-400/25 pointer-events-none"
        style={{ top: 0 }}
      />

      {/* Content */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center"
      >
        {/* Logo — círculo branco para contrastar com o PNG */}
        <motion.div
          variants={fadeUp}
          className="w-44 h-44 mb-10"
        >
          <img src="/logo.png" alt="Logo Club OffRoad Sem Juízo" className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]" />
        </motion.div>

        {/* Main title */}
        <motion.h1
          variants={fadeUp}
          className="font-display text-gold leading-none mb-3 tracking-[0.06em]"
          style={{ fontSize: 'clamp(54px, 10vw, 96px)' }}
        >
          Offroad
        </motion.h1>
        <motion.h1
          variants={fadeUp}
          className="font-display text-white leading-none mb-5 tracking-[0.06em]"
          style={{ fontSize: 'clamp(54px, 10vw, 96px)' }}
        >
          Sem Juízo
        </motion.h1>

        {/* Subtitle */}
        <motion.div variants={fadeUp} className="flex flex-col items-center mb-11">
          <p className="font-mono text-gold/80 text-sm tracking-[0.3em] uppercase">Única Regra</p>
          <p className="font-mono text-white/50 text-sm tracking-[0.3em] uppercase">Não Tem Regra</p>
        </motion.div>

        {/* CTA */}
        <motion.a
          variants={fadeUp}
          href="https://instagram.com/offroadsemjuizo"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-gold text-offblack font-display text-[22px] tracking-[0.22em] px-14 py-5 border-2 border-gold hover:bg-transparent hover:text-gold transition-all duration-300"
          whileHover={{ scale: 1.025 }}
          whileTap={{ scale: 0.97 }}
        >
          <InstaIcon />
          @OffRoadSemJuizo
        </motion.a>
      </motion.div>

      {/* Bottom footer strip */}
      <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/[0.08] py-5 text-center">
        <p className="font-mono text-gold/55 text-[10px] tracking-[0.35em] uppercase">
          Clube Offroad Sem Juízo © 2026
        </p>
        <p className="font-mono text-gold/35 text-[10px] tracking-[0.35em] uppercase mt-1">
          Única Regra: Não Tem Regra
        </p>
      </div>
    </section>
  )
}
