import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'

import { API_BASE, API_PATHS, resolveApiAssetUrl } from '../lib/api'
import { formatEventDateTime } from '../lib/calendarEvents'

export default function VehicleRegistrationPage() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formError, setFormError] = useState('')

  const [form, setForm] = useState({
    driverName: '',
    cpf: '',
    plate: '',
    availableSlots: '',
  })

  useEffect(() => {
    fetch(`${API_BASE}/api/own-events/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Evento nao encontrado.')
        const data = await res.json()
        if (!data.isBeneficente) throw new Error('Este evento nao aceita cadastro de veiculos.')
        setEvent(data)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function formatCpf(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }

  function formatPlate(value) {
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 7)
    if (cleaned.length <= 3) return cleaned
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)

    try {
      const res = await fetch(`${API_BASE}/api/vehicle-registrations/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverName: form.driverName.trim(),
          cpf: form.cpf.trim(),
          plate: form.plate.trim().toUpperCase(),
          availableSlots: Number(form.availableSlots),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        const msg = typeof data.error === 'string'
          ? data.error
          : data.error?.fieldErrors
            ? Object.values(data.error.fieldErrors).flat().find(Boolean) || 'Erro ao cadastrar.'
            : 'Erro ao cadastrar.'
        throw new Error(msg)
      }

      setSuccess(true)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls = "w-full bg-offblack border border-white/10 text-white font-body text-sm px-3 py-2.5 focus:outline-none focus:border-gold/60 transition-colors"
  const labelCls = "font-mono text-[11px] tracking-widest text-white/50 uppercase block mb-1.5"
  const logoUrl = resolveApiAssetUrl(event?.logoUrl)

  if (loading) {
    return (
      <div className="min-h-screen bg-offblack flex items-center justify-center">
        <p className="font-mono text-white/40 text-sm tracking-widest uppercase">Carregando...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-offblack flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="font-mono text-red-400 text-sm tracking-widest uppercase mb-4">{error}</p>
          <a href="/eventos" className="font-mono text-gold text-[11px] tracking-widest uppercase hover:underline">
            ← Voltar para eventos
          </a>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-offblack flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md border border-green-500/30 bg-green-500/10 p-8"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <span className="text-green-400 text-3xl">✓</span>
          </div>
          <h2 className="font-display text-gold text-2xl tracking-widest mb-2">Cadastro realizado!</h2>
          <p className="font-body text-white/60 text-sm mb-6">
            Seu veículo foi cadastrado com sucesso para o evento <strong className="text-white/80">{event?.name}</strong>.
          </p>
          <a
            href="/eventos"
            className="inline-block bg-gold text-offblack font-display tracking-[0.16em] uppercase text-sm px-6 py-2.5 hover:bg-gold-dark transition-colors"
          >
            Ver eventos
          </a>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-offblack flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {logoUrl && (
          <div className="mb-6 text-center">
            <img src={logoUrl} alt={event.name} className="max-h-32 mx-auto object-contain" />
          </div>
        )}

        <div className="text-center mb-8">
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-green-400 bg-green-400/10 px-3 py-1">
            Evento Beneficente
          </span>
          <h1 className="font-display text-gold text-3xl tracking-widest mt-4">{event?.name}</h1>
          <p className="font-body text-white/50 text-sm mt-2">
            {event && formatEventDateTime(event.date)}
          </p>
          {event?.location && (
            <p className="font-mono text-white/40 text-xs mt-1">{event.location}</p>
          )}
          {event?.description && (
            <p className="font-body text-white/50 text-sm mt-3 max-w-md mx-auto">{event.description}</p>
          )}
        </div>

        <div className="border border-gold/30 bg-card p-6 relative">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-gold" />

          <h2 className="font-display text-gold text-lg tracking-widest mb-6">Cadastrar Veículo</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelCls}>Nome do motorista</label>
              <input
                type="text"
                value={form.driverName}
                onChange={e => set('driverName', e.target.value)}
                required
                maxLength={120}
                className={inputCls}
                placeholder="Nome completo"
              />
            </div>

            <div>
              <label className={labelCls}>CPF</label>
              <input
                type="text"
                value={form.cpf}
                onChange={e => set('cpf', formatCpf(e.target.value))}
                required
                className={inputCls}
                placeholder="000.000.000-00"
                inputMode="numeric"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Placa do veículo</label>
                <input
                  type="text"
                  value={form.plate}
                  onChange={e => set('plate', formatPlate(e.target.value))}
                  required
                  className={inputCls}
                  placeholder="ABC-1234"
                />
              </div>

              <div>
                <label className={labelCls}>Vagas disponíveis</label>
                <input
                  type="number"
                  value={form.availableSlots}
                  onChange={e => set('availableSlots', e.target.value)}
                  required
                  min={1}
                  max={50}
                  className={inputCls}
                  placeholder="Ex: 3"
                  inputMode="numeric"
                />
              </div>
            </div>

            {formError && (
              <p className="font-mono text-[11px] text-red-400 tracking-wide">{formError}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gold text-offblack font-display tracking-[0.16em] uppercase text-sm px-6 py-3 hover:bg-gold-dark transition-colors disabled:opacity-50"
            >
              {submitting ? 'Cadastrando...' : 'Cadastrar Veículo'}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <a href="/eventos" className="font-mono text-white/30 text-[11px] tracking-widest uppercase hover:text-white/50 transition-colors">
            ← Voltar para eventos
          </a>
        </div>
      </motion.div>
    </div>
  )
}
