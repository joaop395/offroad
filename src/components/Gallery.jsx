import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { API_BASE, resolveApiAssetUrl } from '../lib/api'

export default function Gallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/gallery`)
      .then(r => r.json())
      .then(data => {
        setImages(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return null
  if (images.length === 0) return null

  return (
    <section id="galeria" className="bg-offblack py-24">
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

      <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-3 gap-1">
        {images.map((img, i) => (
          <motion.div
            key={img.id}
            className="relative overflow-hidden aspect-square group cursor-pointer"
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.07 }}
            onClick={() => setLightbox(img)}
          >
            <img
              src={resolveApiAssetUrl(`/uploads/gallery/${img.filename}`)}
              alt={img.label}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-offblack/0 group-hover:bg-offblack/60 transition-all duration-300 flex flex-col items-center justify-center gap-3">
              <div className="relative w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-gold" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gold" />
                <div className="absolute inset-1 border border-gold rounded-full" />
              </div>
              <span className="font-mono text-gold text-[9px] tracking-[0.3em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                {img.label}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-offblack/95 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/60 hover:text-white text-3xl font-mono z-10"
            onClick={() => setLightbox(null)}
          >
            ×
          </button>
          <img
            src={resolveApiAssetUrl(`/uploads/gallery/${lightbox.filename}`)}
            alt={lightbox.label}
            className="max-w-full max-h-[90vh] object-contain"
            onClick={e => e.stopPropagation()}
          />
          <p className="absolute bottom-6 left-0 right-0 text-center font-mono text-gold text-sm tracking-widest">
            {lightbox.label}
          </p>
        </div>
      )}
    </section>
  )
}
