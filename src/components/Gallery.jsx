import { motion } from 'framer-motion'

// Fotos reais do clube
const tiles = [
  { src: '/fotos/1.jpg',                                    label: 'Roteiros que ninguém conhece' },
  { src: '/fotos/offclov.jpg',                              label: 'Passagens exclusivas' },
  { src: '/fotos/ze mav.jpg',                               label: 'Emoção de verdade' },
  { src: '/fotos/3bfb0b88-b793-4ac1-aebc-1c4b1a9a0e9f.jpg', label: 'Desafios 4x4' },
  { src: '/fotos/824336b4-5692-4a4e-9e40-16b4e94beeea.jpg', label: 'Equipe unida' },
  { src: '/fotos/Screenshot_9.png',                         label: 'É pra atolar mesmo!' },
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
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-3 gap-1">
        {tiles.map(({ src, label }, i) => (
          <motion.div
            key={i}
            className="relative overflow-hidden aspect-square group cursor-pointer"
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.07 }}
          >
            {/* Real photo */}
            <img
              src={src}
              alt={label}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-offblack/0 group-hover:bg-offblack/60 transition-all duration-300 flex flex-col items-center justify-center gap-3">
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
          </motion.div>
        ))}
      </div>
    </section>
  )
}
