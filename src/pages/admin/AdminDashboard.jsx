import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useApi } from '../../hooks/useApi'
import EventForm from './EventForm'
import RegistrationsList from './RegistrationsList'
import AdminSettings from './AdminSettings'

const DIFF_LABELS = {
  LEVE_4X4:    { label: 'Leve 4x4',          color: '#27AE60' },
  LEVE_AT_4X4: { label: 'Leve · Pneu AT',    color: '#2ECC71' },
  MODERADA_AT: { label: 'Moderada · Pneu AT', color: '#D4682A' },
  MODERADA_MUD:{ label: 'Moderada · Pneu Mud',color: '#E67E22' },
  AVANCADA:    { label: 'Avançada · Lift',    color: '#C0392B' },
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

  const [tab, setTab]           = useState('events') // 'events' | 'settings'
  const [events, setEvents]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [viewingId, setViewingId] = useState(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiFetch('/api/events')
      const data = await res.json()
      setEvents(data)
    } finally {
      setLoading(false)
    }
  }, [apiFetch])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  async function handleDelete(id) {
    if (!confirm('Tem certeza que deseja excluir este evento? As inscrições também serão removidas.')) return
    await apiFetch(`/api/events/${id}`, { method: 'DELETE' })
    fetchEvents()
  }

  async function handleLogout() {
    await logout()
    navigate('/offroad-admin', { replace: true })
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
      <nav className="relative z-10 border-b border-white/10 px-6 flex gap-6">
        {[['events', 'Eventos'], ['settings', 'Configurações']].map(([key, label]) => (
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
        {tab === 'settings' && <AdminSettings apiFetch={apiFetch} />}

        {tab === 'events' && (
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
                    const diff = DIFF_LABELS[ev.difficulty]
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
                              style={{ backgroundColor: diff.color, color: '#fff' }}
                            >
                              {diff.label}
                            </span>
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
      </main>
    </div>
  )
}
