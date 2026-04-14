import { useState } from 'react'
import { motion } from 'framer-motion'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

const DIFF = {
  LEVE_4X4:    { label: 'Leve 4x4',           color: '#27AE60' },
  LEVE_AT_4X4: { label: 'Leve · Pneu AT',     color: '#2ECC71' },
  MODERADA_AT: { label: 'Moderada · Pneu AT',  color: '#D4682A' },
  MODERADA_MUD:{ label: 'Moderada · Pneu Mud', color: '#E67E22' },
  AVANCADA:    { label: 'Avançada · Lift',     color: '#C0392B' },
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

function formatCurrency(v) {
  return v === 0 ? 'Grátis' : `R$ ${v.toFixed(2)}`
}

// ── Stepper ────────────────────────────────────────────────────────────────
function Stepper({ label, value, onChange, min = 0, max }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-sm text-white/70 tracking-wide">{label}</span>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 border border-gold/40 text-gold font-display text-lg flex items-center justify-center hover:bg-gold/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >−</button>
        <span className="font-display text-gold text-xl w-5 text-center">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-8 h-8 border border-gold/40 text-gold font-display text-lg flex items-center justify-center hover:bg-gold/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >+</button>
      </div>
    </div>
  )
}

// ── Input ──────────────────────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div>
      <label className="font-mono text-[11px] tracking-widest text-white/50 uppercase block mb-1.5">{label}</label>
      {children}
      {error && <p className="font-mono text-[10px] text-red-400 mt-1">{error}</p>}
    </div>
  )
}

const inputCls = "w-full bg-offblack border border-white/10 text-white font-body text-sm px-3 py-2.5 focus:outline-none focus:border-gold/60 transition-colors"

// ── Modal ──────────────────────────────────────────────────────────────────
export default function RegistrationModal({ event, onClose }) {
  const available = event.maxSlots - event.slotsUsed
  const diff = DIFF[event.difficulty] ?? DIFF.LEVE_4X4

  const [step, setStep]       = useState(1) // 1-5
  const [adults, setAdults]   = useState(1)
  const [children, setChildren] = useState(0)

  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const totalParticipants = adults + children
  const total = (adults * event.priceAdult) + (children * event.priceChild)

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function validateForm() {
    const e = {}
    if (!form.name.trim())  e.name  = 'Nome obrigatório.'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'E-mail inválido.'
    if (!form.phone.trim() || form.phone.replace(/\D/g,'').length < 10)
      e.phone = 'Telefone inválido.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handlePay() {
    setSubmitError('')
    setSubmitting(true)
    try {
      const res = await fetch(`${API}/api/payments/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId:         event.id,
          adults,
          children,
          responsibleName: form.name,
          responsiblePhone: form.phone,
          email:           form.email,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message ?? data.error ?? 'Erro ao processar.')
      window.location.href = data.initPoint
    } catch (err) {
      setSubmitError(err.message)
      setSubmitting(false)
    }
  }

  // ── Step content ──────────────────────────────────────────────────────────

  // Step 1: Resumo do evento
  const Step1 = (
    <div className="space-y-5">
      <div>
        <span
          className="inline-block font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-1 mb-3 text-white"
          style={{ backgroundColor: diff.color }}
        >{diff.label}</span>
        <h3 className="font-display text-gold text-2xl tracking-wide">{event.name}</h3>
        <p className="font-mono text-white/50 text-xs mt-1">{formatDate(event.date)} · {event.location}</p>
      </div>

      <div className="border border-white/10 divide-y divide-white/10">
        <div className="flex justify-between px-4 py-3 font-mono text-sm">
          <span className="text-white/50">Adulto</span>
          <span className="text-gold">{formatCurrency(event.priceAdult)}</span>
        </div>
        <div className="flex justify-between px-4 py-3 font-mono text-sm">
          <span className="text-white/50">Criança</span>
          <span className="text-gold">{formatCurrency(event.priceChild)}</span>
        </div>
        <div className="flex justify-between px-4 py-3 font-mono text-sm">
          <span className="text-white/50">Vagas restantes</span>
          <span className="text-white">{available}</span>
        </div>
      </div>

      <button
        onClick={() => setStep(2)}
        className="w-full bg-gold text-offblack font-display tracking-[0.18em] uppercase py-3 hover:bg-gold-dark transition-colors"
      >
        Continuar
      </button>
    </div>
  )

  // Step 2: Quantidade
  const Step2 = (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-gold text-xl tracking-wide mb-1">Participantes</h3>
        <p className="font-mono text-white/40 text-xs">Máximo disponível: {available} no total</p>
      </div>

      <div className="space-y-5 border border-white/10 p-4">
        <Stepper
          label="Adultos"
          value={adults}
          onChange={v => { setAdults(v); if (v + children > available) setChildren(available - v) }}
          min={0}
          max={available - children}
        />
        <Stepper
          label="Crianças"
          value={children}
          onChange={v => setChildren(v)}
          min={0}
          max={available - adults}
        />
      </div>

      <div className="flex justify-between font-mono text-sm border-t border-white/10 pt-4">
        <span className="text-white/50">Subtotal</span>
        <span className="text-gold font-medium">R$ {total.toFixed(2)}</span>
      </div>

      <button
        onClick={() => setStep(3)}
        disabled={totalParticipants < 1}
        className="w-full bg-gold text-offblack font-display tracking-[0.18em] uppercase py-3 hover:bg-gold-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continuar
      </button>
    </div>
  )

  // Step 3: Dados do responsável
  const Step3 = (
    <div className="space-y-5">
      <h3 className="font-display text-gold text-xl tracking-wide">Responsável</h3>

      <Field label="Nome completo" error={errors.name}>
        <input
          type="text"
          value={form.name}
          onChange={e => setField('name', e.target.value)}
          className={inputCls}
          maxLength={120}
        />
      </Field>

      <Field label="E-mail" error={errors.email}>
        <input
          type="email"
          value={form.email}
          onChange={e => setField('email', e.target.value)}
          className={inputCls}
        />
      </Field>

      <Field label="WhatsApp" error={errors.phone}>
        <input
          type="tel"
          value={form.phone}
          onChange={e => setField('phone', e.target.value)}
          placeholder="11999990000"
          className={inputCls}
          maxLength={20}
        />
      </Field>

      <button
        onClick={() => { if (validateForm()) setStep(4) }}
        className="w-full bg-gold text-offblack font-display tracking-[0.18em] uppercase py-3 hover:bg-gold-dark transition-colors"
      >
        Continuar
      </button>
    </div>
  )

  // Step 4: Resumo final
  const Step4 = (
    <div className="space-y-5">
      <h3 className="font-display text-gold text-xl tracking-wide">Confirmar inscrição</h3>

      <div className="border border-white/10 divide-y divide-white/10">
        <div className="px-4 py-3">
          <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-0.5">Evento</p>
          <p className="font-body text-white text-sm">{event.name}</p>
          <p className="font-mono text-white/40 text-xs">{formatDate(event.date)} · {event.location}</p>
        </div>
        <div className="px-4 py-3">
          <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-0.5">Responsável</p>
          <p className="font-body text-white text-sm">{form.name}</p>
          <p className="font-mono text-white/40 text-xs">{form.email} · {form.phone}</p>
        </div>
        <div className="px-4 py-3 space-y-1">
          {adults > 0 && (
            <div className="flex justify-between font-mono text-sm">
              <span className="text-white/50">{adults}× Adulto</span>
              <span className="text-white/70">R$ {(adults * event.priceAdult).toFixed(2)}</span>
            </div>
          )}
          {children > 0 && (
            <div className="flex justify-between font-mono text-sm">
              <span className="text-white/50">{children}× Criança</span>
              <span className="text-white/70">R$ {(children * event.priceChild).toFixed(2)}</span>
            </div>
          )}
        </div>
        <div className="flex justify-between px-4 py-3 font-mono text-sm font-medium">
          <span className="text-white/70">Total</span>
          <span className="text-gold text-base">R$ {total.toFixed(2)}</span>
        </div>
      </div>

      {submitError && (
        <p className="font-mono text-[11px] text-red-400">{submitError}</p>
      )}

      <button
        onClick={handlePay}
        disabled={submitting}
        className="w-full bg-gold text-offblack font-display tracking-[0.18em] uppercase py-3 hover:bg-gold-dark transition-colors disabled:opacity-50"
      >
        {submitting ? 'Redirecionando...' : 'Pagar agora'}
      </button>
    </div>
  )

  const steps = [Step1, Step2, Step3, Step4]
  const titles = ['', 'Participantes', 'Responsável', 'Confirmação']

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-offblack/80 backdrop-blur-sm z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className="w-full max-w-md bg-[#0e0e0e] border border-gold/30 relative"
          onClick={e => e.stopPropagation()}
        >
          {/* Gold corners */}
          <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-gold" />
          <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-gold" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              {step > 1 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="text-white/40 hover:text-white/70 font-mono text-xs tracking-widest uppercase transition-colors"
                >
                  ←
                </button>
              )}
              <div>
                <p className="font-mono text-gold/40 text-[9px] tracking-[0.4em] uppercase">
                  passo {step} de 4
                </p>
                {step > 1 && (
                  <p className="font-display text-white text-base tracking-wide">{titles[step - 1]}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/30 hover:text-white/60 transition-colors text-xl leading-none"
            >×</button>
          </div>

          {/* Step indicator */}
          <div className="flex gap-1 px-6 py-3">
            {[1,2,3,4].map(n => (
              <div
                key={n}
                className="h-0.5 flex-1 transition-colors duration-300"
                style={{ backgroundColor: n <= step ? '#C9A227' : 'rgba(255,255,255,0.1)' }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            {steps[step - 1]}
          </div>
        </div>
      </motion.div>
    </>
  )
}
