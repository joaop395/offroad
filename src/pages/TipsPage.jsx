import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { API_BASE, API_PATHS, resolveApiAssetUrl } from '../lib/api'

function getYoutubeEmbedUrl(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]
  for (const pattern of patterns) {
    const match = String(url ?? '').match(pattern)
    if (match) return `https://www.youtube-nocookie.com/embed/${match[1]}`
  }
  return null
}

function getYoutubeThumbnail(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]
  for (const pattern of patterns) {
    const match = String(url ?? '').match(pattern)
    if (match) return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`
  }
  return null
}

export default function TipsPage() {
  const [tips, setTips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}${API_PATHS.tips}`)
      .then(r => r.json())
      .then(data => {
        setTips(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Não foi possível carregar as dicas.')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!selected) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') setSelected(null) }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [selected])

  return (
    <section className="relative min-h-screen overflow-hidden bg-offblack pt-24 pb-16 md:pt-28 md:pb-20">
      <div className="events-mud-base absolute inset-0" />
      <div className="events-mud-vignette absolute inset-0" />
      <div className="events-mud-blob events-mud-blob-a absolute" />
      <div className="events-mud-blob events-mud-blob-c absolute" />
      <div className="events-dust absolute inset-0" />
      <div className="diag-texture absolute inset-0 opacity-[0.16]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,6,4,0.08)_0%,rgba(8,8,8,0.34)_38%,rgba(8,8,8,0.74)_100%)]" />

      <div className="absolute top-24 left-0 right-0 h-px bg-gold/30" />
      <div className="absolute top-44 right-[-8%] h-px w-72 rotate-[14deg] bg-white/10" />
      <div className="absolute bottom-28 left-[-8%] h-px w-80 rotate-[-14deg] bg-gold/18" />

      <div className="relative z-10 mx-auto max-w-6xl px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.4em] text-gold/60">— videos —</p>
          <h1
            className="font-display leading-none tracking-[0.08em] text-gold"
            style={{ fontSize: 'clamp(38px, 6vw, 72px)' }}
          >
            Dicas
          </h1>
          <p className="mt-4 max-w-xl font-body text-[15px] leading-relaxed text-white/68">
            Dicas, manutenção, roteiros e tudo que você precisa saber sobre o universo off-road.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 md:mt-10"
        >
          {loading && (
            <p className="font-mono text-sm uppercase tracking-[0.28em] text-white/34">carregando dicas...</p>
          )}

          {!loading && error && (
            <p className="font-mono text-sm uppercase tracking-[0.28em] text-red-300/80">{error}</p>
          )}

          {!loading && !error && tips.length === 0 && (
            <div className="border border-gold/45 bg-[#0f0d0a]/74 p-5 backdrop-blur-md">
              <p className="font-body text-sm leading-relaxed text-white/58">
                Nenhuma dica publicada ainda. Volte em breve!
              </p>
            </div>
          )}

          {!loading && !error && tips.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {tips.map((tip, i) => {
                const embedUrl = getYoutubeEmbedUrl(tip.youtubeUrl)
                const ytThumb = getYoutubeThumbnail(tip.youtubeUrl)

                return (
                  <motion.button
                    key={tip.id}
                    type="button"
                    onClick={() => setSelected(tip)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="group relative overflow-hidden border border-white/10 bg-[#0f0d0a]/74 text-left backdrop-blur-md transition-colors hover:border-gold/50"
                  >
                    <div className="aspect-video overflow-hidden bg-offblack">
                      {tip.imageUrl ? (
                        <img
                          src={resolveApiAssetUrl(tip.imageUrl)}
                          alt={tip.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <img
                          src={ytThumb}
                          alt={tip.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = `https://img.youtube.com/vi/${embedUrl?.split('/').pop()}/hqdefault.jpg`
                          }}
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-offblack/30 transition-colors group-hover:bg-offblack/10">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/80 bg-offblack/60 text-white/90 transition-transform group-hover:scale-110">
                          <svg className="ml-0.5 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-display text-[16px] tracking-[0.06em] text-gold line-clamp-2">{tip.title}</h3>
                      {tip.description && (
                        <p className="mt-1 font-body text-[13px] leading-relaxed text-white/60 line-clamp-2">{tip.description}</p>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-offblack/80 px-3 py-5 backdrop-blur-md md:px-4 md:py-8"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-h-[calc(100vh-2.5rem)] w-full max-w-4xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border border-gold/30 bg-[#0c0b09]">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 md:px-6">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold/55">dica</p>
                    <h2 className="mt-1 font-display text-[22px] tracking-[0.08em] text-gold md:text-[26px]">{selected.title}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="border border-white/12 bg-offblack/74 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.22em] text-white/72 transition-colors hover:border-gold/60 hover:text-gold md:px-4 md:text-[10px]"
                  >
                    Fechar
                  </button>
                </div>
                <div className="aspect-video w-full bg-black">
                  <iframe
                    src={getYoutubeEmbedUrl(selected.youtubeUrl)}
                    title={selected.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                {selected.description && (
                  <div className="border-t border-white/10 px-5 py-4 md:px-6">
                    <p className="font-body text-[15px] leading-relaxed text-white/70">{selected.description}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
