import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

const GOLD = '#F4C430'

export default function Login() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent | error | rate-limited
  const [errorMsg, setErrorMsg] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (status === 'sending') return
    setStatus('sending')
    setErrorMsg('')

    try {
      const res = await fetch('/api/send-login-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()

      if (res.status === 429) {
        setStatus('rate-limited')
        setErrorMsg(data.message || 'Aguarde alguns segundos antes de tentar de novo.')
        return
      }

      if (!res.ok) {
        setStatus('error')
        setErrorMsg(data.message || 'Algo deu errado. Tenta de novo daqui a pouco.')
        return
      }

      // Por segurança, sempre mostramos sucesso (não revelamos se email existe)
      setStatus('sent')
    } catch {
      setStatus('error')
      setErrorMsg('Erro de rede. Tenta de novo.')
    }
  }

  function tryAgain() {
    setStatus('idle')
    setErrorMsg('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#000' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg" style={{ background: GOLD, color: '#000' }}>L</div>
          <span className="font-black text-xl text-white">Life OS</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="p-6 rounded-2xl"
          style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)' }}>

          <AnimatePresence mode="wait">

            {/* Tela 1 — formulário */}
            {(status === 'idle' || status === 'sending' || status === 'rate-limited') && (
              <motion.div
                key="form"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}>
                <h1 className="text-white font-black text-lg text-center mb-1">Acessar minha conta</h1>
                <p className="text-gray-500 text-xs text-center mb-6">
                  Vamos enviar um link mágico pro seu email. Sem senha, sem complicação.
                </p>

                <form onSubmit={submit} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Seu e-mail de cadastro"
                    autoComplete="email"
                    required
                    className="w-full bg-transparent border rounded-xl px-4 py-3 text-sm outline-none text-white transition focus:border-yellow-400"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                  />

                  {status === 'rate-limited' && errorMsg && (
                    <div className="text-xs px-3 py-2 rounded-lg flex items-start gap-2"
                      style={{ background: 'rgba(244,196,48,0.08)', color: '#fbbf24', border: '1px solid rgba(244,196,48,0.3)' }}>
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending' || !email}
                    className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
                    style={{ background: GOLD, color: '#000' }}>
                    {status === 'sending' ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                    ) : (
                      <><Mail className="w-4 h-4" /> Receber link de acesso</>
                    )}
                  </button>
                </form>

                <p className="text-center mt-4 text-xs text-gray-600 leading-relaxed">
                  Comprou e perdeu o email?<br/>
                  <a href="mailto:contato@agenciacriativa.shop" style={{ color: GOLD }}>
                    contato@agenciacriativa.shop
                  </a>
                </p>
              </motion.div>
            )}

            {/* Tela 2 — sucesso */}
            {status === 'sent' && (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center py-4">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(34,197,94,0.15)' }}>
                  <CheckCircle2 className="w-7 h-7" style={{ color: '#22c55e' }} />
                </div>
                <h2 className="text-white font-black text-lg mb-2">Cheque seu email</h2>
                <p className="text-sm mb-1" style={{ color: '#aaa' }}>
                  Se o email <strong>{email}</strong> tiver conta na nossa plataforma, o link de acesso vai chegar em <strong>até 2 minutos</strong>.
                </p>
                <p className="text-xs mt-4 mb-6" style={{ color: '#666' }}>
                  Vem do remetente <strong style={{ color: '#888' }}>noreply@agenciacriativa.shop</strong>. Se não chegar, verifica spam e Promoções (Gmail).
                </p>
                <button
                  onClick={tryAgain}
                  className="text-xs underline transition"
                  style={{ color: GOLD }}>
                  Não chegou? Pedir de novo
                </button>
              </motion.div>
            )}

            {/* Tela 3 — erro */}
            {status === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center py-4">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(239,68,68,0.15)' }}>
                  <AlertCircle className="w-7 h-7" style={{ color: '#ef4444' }} />
                </div>
                <h2 className="text-white font-black text-lg mb-2">Algo deu errado</h2>
                <p className="text-sm mb-6" style={{ color: '#aaa' }}>
                  {errorMsg || 'Não conseguimos processar seu pedido agora.'}
                </p>
                <button
                  onClick={tryAgain}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm transition active:scale-95"
                  style={{ background: GOLD, color: '#000' }}>
                  Tentar de novo
                </button>
              </motion.div>
            )}

          </AnimatePresence>

        </motion.div>

        <p className="text-center mt-4 text-xs">
          <Link to="/catalogo" style={{ color: '#666' }}>← Ver nossos produtos</Link>
        </p>
      </div>
    </div>
  )
}
