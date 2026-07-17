import { useEffect, useState } from 'react'

import { API_PATHS, resolveApiAssetUrl } from '../../lib/api'

const CLASSIFICATIONS = [
  { value: 'LEVE_4X4',     label: 'Leve 4x4' },
  { value: 'LEVE_AT_4X4',  label: 'Leve · Pneu AT' },
  { value: 'MODERADA_AT',  label: 'Moderada · Pneu AT' },
  { value: 'MODERADA_MUD', label: 'Moderada · Pneu Mud' },
  { value: 'AVANCADA',     label: 'Avançada · Lift + Preparados' },
  { value: 'REUNIAO',      label: 'Reunião' },
]

function toLocalDatetime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function EventForm({ initial, apiFetch, onSave, onCancel }) {
  const isEditing = !!initial

  const [form, setForm] = useState({
    name:       initial?.name ?? '',
    date:       toLocalDatetime(initial?.date),
    location:   initial?.location ?? '',
    description: initial?.description ?? '',
    classification: initial?.classification ?? 'LEVE_4X4',
    priceAdult: initial?.priceAdult ?? '',
    priceChild: initial?.priceChild ?? '',
    maxSlots:   initial?.maxSlots ?? '',
    isBeneficente: initial?.isBeneficente ?? false,
  })
  const [accountabilityFile, setAccountabilityFile] = useState(null)
  const [removeAccountabilityImage, setRemoveAccountabilityImage] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [removeLogo, setRemoveLogo] = useState(false)
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(null)
  const [error, setError]   = useState('')
  const [saving, setSaving] = useState(false)
  const [savedEventId, setSavedEventId] = useState(null)
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    if (!accountabilityFile) {
      setPreviewUrl(null)
      return undefined
    }

    const objectUrl = URL.createObjectURL(accountabilityFile)
    setPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [accountabilityFile])

  useEffect(() => {
    if (!logoFile) {
      setLogoPreviewUrl(null)
      return undefined
    }

    const objectUrl = URL.createObjectURL(logoFile)
    setLogoPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [logoFile])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function extractErrorMessage(error) {
    if (!error) return 'Erro ao salvar evento.'
    if (typeof error === 'string') return error

    if (error?.fieldErrors) {
      const firstFieldError = Object.values(error.fieldErrors).flat().find(Boolean)
      if (firstFieldError) return firstFieldError
    }

    if (error?.formErrors?.length) return error.formErrors[0]
    return 'Erro ao salvar evento.'
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const body = new FormData()
      body.append('name', form.name)
      body.append('date', new Date(form.date).toISOString())
      body.append('location', form.location)
      body.append('description', form.description || '')
      body.append('isBeneficente', String(form.isBeneficente))
      body.append('classification', form.isBeneficente ? 'REUNIAO' : form.classification)
      body.append('priceAdult', form.isBeneficente ? '0' : String(Number(form.priceAdult)))
      body.append('priceChild', form.isBeneficente ? '0' : String(Number(form.priceChild)))
      body.append('maxSlots', form.isBeneficente ? '0' : String(Number(form.maxSlots)))
      body.append('removeAccountabilityImage', removeAccountabilityImage ? 'true' : 'false')
      body.append('removeLogo', removeLogo ? 'true' : 'false')

      if (accountabilityFile) body.append('accountabilityImage', accountabilityFile)
      if (logoFile) body.append('eventLogo', logoFile)

      const url    = isEditing ? `${API_PATHS.ownEvents}/${initial.id}` : API_PATHS.ownEvents
      const method = isEditing ? 'PUT' : 'POST'
      const res    = await apiFetch(url, { method, body })
      const data   = await res.json()
      if (!res.ok) throw new Error(extractErrorMessage(data.error))

      if (!isEditing && data.id) {
        setSavedEventId(data.id)
      }
      onSave()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function handleCopyLink() {
    const link = `${window.location.origin}/evento-beneficente/${savedEventId || initial?.id}`
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    })
  }

  const inputCls = "w-full bg-offblack border border-white/10 text-white font-body text-sm px-3 py-2.5 focus:outline-none focus:border-gold/60 transition-colors"
  const labelCls = "font-mono text-[11px] tracking-widest text-white/50 uppercase block mb-1.5"
  const currentAccountabilityImage = previewUrl || (removeAccountabilityImage ? null : resolveApiAssetUrl(initial?.accountabilityImageUrl))
  const currentLogoImage = logoPreviewUrl || (removeLogo ? null : resolveApiAssetUrl(initial?.logoUrl))

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-gold tracking-widest text-2xl">
          {isEditing ? 'Editar Evento' : 'Novo Evento'}
        </h2>
        <button onClick={onCancel} className="font-mono text-[11px] tracking-widest text-white/40 hover:text-white/70 uppercase transition-colors">
          ← Voltar
        </button>
      </div>

      {savedEventId && (
        <div className="mb-6 border border-green-500/30 bg-green-500/10 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1">
            <p className="font-mono text-[11px] tracking-widest text-green-400 uppercase">Link de inscrição gerado:</p>
            <p className="font-body text-sm text-white/70 mt-1 break-all">
              {`${window.location.origin}/evento-beneficente/${savedEventId}`}
            </p>
          </div>
          <button
            onClick={handleCopyLink}
            className="bg-green-600/80 text-white font-mono text-[11px] tracking-widest uppercase px-4 py-2 hover:bg-green-600 transition-colors whitespace-nowrap"
          >
            {copiedLink ? 'Copiado!' : 'Copiar Link'}
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="border border-gold/30 bg-card p-6 relative space-y-5">
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-gold" />

        {/* Toggle Beneficente */}
        <div className="flex items-center gap-3 p-3 border border-white/10 bg-offblack/50">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.isBeneficente}
              onChange={(e) => set('isBeneficente', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white/40 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 peer-checked:after:bg-white"></div>
          </label>
          <div>
            <span className="font-mono text-[11px] tracking-widest text-white/70 uppercase">Evento Beneficente</span>
            <p className="font-body text-xs text-white/40 mt-0.5">Cadastramento de veículos para transporte</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className={labelCls}>Nome do evento</label>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)} required maxLength={120} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Data e hora</label>
            <input type="datetime-local" value={form.date} onChange={e => set('date', e.target.value)} required className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Local</label>
            <input type="text" value={form.location} onChange={e => set('location', e.target.value)} required maxLength={200} className={inputCls} />
          </div>

          {/* Campo Descrição - aparece sempre */}
          <div className="md:col-span-2">
            <label className={labelCls}>Descrição (opcional)</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              maxLength={5000}
              rows={3}
              className={inputCls}
              placeholder="Descreva o evento..."
            />
          </div>

          {/* Campos Normais - só aparece quando NÃO é beneficente */}
          {!form.isBeneficente && (
            <>
              <div>
                <label className={labelCls}>Classificação</label>
                <select value={form.classification} onChange={e => set('classification', e.target.value)} className={inputCls + ' cursor-pointer'}>
                  {CLASSIFICATIONS.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Vagas máximas obrigatórias</label>
                <input type="number" value={form.maxSlots} onChange={e => set('maxSlots', e.target.value)} required min={0} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Valor adulto (R$)</label>
                <input type="number" value={form.priceAdult} onChange={e => set('priceAdult', e.target.value)} required min={0} step="0.01" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Valor criança (R$)</label>
                <input type="number" value={form.priceChild} onChange={e => set('priceChild', e.target.value)} required min={0} step="0.01" className={inputCls} />
              </div>
            </>
          )}

          {/* Upload Logo - só aparece quando É beneficente */}
          {form.isBeneficente && (
            <div className="md:col-span-2">
              <label className={labelCls}>Logo do evento</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null
                  setLogoFile(file)
                  if (file) setRemoveLogo(false)
                }}
                className={inputCls}
              />

              {currentLogoImage && (
                <div className="mt-4 border border-white/10 bg-offblack/30 p-3">
                  <img
                    src={currentLogoImage}
                    alt="Preview do logo"
                    className="max-h-48 w-full object-contain"
                  />
                </div>
              )}

              {isEditing && initial?.logoUrl && (
                <label className="mt-3 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-white/45">
                  <input
                    type="checkbox"
                    checked={removeLogo}
                    onChange={(e) => {
                      setRemoveLogo(e.target.checked)
                      if (e.target.checked) setLogoFile(null)
                    }}
                  />
                  Remover logo atual
                </label>
              )}
            </div>
          )}

          {/* Print prestação - só aparece quando NÃO é beneficente */}
          {!form.isBeneficente && (
            <div className="md:col-span-2">
              <label className={labelCls}>Print da prestação de contas</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null
                  setAccountabilityFile(file)
                  if (file) setRemoveAccountabilityImage(false)
                }}
                className={inputCls}
              />

              {currentAccountabilityImage && (
                <div className="mt-4 border border-white/10 bg-offblack/30 p-3">
                  <img
                    src={currentAccountabilityImage}
                    alt="Preview da prestação de contas"
                    className="max-h-72 w-full object-contain"
                  />
                </div>
              )}

              {isEditing && initial?.accountabilityImageUrl && (
                <label className="mt-3 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-white/45">
                  <input
                    type="checkbox"
                    checked={removeAccountabilityImage}
                    onChange={(e) => {
                      setRemoveAccountabilityImage(e.target.checked)
                      if (e.target.checked) setAccountabilityFile(null)
                    }}
                  />
                  Remover print atual
                </label>
              )}
            </div>
          )}
        </div>

        {error && <p className="font-mono text-[11px] text-red-400 tracking-wide">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-gold text-offblack font-display tracking-[0.16em] uppercase text-sm px-6 py-2.5 hover:bg-gold-dark transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : form.isBeneficente ? 'Criar evento beneficente' : 'Criar evento'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="font-mono text-[11px] tracking-widest uppercase px-5 py-2.5 border border-white/20 text-white/50 hover:text-white/70 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
