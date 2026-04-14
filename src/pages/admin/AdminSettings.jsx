import { useState, useEffect } from 'react'

export default function AdminSettings({ apiFetch }) {
  const [number, setNumber]   = useState('')
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    apiFetch('/api/settings')
      .then(r => r.json())
      .then(d => setNumber(d.whatsappNumber ?? ''))
      .finally(() => setLoading(false))
  }, [apiFetch])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaved(false)
    setSaving(true)
    try {
      const res = await apiFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ whatsappNumber: number }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(JSON.stringify(data.error))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 className="font-display text-gold tracking-widest text-2xl mb-6">Configurações</h2>

      <div className="border border-gold/30 bg-card p-6 relative max-w-md">
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-gold" />

        {loading ? (
          <p className="font-mono text-white/40 text-sm">Carregando...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-mono text-[11px] tracking-widest text-white/50 uppercase block mb-1.5">
                Número WhatsApp do admin
              </label>
              <p className="font-mono text-[10px] text-white/30 mb-2">
                Usado no link de confirmação pós-pagamento. Formato: 5511999990000
              </p>
              <input
                type="text"
                value={number}
                onChange={e => setNumber(e.target.value)}
                placeholder="5511999990000"
                maxLength={20}
                required
                className="w-full bg-offblack border border-white/10 text-white font-body text-sm px-3 py-2.5 focus:outline-none focus:border-gold/60 transition-colors"
              />
            </div>

            {error && <p className="font-mono text-[11px] text-red-400">{error}</p>}
            {saved && <p className="font-mono text-[11px] text-green-400">✓ Salvo com sucesso</p>}

            <button
              type="submit"
              disabled={saving}
              className="bg-gold text-offblack font-display tracking-[0.16em] uppercase text-sm px-6 py-2.5 hover:bg-gold-dark transition-colors disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
