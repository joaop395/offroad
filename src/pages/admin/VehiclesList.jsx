import { useState, useEffect } from 'react'

import { API_PATHS } from '../../lib/api'

function formatDate(iso) {
  return new Date(iso).toLocaleString('pt-BR')
}

export default function VehiclesList({ eventId, eventName, apiFetch, onBack }) {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch(`${API_PATHS.ownEvents}/${eventId}/vehicles`)
      .then(r => r.json())
      .then(setVehicles)
      .finally(() => setLoading(false))
  }, [eventId, apiFetch])

  async function handleDelete(vehicleId) {
    if (!confirm('Tem certeza que deseja remover este veículo?')) return
    await apiFetch(`${API_PATHS.ownEvents}/${eventId}/vehicles/${vehicleId}`, { method: 'DELETE' })
    setVehicles(v => v.filter(veh => veh.id !== vehicleId))
  }

  function exportCsv() {
    const headers = ['Nome', 'CPF', 'Placa', 'Vagas Disponíveis', 'Cadastrado em']
    const rows = vehicles.map(v => [
      v.driverName,
      v.cpf,
      v.plate,
      v.availableSlots,
      formatDate(v.createdAt),
    ])
    const csv = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `veiculos-${eventName.replace(/\s+/g, '-').toLowerCase()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalSlots = vehicles.reduce((s, v) => s + v.availableSlots, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={onBack} className="font-mono text-[11px] tracking-widest text-white/40 hover:text-white/70 uppercase transition-colors mb-1">
            ← Eventos
          </button>
          <h2 className="font-display text-gold tracking-widest text-2xl">{eventName}</h2>
          <p className="font-mono text-white/40 text-xs">{vehicles.length} veículo{vehicles.length !== 1 ? 's' : ''} cadastrado{vehicles.length !== 1 ? 's' : ''} · {totalSlots} vaga{totalSlots !== 1 ? 's' : ''} disponível{totalSlots !== 1 ? 's' : ''}</p>
        </div>
        {vehicles.length > 0 && (
          <button
            onClick={exportCsv}
            className="font-mono text-[11px] tracking-widest uppercase px-4 py-2 border border-gold/40 text-gold hover:bg-gold/10 transition-colors"
          >
            Exportar CSV
          </button>
        )}
      </div>

      {loading && <p className="font-mono text-white/40 text-sm">Carregando...</p>}

      {!loading && vehicles.length === 0 && (
        <p className="font-mono text-white/40 text-sm">Nenhum veículo cadastrado ainda.</p>
      )}

      <div className="space-y-3">
        {vehicles.map(v => (
          <div key={v.id} className="border border-white/10 bg-card p-4 relative">
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-gold/50" />
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
              <div className="flex-1">
                <p className="font-body text-white text-sm font-medium">{v.driverName}</p>
                <p className="font-mono text-white/40 text-xs">CPF: {v.cpf} · Placa: {v.plate}</p>
              </div>
              <div className="flex gap-4 items-center font-mono text-xs">
                <span className="text-gold">{v.availableSlots} vaga{v.availableSlots !== 1 ? 's' : ''}</span>
                <span className="text-white/30">{formatDate(v.createdAt)}</span>
              </div>
              <button
                onClick={() => handleDelete(v.id)}
                className="font-mono text-[11px] tracking-widest uppercase px-4 py-2 border border-red-800/50 text-red-400 hover:bg-red-900/20 transition-colors"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
