import { motion } from 'framer-motion'

const features = [
  {
    label: 'Todo Tipo\nde 4x4',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
  {
    label: 'Galera\nSem Frescura',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
  },
  {
    label: 'Trilhas\nExtremas',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>
    ),
  },
  {
    label: 'Pura\nAdrenalina',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
      </svg>
    ),
  },
]

export default function About() {
  return (
    <section id="sobre" className="relative overflow-hidden" style={{ background: '#C9A227' }}>
      <div className="max-w-6xl mx-auto px-8 md:px-16 pt-28 pb-0 grid md:grid-cols-2 gap-16 items-start">

        {/* Left — text */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2
            className="font-display text-offblack leading-none mb-8 tracking-tight"
            style={{ fontSize: 'clamp(56px, 8vw, 90px)' }}
          >
            Quem<br />Somos
          </h2>
          <p className="font-body font-semibold text-offblack text-[17px] leading-relaxed mb-4">
            Somos um bando de aventureiros que vive para sentir a adrenalina das
            trilhas, a lama nos pneus e a liberdade do off-road.
          </p>
          <p className="font-body text-offblack/75 text-[16px] leading-relaxed">
            Não importa o veículo, não importa a experiência. Se você tem sangue
            de aventureiro, é tudo nosso.
          </p>
        </motion.div>

        {/* Right — feature grid */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          {features.map(({ label, icon }, i) => (
            <motion.div
              key={i}
              className="bg-offblack flex flex-col items-center justify-center text-center px-5 py-9 gap-4"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <span className="text-white opacity-80">{icon}</span>
              <span
                className="font-body font-bold text-white text-[11px] tracking-[0.22em] uppercase leading-snug whitespace-pre-line"
              >
                {label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Diagonal cut → black */}
      <div className="relative h-20 mt-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: '#C9A227' }} />
        <div
          className="absolute inset-0 bg-offblack"
          style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }}
        />
      </div>
    </section>
  )
}
