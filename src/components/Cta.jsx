import { motion } from 'framer-motion'

const InstaIcon = () => (
  <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

export default function Cta() {
  return (
    <section id="cta" className="bg-offblack flex flex-col items-center text-center pt-24 pb-0">
      {/* Logo circle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="w-36 h-36"
      >
        <img src="/logo.png" alt="Logo Club OffRoad Sem Juízo" className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.5)]" />
      </motion.div>

      {/* Scan accent lines */}
      <div className="w-full h-px bg-green-500/45 my-6" />

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="font-display text-gold tracking-[0.06em] mb-5"
        style={{ fontSize: 'clamp(44px, 7vw, 72px)' }}
      >
        Bora Pra Trilha?
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="font-mono text-white/55 text-sm tracking-[0.18em] mb-11 max-w-xs"
      >
        Segue a gente no Instagram e fica por dentro de todos os rolés
      </motion.p>

      {/* CTA button */}
      <motion.a
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.3 }}
        href="https://instagram.com/offroadsemjuizo"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 bg-gold text-offblack font-display text-[22px] tracking-[0.22em] px-14 py-5 border-2 border-gold hover:bg-transparent hover:text-gold transition-all duration-300 mb-20"
        whileHover={{ scale: 1.025 }}
        whileTap={{ scale: 0.97 }}
      >
        <InstaIcon />
        @OffRoadSemJuizo
      </motion.a>

      {/* Footer bar */}
      <div className="w-full border-t border-white/[0.08] py-6 px-6">
        <p className="font-mono text-gold/55 text-[10px] tracking-[0.35em] uppercase">
          Clube Offroad Sem Juízo © 2026
        </p>
        <p className="font-mono text-gold/35 text-[10px] tracking-[0.35em] uppercase mt-1.5">
          Única Regra: Não Tem Regra
        </p>
      </div>
    </section>
  )
}
