import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'

import Nav from '../components/Nav'

const NAV_OFFSET = 96

function usePublicScrollManager() {
  const location = useLocation()

  useEffect(() => {
    let frameA = 0
    let frameB = 0

    const syncScroll = () => {
      const targetId = decodeURIComponent(location.hash.replace('#', ''))

      if (location.pathname === '/' && targetId) {
        const section = document.getElementById(targetId)

        if (section) {
          const top = section.getBoundingClientRect().top + window.scrollY - NAV_OFFSET
          window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' })
          return
        }
      }

      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    frameA = window.requestAnimationFrame(() => {
      frameB = window.requestAnimationFrame(syncScroll)
    })

    return () => {
      window.cancelAnimationFrame(frameA)
      window.cancelAnimationFrame(frameB)
    }
  }, [location.pathname, location.hash])
}

export default function PublicLayout() {
  const location = useLocation()

  usePublicScrollManager()

  return (
    <div className="min-h-screen overflow-x-hidden bg-offblack text-white">
      <Nav />

      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
    </div>
  )
}
