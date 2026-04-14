import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminLogin() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  if (isAuthenticated) {
    navigate('/offroad-admin/dashboard', { replace: true })
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/offroad-admin/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-offblack flex items-center justify-center px-4">
      {/* Film grain */}
      <div className="fixed inset-0 pointer-events-none grain" />

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8 opacity-80">
          <img src="/logo.png" alt="Off-Road Sem Juízo" className="w-20 h-20 object-contain" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="border border-gold/30 bg-card p-8 relative"
        >
          {/* Gold corner accent */}
          <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-gold" />
          <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-gold" />

          <p className="font-mono text-gold/40 text-[10px] tracking-[0.4em] uppercase mb-6 text-center">
            — acesso restrito —
          </p>

          <div className="space-y-4">
            <div>
              <label className="font-mono text-[11px] tracking-widest text-white/50 uppercase block mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-offblack border border-white/10 text-white font-body text-sm px-3 py-2.5 focus:outline-none focus:border-gold/60 transition-colors"
              />
            </div>

            <div>
              <label className="font-mono text-[11px] tracking-widest text-white/50 uppercase block mb-1.5">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-offblack border border-white/10 text-white font-body text-sm px-3 py-2.5 focus:outline-none focus:border-gold/60 transition-colors"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 font-mono text-[11px] text-red-400 tracking-wide">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-gold text-offblack font-display tracking-[0.18em] uppercase text-sm py-3 hover:bg-gold-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
