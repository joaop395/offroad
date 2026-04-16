import { useEffect, useState } from 'react'

import { API_PATHS, resolveApiAssetUrl } from '../../lib/api'

function toLocalDatetime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function extractErrorMessage(error) {
  if (!error) return 'Erro ao salvar evento parceiro.'
  if (typeof error === 'string') return error

  if (error?.fieldErrors) {
    const firstFieldError = Object.values(error.fieldErrors).flat().find(Boolean)
    if (firstFieldError) return firstFieldError
  }

  if (error?.formErrors?.length) return error.formErrors[0]
  return 'Erro ao salvar evento parceiro.'
}

export default function PartnerEventForm({ initial, apiFetch, onSave, onCancel }) {
  const isEditing = !!initial
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    date: toLocalDatetime(initial?.date),
    location: initial?.location ?? '',
    description: initial?.description ?? '',
  })
  const [bannerFile, setBannerFile] = useState(null)
  const [removeBanner, setRemoveBanner] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => {
    if (!bannerFile) {
      setPreviewUrl(null)
      return undefined
    }

    const objectUrl = URL.createObjectURL(bannerFile)
    setPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [bannerFile])

  const currentBanner = previewUrl || (removeBanner ? null : resolveApiAssetUrl(initial?.bannerUrl))

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const body = new FormData()
      body.append('name', form.name)
      body.append('date', new Date(form.date).toISOString())
      body.append('location', form.location)
      body.append('description', form.description)
      body.append('removeBanner', removeBanner ? 'true' : 'false')

      if (bannerFile) body.append('banner', bannerFile)

      const url = isEditing ? `${API_PATHS.partnerEvents}/${initial.id}` : API_PATHS.partnerEvents
      const method = isEditing ? 'PUT' : 'POST'
      const res = await apiFetch(url, { method, body })
      const data = await res.json()

      if (!res.ok) throw new Error(extractErrorMessage(data.error))

      onSave()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full bg-offblack border border-white/10 text-white font-body text-sm px-3 py-2.5 focus:outline-none focus:border-gold/60 transition-colors'
  const labelCls = 'font-mono text-[11px] tracking-widest text-white/50 uppercase block mb-1.5'

  return (
    <div className="mb-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl tracking-widest text-gold">
          {isEditing ? 'Editar Evento Parceiro' : 'Novo Evento Parceiro'}
        </h2>
        <button onClick={onCancel} className="font-mono text-[11px] tracking-widest text-white/40 hover:text-white/70 uppercase transition-colors">
          ← Voltar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="relative space-y-5 border border-gold/30 bg-card p-6">
        <div className="absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-gold" />

        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelCls}>Nome do evento parceiro</label>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)} required maxLength={120} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Data e hora</label>
            <input type="datetime-local" value={form.date} onChange={e => set('date', e.target.value)} required className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Local opcional</label>
            <input type="text" value={form.location} onChange={e => set('location', e.target.value)} maxLength={200} className={inputCls} />
          </div>

          <div className="md:col-span-2">
            <label className={labelCls}>Texto do evento</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              required
              rows={6}
              maxLength={5000}
              className={inputCls}
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelCls}>Banner opcional</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null
                setBannerFile(file)
                if (file) setRemoveBanner(false)
              }}
              className={inputCls}
            />

            {currentBanner && (
              <div className="mt-4 border border-white/10 bg-offblack/30 p-3">
                <img src={currentBanner} alt="Preview do banner" className="h-44 w-full object-cover" />
              </div>
            )}

            {isEditing && initial?.bannerUrl && (
              <label className="mt-3 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-white/45">
                <input
                  type="checkbox"
                  checked={removeBanner}
                  onChange={(e) => {
                    setRemoveBanner(e.target.checked)
                    if (e.target.checked) setBannerFile(null)
                  }}
                />
                Remover banner atual
              </label>
            )}
          </div>
        </div>

        {error && <p className="font-mono text-[11px] tracking-wide text-red-400">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-gold px-6 py-2.5 font-display text-sm uppercase tracking-[0.16em] text-offblack transition-colors hover:bg-gold-dark disabled:opacity-50"
          >
            {saving ? 'Salvando...' : isEditing ? 'Salvar alteracoes' : 'Criar evento parceiro'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="border border-white/20 px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-white/50 transition-colors hover:text-white/70"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
