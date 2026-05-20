import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useApi } from '../../hooks/useApi'
import { API_PATHS, resolveApiAssetUrl } from '../../lib/api'
import EventForm from './EventForm'
import PartnerEventForm from './PartnerEventForm'
import RegistrationsList from './RegistrationsList'
import AdminSettings from './AdminSettings'
import GalleryUpload from './GalleryUpload'
import SponsorUpload from './SponsorUpload'
import TipsForm from './TipsForm'

const CLASSIFICATION_LABELS = {
  LEVE_4X4:    { label: 'Leve 4x4',          color: '#27AE60' },
  LEVE_AT_4X4: { label: 'Leve · Pneu AT',    color: '#2ECC71' },
  MODERADA_AT: { label: 'Moderada · Pneu AT', color: '#D4682A' },
  MODERADA_MUD:{ label: 'Moderada · Pneu Mud',color: '#E67E22' },
  AVANCADA:    { label: 'Avançada · Lift',    color: '#C0392B' },
  REUNIAO:     { label: 'Reunião',            color: '#4C6A92' },
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function AdminDashboard() {
  const { logout } = useAuth()
  const { apiFetch } = useApi()
  const navigate = useNavigate()

  const [tab, setTab]           = useState('own-events') // 'own-events' | 'partner-events' | 'gallery' | 'settings'
  const [events, setEvents]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [viewingId, setViewingId] = useState(null)
  const [partnerEvents, setPartnerEvents] = useState([])
  const [partnerLoading, setPartnerLoading] = useState(true)
  const [partnerFormOpen, setPartnerFormOpen] = useState(false)
  const [editingPartner, setEditingPartner] = useState(null)
  const [galleryImages, setGalleryImages] = useState([])
  const [galleryLoading, setGalleryLoading] = useState(true)
  const [sponsors, setSponsors] = useState([])
  const [sponsorsLoading, setSponsorsLoading] = useState(true)
  const [tips, setTips] = useState([])
  const [tipsLoading, setTipsLoading] = useState(true)
  const [tipFormOpen, setTipFormOpen] = useState(false)
  const [editingTip, setEditingTip] = useState(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiFetch(API_PATHS.ownEvents)
      const data = await res.json()
      setEvents(data)
    } finally {
      setLoading(false)
    }
  }, [apiFetch])

  const fetchPartnerEvents = useCallback(async () => {
    setPartnerLoading(true)
    try {
      const res = await apiFetch(API_PATHS.partnerEvents)
      const data = await res.json()
      setPartnerEvents(data)
    } finally {
      setPartnerLoading(false)
    }
  }, [apiFetch])

  const fetchGallery = useCallback(async () => {
    setGalleryLoading(true)
    try {
      const res = await apiFetch(API_PATHS.gallery)
      const data = await res.json()
      setGalleryImages(data)
    } finally {
      setGalleryLoading(false)
    }
  }, [apiFetch])

  const fetchSponsors = useCallback(async () => {
    setSponsorsLoading(true)
    try {
      const res = await apiFetch(API_PATHS.sponsors)
      const data = await res.json()
      setSponsors(data)
    } finally {
      setSponsorsLoading(false)
    }
  }, [apiFetch])

  const fetchTips = useCallback(async () => {
    setTipsLoading(true)
    try {
      const res = await apiFetch(`${API_PATHS.tips}/all`)
      const data = await res.json()
      setTips(data)
    } finally {
      setTipsLoading(false)
    }
  }, [apiFetch])

  useEffect(() => { fetchEvents() }, [fetchEvents])
  useEffect(() => { fetchPartnerEvents() }, [fetchPartnerEvents])
  useEffect(() => { fetchGallery() }, [fetchGallery])
  useEffect(() => { fetchSponsors() }, [fetchSponsors])
  useEffect(() => { fetchTips() }, [fetchTips])

  async function handleDelete(id) {
    if (!confirm('Tem certeza que deseja excluir este evento? As inscrições também serão removidas.')) return
    await apiFetch(`${API_PATHS.ownEvents}/${id}`, { method: 'DELETE' })
    fetchEvents()
  }

  async function handleLogout() {
    await logout()
    navigate('/offroad-admin', { replace: true })
  }

  async function handleDeletePartner(id) {
    if (!confirm('Tem certeza que deseja excluir este evento parceiro?')) return
    await apiFetch(`${API_PATHS.partnerEvents}/${id}`, { method: 'DELETE' })
    fetchPartnerEvents()
  }

  async function handleDeleteTip(id) {
    if (!confirm('Tem certeza que deseja excluir esta dica?')) return
    await apiFetch(`${API_PATHS.tips}/${id}`, { method: 'DELETE' })
    fetchTips()
  }

  return (
    <div className="min-h-screen bg-offblack text-white">
      <div className="fixed inset-0 pointer-events-none grain" />

      {/* Header */}
      <header className="relative z-10 border-b border-gold/20 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="font-mono text-gold/40 text-[10px] tracking-[0.4em] uppercase">painel admin</p>
          <h1 className="font-display text-gold tracking-widest text-xl">Off-Road Sem Juízo</h1>
        </div>
        <button
          onClick={handleLogout}
          className="font-mono text-[11px] tracking-widest text-white/40 hover:text-white/70 uppercase transition-colors"
        >
          Sair
        </button>
      </header>

      {/* Tabs */}
      <nav className="relative z-10 border-b border-white/10 px-6 flex gap-6 overflow-x-auto">
        {[['own-events', 'Eventos próprios'], ['partner-events', 'Eventos parceiros'], ['gallery', 'Galeria'], ['sponsors', 'Patrocinadores'], ['tips', 'Dicas'], ['settings', 'Configurações']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`font-mono text-[11px] tracking-widest uppercase py-3 border-b-2 transition-colors ${
              tab === key
                ? 'border-gold text-gold'
                : 'border-transparent text-white/40 hover:text-white/60'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        {tab === 'tips' && (
          <>
            {tipFormOpen && (
              <TipsForm
                initial={editingTip}
                apiFetch={apiFetch}
                onSave={() => { setTipFormOpen(false); setEditingTip(null); fetchTips() }}
                onCancel={() => { setTipFormOpen(false); setEditingTip(null) }}
              />
            )}

            {!tipFormOpen && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-gold tracking-widest text-2xl">Dicas</h2>
                  <button
                    onClick={() => { setEditingTip(null); setTipFormOpen(true) }}
                    className="bg-gold text-offblack font-display tracking-[0.16em] uppercase text-sm px-5 py-2.5 hover:bg-gold-dark transition-colors"
                  >
                    + Nova Dica
                  </button>
                </div>

                {tipsLoading && <p className="font-mono text-white/40 text-sm">Carregando...</p>}

                {!tipsLoading && tips.length === 0 && (
                  <p className="font-mono text-white/40 text-sm">Nenhuma dica cadastrada.</p>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {tips.map((tip, idx) => (
                    <div
                      key={tip.id}
                      className="border border-white/10 bg-card overflow-hidden group relative"
                    >
                      <div className="aspect-video bg-offblack relative">
                        {tip.imageUrl ? (
                          <img src={resolveApiAssetUrl(tip.imageUrl)} alt={tip.title} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-white/20">
                            <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          </div>
                        )}
                        {!tip.published && (
                          <span className="absolute top-2 left-2 bg-red-900/80 text-red-300 font-mono text-[9px] uppercase tracking-[0.2em] px-2 py-0.5">Rascunho</span>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-display text-[15px] tracking-[0.06em] text-gold line-clamp-2">{tip.title}</h3>
                        {tip.description && (
                          <p className="font-mono text-[10px] text-white/40 mt-1 line-clamp-2">{tip.description}</p>
                        )}
                        <p className="font-mono text-[9px] text-white/20 mt-1 truncate">{tip.youtubeUrl}</p>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {idx > 0 && (
                          <button
                            onClick={async () => {
                              const prev = tips[idx - 1]
                              await Promise.all([
                                apiFetch(`${API_PATHS.tips}/${tip.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ title: tip.title, youtubeUrl: tip.youtubeUrl, description: tip.description, published: tip.published, order: prev.order, removeImage: 'false' }),
                                }),
                                apiFetch(`${API_PATHS.tips}/${prev.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ title: prev.title, youtubeUrl: prev.youtubeUrl, description: prev.description, published: prev.published, order: tip.order, removeImage: 'false' }),
                                }),
                              ])
                              fetchTips()
                            }}
                            className="bg-offblack/80 text-gold px-2 py-1 text-xs font-mono hover:bg-offblack"
                            title="Subir"
                          >↑</button>
                        )}
                        {idx < tips.length - 1 && (
                          <button
                            onClick={async () => {
                              const next = tips[idx + 1]
                              await Promise.all([
                                apiFetch(`${API_PATHS.tips}/${tip.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ title: tip.title, youtubeUrl: tip.youtubeUrl, description: tip.description, published: tip.published, order: next.order, removeImage: 'false' }),
                                }),
                                apiFetch(`${API_PATHS.tips}/${next.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ title: next.title, youtubeUrl: next.youtubeUrl, description: next.description, published: next.published, order: tip.order, removeImage: 'false' }),
                                }),
                              ])
                              fetchTips()
                            }}
                            className="bg-offblack/80 text-gold px-2 py-1 text-xs font-mono hover:bg-offblack"
                            title="Descer"
                          >↓</button>
                        )}
                        <button
                          onClick={() => { setEditingTip(tip); setTipFormOpen(true) }}
                          className="bg-offblack/80 text-gold px-2 py-1 text-xs font-mono hover:bg-offblack"
                          title="Editar"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleDeleteTip(tip.id)}
                          className="bg-red-900/60 text-red-300 px-2 py-1 text-xs font-mono hover:bg-red-900"
                          title="Excluir"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {tab === 'settings' && <AdminSettings apiFetch={apiFetch} />}

        {tab === 'gallery' && (
          <GalleryUpload
            images={galleryImages}
            apiFetch={apiFetch}
            onRefresh={fetchGallery}
          />
        )}

        {tab === 'sponsors' && (
          <SponsorUpload
            sponsors={sponsors}
            apiFetch={apiFetch}
            onRefresh={fetchSponsors}
          />
        )}

        {tab === 'own-events' && (
          <>
            {/* Tela de inscritos */}
            {viewingId && (
              <RegistrationsList
                eventId={viewingId}
                eventName={events.find(e => e.id === viewingId)?.name ?? ''}
                apiFetch={apiFetch}
                onBack={() => setViewingId(null)}
              />
            )}

            {/* Formulário */}
            {!viewingId && formOpen && (
              <EventForm
                initial={editing}
                apiFetch={apiFetch}
                onSave={() => { setFormOpen(false); setEditing(null); fetchEvents() }}
                onCancel={() => { setFormOpen(false); setEditing(null) }}
              />
            )}

            {/* Lista de eventos */}
            {!viewingId && !formOpen && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-gold tracking-widest text-2xl">Eventos</h2>
                  <button
                    onClick={() => { setEditing(null); setFormOpen(true) }}
                    className="bg-gold text-offblack font-display tracking-[0.16em] uppercase text-sm px-5 py-2.5 hover:bg-gold-dark transition-colors"
                  >
                    + Novo Evento
                  </button>
                </div>

                {loading && (
                  <p className="font-mono text-white/40 text-sm">Carregando...</p>
                )}

                {!loading && events.length === 0 && (
                  <p className="font-mono text-white/40 text-sm">Nenhum evento cadastrado.</p>
                )}

                <div className="space-y-3">
                  {events.map(ev => {
                    const classification = CLASSIFICATION_LABELS[ev.classification] ?? CLASSIFICATION_LABELS.LEVE_4X4
                    const available = ev.maxSlots - ev.slotsUsed
                    return (
                      <div
                        key={ev.id}
                        className="border border-gold/30 bg-card p-5 flex flex-col md:flex-row md:items-center gap-4 relative"
                      >
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-gold" />

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span
                              className="font-mono text-[10px] tracking-[0.2em] uppercase px-2 py-0.5"
                              style={{ backgroundColor: classification.color, color: '#fff' }}
                            >
                              {classification.label}
                            </span>
                            {ev.accountabilityImageUrl && (
                              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold/68">
                                Com prestação
                              </span>
                            )}
                          </div>
                          <h3 className="font-display text-gold text-xl tracking-wide">{ev.name}</h3>
                          <p className="font-mono text-white/50 text-xs mt-1">
                            {formatDate(ev.date)} · {ev.location}
                          </p>
                          <p className="font-mono text-white/40 text-xs mt-1">
                            Adulto: R$ {ev.priceAdult.toFixed(2)} · Criança: R$ {ev.priceChild.toFixed(2)} · Vagas: {available}/{ev.maxSlots}
                          </p>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => setViewingId(ev.id)}
                            className="font-mono text-[11px] tracking-widest uppercase px-4 py-2 border border-white/20 text-white/60 hover:border-gold/50 hover:text-gold transition-colors"
                          >
                            Inscritos ({ev.slotsUsed})
                          </button>
                          <button
                            onClick={() => { setEditing(ev); setFormOpen(true) }}
                            className="font-mono text-[11px] tracking-widest uppercase px-4 py-2 border border-gold/40 text-gold hover:bg-gold/10 transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(ev.id)}
                            className="font-mono text-[11px] tracking-widest uppercase px-4 py-2 border border-red-800/50 text-red-400 hover:bg-red-900/20 transition-colors"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}

        {tab === 'partner-events' && (
          <>
            {partnerFormOpen && (
              <PartnerEventForm
                initial={editingPartner}
                apiFetch={apiFetch}
                onSave={() => {
                  setPartnerFormOpen(false)
                  setEditingPartner(null)
                  fetchPartnerEvents()
                }}
                onCancel={() => {
                  setPartnerFormOpen(false)
                  setEditingPartner(null)
                }}
              />
            )}

            {!partnerFormOpen && (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-display text-2xl tracking-widest text-gold">Eventos Parceiros</h2>
                  <button
                    onClick={() => { setEditingPartner(null); setPartnerFormOpen(true) }}
                    className="bg-gold px-5 py-2.5 font-display text-sm uppercase tracking-[0.16em] text-offblack transition-colors hover:bg-gold-dark"
                  >
                    + Novo Parceiro
                  </button>
                </div>

                {partnerLoading && (
                  <p className="font-mono text-sm text-white/40">Carregando...</p>
                )}

                {!partnerLoading && partnerEvents.length === 0 && (
                  <p className="font-mono text-sm text-white/40">Nenhum evento parceiro cadastrado.</p>
                )}

                <div className="space-y-3">
                  {partnerEvents.map((event) => (
                    <div
                      key={event.id}
                      className="relative flex flex-col gap-4 border border-white/12 bg-card p-5 md:flex-row md:items-center"
                    >
                      <div className="absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-gold" />

                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <span className="bg-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/76">
                            Parceiro
                          </span>
                          {event.bannerUrl && (
                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold/68">
                              Com banner
                            </span>
                          )}
                        </div>
                        <h3 className="font-display text-xl tracking-wide text-gold">{event.name}</h3>
                        <p className="mt-1 font-mono text-xs text-white/50">
                          {formatDate(event.date)}{event.location ? ` · ${event.location}` : ''}
                        </p>
                        <p className="mt-2 line-clamp-2 font-body text-sm leading-relaxed text-white/52">
                          {event.description}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditingPartner(event); setPartnerFormOpen(true) }}
                          className="border border-gold/40 px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-gold transition-colors hover:bg-gold/10"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeletePartner(event.id)}
                          className="border border-red-800/50 px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-red-400 transition-colors hover:bg-red-900/20"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
