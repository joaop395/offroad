import { useEffect, useState } from 'react'
import { API_PATHS, resolveApiAssetUrl } from '../../lib/api'

export default function TipsForm({ initial, apiFetch, onSave, onCancel }) {
  const isEditing = !!initial

  const [form, setForm] = useState({
    title: initial?.title ?? '',
    youtubeUrl: initial?.youtubeUrl ?? '',
    description: initial?.description ?? '',
    published: initial?.published ?? true,
  })
  const [imageFile, setImageFile] = useState(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(imageFile)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [imageFile])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  const currentImage = previewUrl || (removeImage ? null : resolveApiAssetUrl(initial?.imageUrl))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const body = new FormData()
      body.append('title', form.title)
      body.append('youtubeUrl', form.youtubeUrl)
      body.append('description', form.description)
      body.append('published', form.published ? 'true' : 'false')
      body.append('order', String(initial?.order ?? 0))
      body.append('removeImage', removeImage ? 'true' : 'false')

      if (imageFile) body.append('image', imageFile)

      const url = isEditing ? `${API_PATHS.tips}/${initial.id}` : API_PATHS.tips
      const method = isEditing ? 'PUT' : 'POST'
      const res = await apiFetch(url, { method, body })
      const data = await res.json()

      if (!res.ok) {
        const msg = data.error?.fieldErrors
          ? Object.values(data.error.fieldErrors).flat().find(Boolean)
          : data.error?.formErrors?.[0] || data.error || 'Erro ao salvar dica.'
        throw new Error(typeof msg === 'string' ? msg : 'Erro ao salvar dica.')
      }

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
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-gold tracking-widest text-2xl">
          {isEditing ? 'Editar Dica' : 'Nova Dica'}
        </h2>
        <button onClick={onCancel} className="font-mono text-[11px] tracking-widest text-white/40 hover:text-white/70 uppercase transition-colors">
          ← Voltar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="border border-gold/30 bg-card p-6 relative space-y-5">
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-gold" />

        <div>
          <label className={labelCls}>Título</label>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)} required maxLength={120} className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Link do YouTube</label>
          <input type="url" value={form.youtubeUrl} onChange={e => set('youtubeUrl', e.target.value)} required placeholder="https://youtu.be/VIDEO_ID ou https://youtube.com/watch?v=..." className={inputCls} />
          <p className="mt-1 font-mono text-[10px] text-white/30">Cole o link do vídeo (YouTube, YouTube Shorts ou youtu.be)</p>
        </div>

        <div>
          <label className={labelCls}>Descrição</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} maxLength={2000} className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Imagem opcional</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null
              setImageFile(file)
              if (file) setRemoveImage(false)
            }}
            className={inputCls}
          />
          {currentImage && (
            <div className="mt-3 border border-white/10 bg-offblack/30 p-2">
              <img src={currentImage} alt="Preview" className="max-h-48 w-full object-contain" />
            </div>
          )}
          {isEditing && initial?.imageUrl && (
            <label className="mt-3 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-white/45">
              <input
                type="checkbox"
                checked={removeImage}
                onChange={(e) => {
                  setRemoveImage(e.target.checked)
                  if (e.target.checked) setImageFile(null)
                }}
              />
              Remover imagem atual
            </label>
          )}
        </div>

        <label className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-white/60">
          <input
            type="checkbox"
            checked={form.published}
            onChange={e => set('published', e.target.checked)}
            className="accent-gold"
          />
          Publicado
        </label>

        {error && <p className="font-mono text-[11px] text-red-400 tracking-wide">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-gold text-offblack font-display tracking-[0.16em] uppercase text-sm px-6 py-2.5 hover:bg-gold-dark transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar dica'}
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
