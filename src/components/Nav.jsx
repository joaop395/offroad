import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'

const InstaIcon = () => (
  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navItems = [
    { label: 'Sobre', to: '/#sobre', active: location.pathname === '/' && location.hash === '#sobre' },
    { label: 'Galeria', to: '/#galeria', active: location.pathname === '/' && location.hash === '#galeria' },
    { label: 'Eventos', to: '/eventos', active: location.pathname === '/eventos' },
    { label: 'Atolado do Mês', to: '/atolado-do-mes', active: location.pathname === '/atolado-do-mes' },
    { label: 'Prestação de Contas', to: '/prestacao-de-contas', active: location.pathname === '/prestacao-de-contas' },
  ]

  const listRef = useRef(null)
  const [canScroll, setCanScroll] = useState(false)
  const [atEnd, setAtEnd] = useState(true)

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const check = () => {
      setCanScroll(el.scrollWidth > el.clientWidth)
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2)
    }
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    el.addEventListener('scroll', check, { passive: true })
    return () => { ro.disconnect(); el.removeEventListener('scroll', check) }
  }, [])

  const solidNav = scrolled || location.pathname !== '/'
  const handleBrandClick = () => {
    if (location.pathname === '/' && !location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-3 sm:px-6 md:px-8 py-3 transition-all duration-300 ${
        solidNav
          ? 'bg-offblack/96 backdrop-blur-sm border-b border-gold/20'
          : 'bg-transparent'
      }`}
    >
      {/* Brand */}
      <Link to="/" onClick={handleBrandClick} className="flex items-center gap-3 group">
        <div className="w-11 h-11 flex-shrink-0">
          <img src="/logo.png" alt="Logo Club OffRoad Sem Juízo" className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.5)]" />
        </div>
        <span className="font-display text-gold text-xl tracking-[0.2em] hidden sm:block group-hover:text-gold-dark transition-colors">
          Offroad Sem Juízo
        </span>
      </Link>

      {/* Links */}
      <div className="relative flex-1 min-w-0 ml-2 sm:ml-4">
        <ul
          ref={listRef}
          className="flex items-center gap-4 sm:gap-5 lg:gap-8 list-none overflow-x-auto overflow-y-hidden scrollbar-thin -webkit-overflow-scrolling:touch py-1"
        >
          {/* Scroll hint — seta pulsante no canto direito, só mobile e se não chegou ao fim */}
          {canScroll && !atEnd && (
            <li className="sticky right-0 z-10 flex-shrink-0 flex items-center pl-2 pointer-events-none md:hidden">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gold/20 backdrop-blur-sm border border-gold/40 shadow-[0_0_12px_rgba(201,162,39,0.25)] animate-pulse-slow">
                <svg className="w-3 h-3 text-gold" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </li>
          )}
          {navItems.map(({ label, to, active }) => (
            <li key={label} className="flex-shrink-0">
              <Link
                to={to}
                className={`whitespace-nowrap font-body font-semibold text-xs sm:text-sm lg:text-[15px] tracking-[0.12em] sm:tracking-[0.18em] uppercase transition-colors duration-200 relative group ${
                  active ? 'text-gold' : 'text-white/80 hover:text-gold'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {label}
                <span
                  className={`absolute -bottom-1 left-0 right-0 h-px bg-gold transition-transform duration-300 origin-left ${
                    active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </Link>
            </li>
          ))}
          <li className="flex-shrink-0">
            <a
              href="https://instagram.com/offroadsemjuizo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-gold text-offblack font-body font-bold text-xs sm:text-sm tracking-[0.2em] uppercase px-3 sm:px-5 py-2 hover:bg-gold-dark transition-colors duration-200"
            >
              <InstaIcon />
              Insta
            </a>
          </li>
        </ul>
      </div>
    </motion.nav>
  )
}
