import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export default function SuccessPage() {
  const [params] = useSearchParams()
  const [whatsapp, setWhatsapp] = useState('')

  // Parâmetros que o Mercado Pago devolve na URL de sucesso
  const paymentId       = params.get('payment_id') ?? ''
  const status          = params.get('status') ?? ''
  const path = typeof window !== 'undefined' ? window.location.pathname : '/inscricao/sucesso'

  const ui = useMemo(() => {
    if (path.endsWith('/erro')) {
      return {
        eyebrow: '— pagamento não concluído —',
        title: 'Pagamento não confirmado',
        description: 'O pagamento não foi aprovado. Você pode voltar ao site e tentar novamente.',
        showWhatsapp: false,
        accentClass: 'text-red-400',
      }
    }

    if (path.endsWith('/pendente') || status === 'pending') {
      return {
        eyebrow: '— pagamento pendente —',
        title: 'Pagamento pendente',
        description: 'Recebemos sua tentativa de inscrição. Assim que o pagamento for compensado, ela será confirmada.',
        showWhatsapp: false,
        accentClass: 'text-gold',
      }
    }

    return {
      eyebrow: '— pagamento confirmado —',
      title: 'Inscrição confirmada!',
      description: 'Seu pagamento foi aprovado. Clique abaixo para confirmar sua inscrição via WhatsApp com o organizador.',
      showWhatsapp: true,
      accentClass: 'text-gold',
    }
  }, [path, status])

  useEffect(() => {
    // Busca número do WhatsApp do admin nas configurações públicas
    fetch(`${API}/api/settings/public`)
      .then(r => r.json())
      .then(d => setWhatsapp(d.whatsappNumber ?? ''))
      .catch(() => {})
  }, [])

  function buildWhatsappMessage() {
    const lines = [
      `Olá! Confirmo minha inscrição no Off-Road Sem Juízo.`,
      `ID do pagamento: ${paymentId}`,
    ]
    return encodeURIComponent(lines.join('\n'))
  }

  const whatsappUrl = ui.showWhatsapp && whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${buildWhatsappMessage()}`
    : null

  return (
    <div className="min-h-screen bg-offblack flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none grain" />

      <motion.div
        className="w-full max-w-md text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gold/10 blur-xl" />
            <img src="/logo.png" alt="Off-Road Sem Juízo" className="w-24 h-24 object-contain relative" />
          </div>
        </div>

        {/* Card */}
        <div className="border border-gold/30 bg-card p-8 relative">
          <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-gold" />
          <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-gold" />

          {/* Check icon */}
          <div className="w-14 h-14 rounded-full border-2 border-gold/60 flex items-center justify-center mx-auto mb-5">
            <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <p className="font-mono text-gold/50 text-[10px] tracking-[0.4em] uppercase mb-2">{ui.eyebrow}</p>
          <h1 className={`font-display tracking-widest ${ui.accentClass}`} style={{ fontSize: 'clamp(28px, 5vw, 38px)' }}>
            {ui.title}
          </h1>
          <p className="font-body text-white/60 text-sm mt-3 leading-relaxed">
            {ui.description}
          </p>

          {paymentId && (
            <p className="font-mono text-[10px] text-white/25 mt-3">
              ID: {paymentId}
            </p>
          )}

          {/* WhatsApp CTA */}
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-display tracking-[0.14em] uppercase text-sm py-3 hover:opacity-90 transition-opacity"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.855L.057 23.15a.75.75 0 0 0 .916.928l5.422-1.52A11.947 11.947 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.96 0-3.791-.518-5.373-1.422l-.387-.225-3.982 1.116 1.07-3.875-.247-.4A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              Confirmar pelo WhatsApp
            </a>
          ) : (
            <p className="mt-6 font-mono text-white/30 text-xs">
              Entre em contato com o organizador para confirmar.
            </p>
          )}

          <Link
            to="/"
            className="mt-4 block font-mono text-[11px] tracking-widest text-white/30 hover:text-white/50 uppercase transition-colors"
          >
            ← Voltar ao site
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
