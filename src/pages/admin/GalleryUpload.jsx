import { useState, useRef } from 'react'
import { resolveApiAssetUrl } from '../../lib/api'

export default function GalleryUpload({ images, apiFetch, onRefresh }) {
  const [label, setLabel] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [reorder, setReorder] = useState({})
  const fileRef = useRef(null)

  function handleFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  function handleCancelFile() {
    setFile(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleUpload(e) {
    e.preventDefault()
    if (!file || !label.trim()) return
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      fd.append('label', label.trim())
      fd.append('order', String(images.length))

      await apiFetch('/api/gallery', { method: 'POST', body: fd })
      setLabel('')
      handleCancelFile()
      onRefresh()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Remover esta foto da galeria?')) return
    await apiFetch(`/api/gallery/${id}`, { method: 'DELETE' })
    onRefresh()
  }

  async function handleMoveUp(img, idx) {
    if (idx === 0) return
    const prev = images[idx - 1]
    await Promise.all([
      apiFetch(`/api/gallery/${img.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: img.label, order: prev.order }),
      }),
      apiFetch(`/api/gallery/${prev.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: prev.label, order: img.order }),
      }),
    ])
    onRefresh()
  }

  async function handleMoveDown(img, idx) {
    if (idx === images.length - 1) return
    const next = images[idx + 1]
    await Promise.all([
      apiFetch(`/api/gallery/${img.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: img.label, order: next.order }),
      }),
      apiFetch(`/api/gallery/${next.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: next.label, order: img.order }),
      }),
    ])
    onRefresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-gold tracking-widest text-2xl">Galeria</h2>
      </div>

      {/* Upload form */}
      <form onSubmit={handleUpload} className="border border-gold/20 bg-card p-5 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40 block mb-1">Label</label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="Ex: Roteiros que ninguém conhece"
              className="w-full bg-offblack border border-white/20 px-3 py-2 text-white font-body text-sm focus:border-gold outline-none"
              required
            />
          </div>
          <div>
            <label className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40 block mb-1">Imagem</label>
            <div className="flex items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="w-full text-white/60 text-sm file:mr-3 file:py-1.5 file:px-3 file:border file:border-gold/40 file:bg-transparent file:text-gold file:text-xs file:font-mono file:tracking-widest file:uppercase hover:file:bg-gold/10 cursor-pointer"
                required={!file}
              />
              {file && (
                <button type="button" onClick={handleCancelFile} className="text-white/40 hover:text-white/70 text-lg">&times;</button>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={saving || !file || !label.trim()}
            className="bg-gold text-offblack font-display tracking-[0.16em] uppercase text-sm px-5 py-2.5 hover:bg-gold-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvando…' : '+ Adicionar'}
          </button>
        </div>
        {preview && (
          <div className="mt-4">
            <img src={preview} alt="preview" className="h-24 w-24 object-cover border border-white/10" />
          </div>
        )}
      </form>

      {/* Lista */}
      {images.length === 0 && (
        <p className="font-mono text-white/40 text-sm">Nenhuma foto na galeria.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {images.map((img, idx) => (
          <div key={img.id} className="border border-white/10 bg-card overflow-hidden group relative">
            <div className="aspect-square relative">
              <img
                src={resolveApiAssetUrl(`/uploads/gallery/${img.filename}`)}
                alt={img.label}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <p className="font-mono text-[10px] text-white/60 truncate">{img.label}</p>
            </div>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {idx > 0 && (
                <button
                  onClick={() => handleMoveUp(img, idx)}
                  className="bg-offblack/80 text-gold px-2 py-1 text-xs font-mono hover:bg-offblack"
                  title="Subir"
                >
                  ↑
                </button>
              )}
              {idx < images.length - 1 && (
                <button
                  onClick={() => handleMoveDown(img, idx)}
                  className="bg-offblack/80 text-gold px-2 py-1 text-xs font-mono hover:bg-offblack"
                  title="Descer"
                >
                  ↓
                </button>
              )}
              <button
                onClick={() => handleDelete(img.id)}
                className="bg-red-900/60 text-red-300 px-2 py-1 text-xs font-mono hover:bg-red-900"
                title="Excluir"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
