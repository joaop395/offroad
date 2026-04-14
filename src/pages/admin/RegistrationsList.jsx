import { useState, useEffect } from 'react'

function formatDate(iso) {
  return new Date(iso).toLocaleString('pt-BR')
}

export default function RegistrationsList({ eventId, eventName, apiFetch, onBack }) {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch(`/api/events/${eventId}/registrations`)
      .then(r => r.json())
      .then(setRegistrations)
      .finally(() => setLoading(false))
  }, [eventId, apiFetch])

  function exportCsv() {
    const headers = ['Nome', 'Telefone', 'E-mail', 'Adultos', 'Crianças', 'Total Pago', 'Pago em', 'ID Pagamento MP']
    const rows = registrations.map(r => [
      r.responsibleName,
      r.responsiblePhone,
      r.email,
      r.adults,
      r.children,
      `R$ ${r.totalPaid.toFixed(2)}`,
      formatDate(r.paidAt),
      r.mpPaymentId,
    ])
    const csv = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `inscritos-${eventName.replace(/\s+/g, '-').toLowerCase()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const total = registrations.reduce((s, r) => s + r.adults + r.children, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={onBack} className="font-mono text-[11px] tracking-widest text-white/40 hover:text-white/70 uppercase transition-colors mb-1">
            ← Eventos
          </button>
          <h2 className="font-display text-gold tracking-widest text-2xl">{eventName}</h2>
          <p className="font-mono text-white/40 text-xs">{total} participante{total !== 1 ? 's' : ''} confirmado{total !== 1 ? 's' : ''}</p>
        </div>
        {registrations.length > 0 && (
          <button
            onClick={exportCsv}
            className="font-mono text-[11px] tracking-widest uppercase px-4 py-2 border border-gold/40 text-gold hover:bg-gold/10 transition-colors"
          >
            Exportar CSV
          </button>
        )}
      </div>

      {loading && <p className="font-mono text-white/40 text-sm">Carregando...</p>}

      {!loading && registrations.length === 0 && (
        <p className="font-mono text-white/40 text-sm">Nenhuma inscrição confirmada.</p>
      )}

      <div className="space-y-3">
        {registrations.map(r => (
          <div key={r.id} className="border border-white/10 bg-card p-4 relative">
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-gold/50" />
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
              <div className="flex-1">
                <p className="font-body text-white text-sm font-medium">{r.responsibleName}</p>
                <p className="font-mono text-white/40 text-xs">{r.email} · {r.responsiblePhone}</p>
              </div>
              <div className="flex gap-4 font-mono text-xs text-white/50">
                <span>{r.adults} adulto{r.adults !== 1 ? 's' : ''}</span>
                <span>{r.children} criança{r.children !== 1 ? 's' : ''}</span>
                <span className="text-gold">R$ {r.totalPaid.toFixed(2)}</span>
              </div>
              <div className="font-mono text-[10px] text-white/30">
                {formatDate(r.paidAt)}
              </div>
            </div>
            <p className="font-mono text-[10px] text-white/20 mt-1">MP: {r.mpPaymentId}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
