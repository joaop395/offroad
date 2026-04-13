import { motion } from 'framer-motion'

// Terrain-inspired gradient placeholders — swap src="" with real photo paths
const tiles = [
  { bg: 'linear-gradient(135deg,#2a4a1a 0%,#3d6b2e 55%,#5a8b4a 100%)', label: 'Lama & Adrenalina' },
  { bg: 'linear-gradient(160deg,#6b8b4a 0%,#8aaf6a 50%,#4a6b30 100%)', label: 'Estrada Bruta'     },
  { bg: 'linear-gradient(135deg,#a08060 0%,#c5a07a 55%,#8b6040 100%)', label: 'Poeira & Glória'   },
  { bg: 'linear-gradient(135deg,#d4b896 0%,#c9a87a 55%,#e8d4b0 100%)', label: 'Dunas'             },
  { bg: 'linear-gradient(180deg,#1a3a1a 0%,#2d5a2d 50%,#4a7a4a 100%)', label: 'Mata Fechada'      },
  { bg: 'linear-gradient(135deg,#c05a30 0%,#d4784a 55%,#e89070 100%)', label: 'Terra Vermelha'    },
  { bg: 'linear-gradient(135deg,#7a5030 0%,#a07050 55%,#c09070 100%)', label: 'Trilha de Pedra'   },
  { bg: 'linear-gradient(160deg,#1a2a40 0%,#2a4060 50%,#1a3050 100%)', label: 'Noturna'           },
]

export default function Gallery() {
  return (
    <section id="galeria" className="bg-offblack py-24">
      {/* Section heading */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center mb-14 px-6"
      >
        <p className="font-mono text-gold/50 text-[10px] tracking-[0.4em] uppercase mb-3">— fotos —</p>
        <h2
          className="font-display text-gold tracking-[0.12em]"
          style={{ fontSize: 'clamp(38px, 5.5vw, 64px)' }}
        >
          Nossas Aventuras
        </h2>
      </motion.div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
        {tiles.map(({ bg, label }, i) => (
          <motion.div
            key={i}
            className="relative overflow-hidden aspect-square group cursor-pointer"
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.07 }}
          >
            {/* Background */}
            <div
              className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
              style={{ background: bg }}
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-offblack/0 group-hover:bg-offblack/55 transition-all duration-300 flex flex-col items-center justify-center gap-3">
              {/* Crosshair */}
              <div className="relative w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-gold" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gold" />
                <div className="absolute inset-1 border border-gold rounded-full" />
              </div>
              <span className="font-mono text-gold text-[9px] tracking-[0.3em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                {label}
              </span>
            </div>

            {/* Placeholder label */}
            <div className="absolute bottom-1.5 left-2 opacity-20 group-hover:opacity-0 transition-opacity">
              <span className="font-mono text-white text-[8px] tracking-widest">ADD FOTO</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
