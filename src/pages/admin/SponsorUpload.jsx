import { useState, useRef } from 'react'
import { resolveApiAssetUrl } from '../../lib/api'

export default function SponsorUpload({ sponsors, apiFetch, onRefresh }) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)
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
    if (!file || !name.trim()) return
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      fd.append('name', name.trim())
      fd.append('url', url.trim())
      fd.append('order', String(sponsors.length))

      await apiFetch('/api/sponsors', { method: 'POST', body: fd })
      setName('')
      setUrl('')
      handleCancelFile()
      onRefresh()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Remover este patrocinador?')) return
    await apiFetch(`/api/sponsors/${id}`, { method: 'DELETE' })
    onRefresh()
  }

  async function handleMoveUp(s, idx) {
    if (idx === 0) return
    const prev = sponsors[idx - 1]
    await Promise.all([
      apiFetch(`/api/sponsors/${s.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: s.name, url: s.url, order: prev.order }),
      }),
      apiFetch(`/api/sponsors/${prev.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: prev.name, url: prev.url, order: s.order }),
      }),
    ])
    onRefresh()
  }

  async function handleMoveDown(s, idx) {
    if (idx === sponsors.length - 1) return
    const next = sponsors[idx + 1]
    await Promise.all([
      apiFetch(`/api/sponsors/${s.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: s.name, url: s.url, order: next.order }),
      }),
      apiFetch(`/api/sponsors/${next.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: next.name, url: next.url, order: s.order }),
      }),
    ])
    onRefresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-gold tracking-widest text-2xl">Patrocinadores</h2>
      </div>

      <form onSubmit={handleUpload} className="border border-gold/20 bg-card p-5 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40 block mb-1">Nome</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Borracharia do Zé"
              className="w-full bg-offblack border border-white/20 px-3 py-2 text-white font-body text-sm focus:border-gold outline-none"
              required
            />
          </div>
          <div>
            <label className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40 block mb-1">Link (opcional)</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://instagram.com/..."
              className="w-full bg-offblack border border-white/20 px-3 py-2 text-white font-body text-sm focus:border-gold outline-none"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40 block mb-1">Logo</label>
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
            disabled={saving || !file || !name.trim()}
            className="bg-gold text-offblack font-display tracking-[0.16em] uppercase text-sm px-5 py-2.5 hover:bg-gold-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvando…' : '+ Adicionar'}
          </button>
        </div>
        {preview && (
          <div className="mt-4">
            <img src={preview} alt="preview" className="h-16 object-contain border border-white/10" />
          </div>
        )}
      </form>

      {sponsors.length === 0 && (
        <p className="font-mono text-white/40 text-sm">Nenhum patrocinador cadastrado.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {sponsors.map((s, idx) => (
          <div key={s.id} className="border border-white/10 bg-card overflow-hidden group relative">
            <div className="h-24 flex items-center justify-center p-4">
              <img
                src={resolveApiAssetUrl(`/uploads/sponsors/${s.filename}`)}
                alt={s.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="p-3 border-t border-white/10">
              <p className="font-mono text-[10px] text-white/60 truncate">{s.name}</p>
              {s.url && (
                <p className="font-mono text-[8px] text-gold/50 truncate mt-0.5">{s.url}</p>
              )}
            </div>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {idx > 0 && (
                <button onClick={() => handleMoveUp(s, idx)} className="bg-offblack/80 text-gold px-2 py-1 text-xs font-mono hover:bg-offblack" title="Subir">↑</button>
              )}
              {idx < sponsors.length - 1 && (
                <button onClick={() => handleMoveDown(s, idx)} className="bg-offblack/80 text-gold px-2 py-1 text-xs font-mono hover:bg-offblack" title="Descer">↓</button>
              )}
              <button onClick={() => handleDelete(s.id)} className="bg-red-900/60 text-red-300 px-2 py-1 text-xs font-mono hover:bg-red-900" title="Excluir">×</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
