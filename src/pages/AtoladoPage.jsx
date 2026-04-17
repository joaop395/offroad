import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const AUDIO_SRC = '/media/atolado-do-mes/atolado-do-mes.mp3'
const IMAGE_SRC = '/media/atolado-do-mes/atolado-do-mes.jpeg'
const CURTAIN_TRANSITION = { duration: 1.65, ease: [0.22, 1, 0.36, 1] }

export default function AtoladoPage() {
  const [phase, setPhase] = useState('idle')
  const [countdown, setCountdown] = useState(3)
  const audioRef = useRef(null)

  const isIdle = phase === 'idle'
  const isCountdown = phase === 'countdown'
  const isRevealed = phase === 'revealed'

  useEffect(() => {
    const audio = audioRef.current

    return () => {
      if (!audio) return
      audio.pause()
      audio.currentTime = 0
      audio.muted = true
    }
  }, [])

  useEffect(() => {
    if (!isCountdown) return undefined

    const timer = window.setTimeout(() => {
      if (countdown > 1) {
        setCountdown((current) => current - 1)
        return
      }

      setPhase('revealed')
    }, 900)

    return () => window.clearTimeout(timer)
  }, [countdown, isCountdown])

  useEffect(() => {
    if (!isRevealed) return

    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = 0
    audio.muted = false
    audio.volume = 1

    const playback = audio.play()
    playback?.catch(() => {})
  }, [isRevealed])

  function handleRevealStart() {
    if (!isIdle) return

    const audio = audioRef.current

    if (audio) {
      audio.currentTime = 0
      audio.volume = 0
      audio.muted = true

      const prepPlayback = audio.play()
      prepPlayback?.catch(() => {})
    }

    setCountdown(3)
    setPhase('countdown')
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#040202] pt-24 text-white">
      <audio ref={audioRef} src={AUDIO_SRC} preload="auto" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(121,24,18,0.34),transparent_34%),radial-gradient(circle_at_center,rgba(255,214,154,0.09),transparent_48%),linear-gradient(180deg,#080302_0%,#110504_32%,#040202_100%)]" />
      <div className="absolute inset-0 opacity-[0.16]" style={{
        backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.14) 0, transparent 42%), repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0, rgba(255,255,255,0.025) 2px, transparent 2px, transparent 42px)',
      }} />
      <div className="absolute inset-x-0 top-[92px] h-px bg-gold/18" />
      <div className="absolute left-1/2 top-28 h-40 w-[48rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,208,120,0.18),transparent_68%)] blur-2xl" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-[radial-gradient(circle_at_center,rgba(255,214,134,0.12),transparent_65%)] blur-xl" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] max-w-7xl flex-col items-center justify-center px-4 py-8 md:px-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 text-center md:mb-10"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.42em] text-gold/58">
            — sessao especial —
          </p>
          <h1 className="mt-4 font-display text-gold tracking-[0.08em]" style={{ fontSize: 'clamp(38px, 7vw, 86px)' }}>
            Atolado do Mês
          </h1>
        </motion.div>

        <div className="relative h-[min(72vh,840px)] w-full max-w-6xl overflow-hidden rounded-[30px] border border-gold/18 bg-[#0d0605] shadow-[0_30px_110px_rgba(0,0,0,0.58)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,228,176,0.16),transparent_38%),linear-gradient(180deg,rgba(17,7,6,0.72),rgba(4,2,2,0.96))]" />
          <div className="absolute inset-x-[12%] top-6 h-16 rounded-full bg-[radial-gradient(circle,rgba(255,219,152,0.36),transparent_72%)] blur-2xl" />
          <div className="absolute bottom-5 left-8 right-8 h-8 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,219,152,0.18),transparent_75%)] blur-2xl" />

          <AnimatePresence>
            {isRevealed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.86, y: 38 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.95, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex items-center justify-center px-4 pb-8 pt-28 md:px-8 md:pb-10 md:pt-32"
              >
                <div className="relative flex w-full max-w-[220px] flex-col items-center sm:max-w-[250px] md:max-w-[300px] lg:max-w-[340px]">
                  <div className="absolute -inset-4 rounded-[30px] bg-[radial-gradient(circle,rgba(255,219,152,0.26),transparent_64%)] blur-2xl" />
                  <div className="relative w-full rounded-[28px] border border-[#c7a255] bg-[linear-gradient(145deg,#6d4b16,#d2b36e_20%,#4a2f0d_48%,#edcf8f_72%,#6d4b16)] p-[8px] shadow-[0_30px_120px_rgba(0,0,0,0.62)] md:rounded-[34px] md:p-[10px]">
                    <div className="rounded-[22px] border border-[#3f2b0f] bg-[linear-gradient(180deg,#140d08,#050404)] p-2.5 md:rounded-[28px] md:p-3.5">
                      <div className="aspect-[9/16] overflow-hidden rounded-[16px] bg-black md:rounded-[22px]">
                        <img
                          src={IMAGE_SRC}
                          alt="Atolado do mês"
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-center md:mt-4">
                    <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-gold/55 md:text-[10px] md:tracking-[0.36em]">
                      revelado
                    </p>
                    <p className="mt-1.5 font-display text-[20px] tracking-[0.08em] text-white md:mt-2 md:text-[30px]">
                      Atolado do Mês
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-28 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_60%),linear-gradient(180deg,rgba(54,15,13,0.98),rgba(108,21,18,0.95)_24%,rgba(89,16,14,0.96)_72%,rgba(28,7,6,0.98))] shadow-[0_20px_40px_rgba(0,0,0,0.35)]" />
          <div className="pointer-events-none absolute inset-x-0 top-20 z-20 h-4 bg-[linear-gradient(180deg,rgba(255,215,153,0.16),rgba(96,22,18,0))]" />

          <motion.div
            animate={isRevealed ? { x: '-104%' } : { x: '0%' }}
            transition={CURTAIN_TRANSITION}
            className="absolute inset-y-0 left-0 z-30 w-1/2 border-r border-black/30 shadow-[inset_-28px_0_40px_rgba(0,0,0,0.35)]"
            style={{
              backgroundImage: 'linear-gradient(180deg,rgba(140,18,16,0.98),rgba(93,10,11,0.99) 30%,rgba(62,4,6,0.99) 70%,rgba(40,3,5,0.99)), repeating-linear-gradient(90deg,rgba(255,255,255,0.06) 0,rgba(255,255,255,0.06) 10px,rgba(0,0,0,0.08) 10px,rgba(0,0,0,0.08) 36px)',
            }}
          />
          <motion.div
            animate={isRevealed ? { x: '104%' } : { x: '0%' }}
            transition={CURTAIN_TRANSITION}
            className="absolute inset-y-0 right-0 z-30 w-1/2 border-l border-black/30 shadow-[inset_28px_0_40px_rgba(0,0,0,0.35)]"
            style={{
              backgroundImage: 'linear-gradient(180deg,rgba(140,18,16,0.98),rgba(93,10,11,0.99) 30%,rgba(62,4,6,0.99) 70%,rgba(40,3,5,0.99)), repeating-linear-gradient(90deg,rgba(0,0,0,0.08) 0,rgba(0,0,0,0.08) 26px,rgba(255,255,255,0.06) 26px,rgba(255,255,255,0.06) 36px)',
            }}
          />
          <motion.div
            animate={isRevealed ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.45 }}
            className="pointer-events-none absolute inset-y-0 left-1/2 z-40 w-[2px] -translate-x-1/2 bg-[linear-gradient(180deg,rgba(255,210,120,0.55),rgba(0,0,0,0.7),rgba(255,210,120,0.55))]"
          />

          <AnimatePresence mode="wait">
            {isIdle && (
              <motion.div
                key="button"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.45 }}
                className="absolute inset-0 z-50 flex items-center justify-center px-5"
              >
                <div className="text-center">
                  <motion.button
                    type="button"
                    onClick={handleRevealStart}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    animate={{
                      boxShadow: [
                        '0 0 0 rgba(183,28,28,0.25)',
                        '0 0 32px rgba(183,28,28,0.46)',
                        '0 0 0 rgba(183,28,28,0.25)',
                      ],
                    }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="rounded-full border border-[#ff7f72]/28 bg-[linear-gradient(180deg,#ff5047,#ab1613)] px-8 py-5 font-display text-[20px] tracking-[0.08em] text-white shadow-[0_18px_50px_rgba(153,18,14,0.38)] md:px-12 md:py-6 md:text-[24px]"
                  >
                    clique aqui para saber o atolado do mês
                  </motion.button>
                </div>
              </motion.div>
            )}

            {isCountdown && (
              <motion.div
                key="countdown"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center"
              >
                <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.45em] text-gold/50">
                  preparando revelacao
                </p>
                <motion.span
                  key={countdown}
                  initial={{ opacity: 0, scale: 0.68, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.15, y: -16 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display text-[120px] leading-none tracking-[0.08em] text-white drop-shadow-[0_0_24px_rgba(255,225,170,0.28)] md:text-[180px]"
                >
                  {countdown}
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
