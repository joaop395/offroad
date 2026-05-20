import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

function UserIcon({ className = '' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  )
}

export default function LoginDropdown({ open, onClose }) {
  const { login, isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) {
      setEmail('')
      setPassword('')
      setError('')
      setLoading(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/offroad-admin/dashboard')
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await logout()
    onClose()
  }

  function handleGoToDashboard() {
    navigate('/offroad-admin/dashboard')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-offblack/96 backdrop-blur-sm border border-gold/20 shadow-[0_8px_32px_rgba(0,0,0,0.6)] z-50"
        >
          <div className="p-4">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <UserIcon className="w-8 h-8 text-gold/60" />
                  <div>
                    <p className="font-mono text-sm text-white truncate">{user.email}</p>
                    <p className="font-mono text-[10px] text-gold/50 uppercase tracking-[0.2em]">{user.role}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={handleGoToDashboard}
                    className="w-full bg-gold text-offblack font-display tracking-[0.16em] uppercase text-sm py-2.5 hover:bg-gold-dark transition-colors"
                  >
                    Painel Admin
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full border border-white/15 text-white/60 font-mono text-xs tracking-widest uppercase py-2.5 hover:border-red-800/50 hover:text-red-400 transition-colors"
                  >
                    Sair
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="font-mono text-gold/40 text-[10px] tracking-[0.4em] uppercase mb-4 text-center">
                  — acesso restrito —
                </p>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="font-mono text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="w-full bg-offblack border border-white/10 text-white font-body text-sm px-3 py-2 focus:outline-none focus:border-gold/60 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                      Senha
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full bg-offblack border border-white/10 text-white font-body text-sm px-3 py-2 focus:outline-none focus:border-gold/60 transition-colors"
                    />
                  </div>
                  {error && (
                    <p className="font-mono text-[10px] text-red-400 tracking-wide">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gold text-offblack font-display tracking-[0.16em] uppercase text-sm py-2.5 hover:bg-gold-dark transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Entrando...' : 'Entrar'}
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
