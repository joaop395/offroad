import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { API_BASE, resolveApiAssetUrl } from '../lib/api'

export default function Sponsors() {
  const [sponsors, setSponsors] = useState([])

  useEffect(() => {
    fetch(`${API_BASE}/api/sponsors`)
      .then(r => r.json())
      .then(setSponsors)
      .catch(() => {})
  }, [])

  if (sponsors.length === 0) return null

  return (
    <section className="bg-offblack py-20 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 px-6"
      >
        <p className="font-mono text-gold/50 text-[10px] tracking-[0.4em] uppercase mb-3">— apoiadores —</p>
        <h2
          className="font-display text-white/80 tracking-[0.1em]"
          style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}
        >
          Quem Apoia o Rolé
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex flex-wrap justify-center items-center gap-10 md:gap-16 px-8 max-w-5xl mx-auto"
      >
        {sponsors.map((s, i) => {
          const img = (
            <img
              src={resolveApiAssetUrl(`/uploads/sponsors/${s.filename}`)}
              alt={s.name}
              className="h-12 md:h-16 w-auto max-w-[160px] object-contain opacity-40 grayscale hover:opacity-100 hover:grayscale-0 hover:scale-110 transition-all duration-300"
            />
          )
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              {s.url ? (
                <a href={s.url} target="_blank" rel="noopener noreferrer" title={s.name}>
                  {img}
                </a>
              ) : img}
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}
