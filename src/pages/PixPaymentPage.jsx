// =============================================================================
// PIX PAYMENT PAGE — Pix embedado, polling de status, auto-redirect
// =============================================================================
// Substitui o redirect pro Mercado Pago. UX:
// 1. CheckoutPage chama /api/create-mp-pix → recebe paymentId + qrCode
// 2. Navega pra cá passando { paymentId, qrCode, qrCodeBase64, amount, slugs } via state
// 3. Mostra QR + código copiável + spinner "aguardando pagamento"
// 4. Polling /api/mp-payment-status?id=X a cada 4s
// 5. Quando status === 'approved' → redirect /obrigado?slugs=X&via=mp&pid=Y
// =============================================================================

import { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Copy, Check, Clock, Loader2, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react'

const POLL_INTERVAL = 4000  // 4s
const POLL_MAX_TIME = 60 * 60 * 1000  // 1h (Pix expira)

export default function PixPaymentPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const data = location.state || {}

  const [status, setStatus]     = useState('pending')
  const [copied, setCopied]     = useState(false)
  const [timeLeft, setTimeLeft] = useState(60 * 60)  // 60min em segundos
  const [pollError, setPollError] = useState(null)
  const startRef = useRef(Date.now())

  // Se faltar dados (acessou direto sem vir do checkout), volta
  useEffect(() => {
    if (!data.paymentId || !data.qrCode) {
      navigate('/', { replace: true })
    }
  }, [data, navigate])

  // Polling de status do pagamento
  useEffect(() => {
    if (!data.paymentId || status === 'approved') return

    let timeoutId
    const poll = async () => {
      // Para de pollar se passou muito tempo
      if (Date.now() - startRef.current > POLL_MAX_TIME) return

      try {
        const r = await fetch(`/api/mp-payment-status?id=${data.paymentId}`)
        const j = await r.json()

        if (j.paid || j.status === 'approved') {
          setStatus('approved')
          // Pequena pausa pra usuário ver o "aprovado" antes do redirect
          setTimeout(() => {
            const slugs = (data.slugs || []).join(',')
            navigate(`/obrigado?slugs=${encodeURIComponent(slugs)}&via=mp&pid=${data.paymentId}`)
          }, 1500)
          return
        }

        if (j.status === 'cancelled' || j.status === 'rejected') {
          setStatus(j.status)
          return
        }

        timeoutId = setTimeout(poll, POLL_INTERVAL)
      } catch (e) {
        setPollError(e.message)
        timeoutId = setTimeout(poll, POLL_INTERVAL * 2)  // backoff
      }
    }

    timeoutId = setTimeout(poll, POLL_INTERVAL)
    return () => clearTimeout(timeoutId)
  }, [data, status, navigate])

  // Countdown timer
  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const handleCopy = () => {
    if (!data.qrCode) return
    navigator.clipboard.writeText(data.qrCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  if (!data.paymentId || !data.qrCode) {
    return null
  }

  // Tela de aprovado
  if (status === 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#000', color: '#fff' }}>
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.15)' }}>
            <CheckCircle2 className="w-12 h-12" style={{ color: '#22c55e' }} />
          </div>
          <h1 className="text-3xl font-black mb-3">Pagamento aprovado!</h1>
          <p className="text-gray-400 mb-6">Estamos preparando seu acesso...</p>
          <Loader2 className="w-6 h-6 mx-auto animate-spin" style={{ color: '#F4C430' }} />
        </div>
      </div>
    )
  }

  // Tela de rejeitado/cancelado
  if (status === 'rejected' || status === 'cancelled') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#000', color: '#fff' }}>
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-black mb-3">Pagamento {status === 'cancelled' ? 'expirou' : 'recusado'}</h1>
          <p className="text-gray-400 mb-6">
            {status === 'cancelled'
              ? 'O Pix expirou. Você pode tentar de novo a qualquer momento.'
              : 'Algo deu errado com o pagamento. Tenta de novo ou usa cartão.'}
          </p>
          <button onClick={() => window.history.back()}
            className="px-6 py-3 rounded-xl font-bold" style={{ background: '#F4C430', color: '#000' }}>
            Tentar de novo
          </button>
        </div>
      </div>
    )
  }

  // Tela principal: aguardando pagamento
  return (
    <div className="min-h-screen px-4 py-8" style={{ background: '#000', color: '#fff' }}>
      <div className="max-w-md mx-auto">

        {/* Header */}
        <button onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sm mb-6" style={{ color: '#888' }}>
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <h1 className="text-2xl font-black mb-2">Pague com Pix</h1>
        <p className="text-sm mb-6" style={{ color: '#aaa' }}>
          Acesso liberado automaticamente após o pagamento
        </p>

        {/* Card principal */}
        <div className="rounded-3xl p-6 mb-4" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)' }}>

          {/* Valor */}
          <div className="text-center mb-5">
            <p className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: '#888' }}>Valor</p>
            <p className="text-4xl font-black" style={{ color: '#F4C430' }}>
              R$ {Number(data.amount || 0).toFixed(2).replace('.', ',')}
            </p>
          </div>

          {/* QR Code */}
          {data.qrCodeBase64 && (
            <div className="bg-white p-4 rounded-2xl mb-5 flex justify-center">
              <img
                src={`data:image/png;base64,${data.qrCodeBase64}`}
                alt="QR Code Pix"
                className="w-56 h-56 block"
              />
            </div>
          )}

          {/* Código copia-e-cola */}
          <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: '#888' }}>
            Pix copia-e-cola
          </p>
          <div className="rounded-xl p-3 mb-3 break-all text-xs leading-relaxed font-mono"
            style={{ background: '#000', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa' }}>
            {data.qrCode}
          </div>
          <button onClick={handleCopy}
            className="w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition"
            style={{ background: copied ? '#22c55e' : '#F4C430', color: '#000' }}>
            {copied ? (
              <>
                <Check className="w-4 h-4" /> Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copiar código Pix
              </>
            )}
          </button>
        </div>

        {/* Status: aguardando */}
        <div className="rounded-2xl p-4 mb-4 flex items-center gap-3"
          style={{ background: 'rgba(244,196,48,0.05)', border: '1px solid rgba(244,196,48,0.25)' }}>
          <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" style={{ color: '#F4C430' }} />
          <div className="flex-1">
            <p className="text-sm font-bold">Aguardando pagamento...</p>
            <p className="text-xs" style={{ color: '#888' }}>
              Esta página atualiza automaticamente após você pagar.
            </p>
          </div>
        </div>

        {/* Instruções */}
        <div className="rounded-2xl p-4 mb-4" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs uppercase tracking-widest font-bold mb-3" style={{ color: '#aaa' }}>
            Como pagar em 30 segundos
          </p>
          <ol className="text-sm space-y-2 leading-relaxed" style={{ color: '#ccc' }}>
            <li><strong className="text-white">1.</strong> Abre o app do seu banco</li>
            <li><strong className="text-white">2.</strong> Vai em Pix → Pagar com QR Code OU Pix Copia-e-Cola</li>
            <li><strong className="text-white">3.</strong> Escaneia o QR ou cola o código aí em cima</li>
            <li><strong className="text-white">4.</strong> Confirma o pagamento</li>
            <li><strong className="text-white">5.</strong> Pronto! Seu acesso é liberado em segundos.</li>
          </ol>
        </div>

        {/* Timer */}
        <div className="text-center text-xs mb-6" style={{ color: '#666' }}>
          <Clock className="w-3 h-3 inline mr-1" />
          QR Code válido por <strong style={{ color: '#aaa' }}>{formatTime(timeLeft)}</strong>
        </div>

        {/* Trust */}
        <div className="flex items-center justify-center gap-2 text-xs" style={{ color: '#666' }}>
          <ShieldCheck className="w-4 h-4" />
          Pagamento processado com segurança via Mercado Pago
        </div>

        {/* Fallback link */}
        {data.ticketUrl && (
          <p className="text-center mt-6 text-xs">
            <a href={data.ticketUrl} target="_blank" rel="noopener noreferrer"
              style={{ color: '#666', textDecoration: 'underline' }}>
              Problemas? Abrir no Mercado Pago
            </a>
          </p>
        )}

        {pollError && (
          <p className="text-center mt-4 text-xs" style={{ color: '#ef4444' }}>
            Erro de conexão. Tentando reconectar...
          </p>
        )}
      </div>
    </div>
  )
}
