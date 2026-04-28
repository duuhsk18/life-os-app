import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, CheckCircle2, Loader2 } from 'lucide-react'

const GOLD = '#F4C430'
const STORAGE_KEY = 'leadmagnet-shown'
const STORAGE_DISMISSED = 'leadmagnet-dismissed'

/**
 * Popup do lead magnet "5 Hábitos que Mudam Tudo".
 * Triggers (qualquer um):
 *   1. Exit intent (mouse sai pelo topo) — desktop
 *   2. Scroll > 50% do documento — desktop e mobile
 *   3. Após 30s na página — fallback
 *
 * Lógica de cookie:
 *   - Não mostra se já foi mostrado e dismissed nas últimas 7 dias
 *   - Não mostra se já capturado (success state)
 */

function shouldShow() {
  try {
    const dismissed = localStorage.getItem(STORAGE_DISMISSED)
    if (dismissed) {
      const t = parseInt(dismissed, 10)
      if (Date.now() - t < 7 * 86400000) return false // 7 dias
    }
    const captured = localStorage.getItem(STORAGE_KEY)
    if (captured === 'captured') return false
    return true
  } catch {
    return true
  }
}

export default function LeadMagnetPopup() {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [hp, setHp] = useState('') // honeypot
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!shouldShow()) return

    let triggered = false
    const fire = (reason) => {
      if (triggered) return
      triggered = true
      setVisible(true)
      console.log('[lead-magnet] trigger:', reason)
    }

    // Exit intent (desktop)
    const onMouseLeave = (e) => { if (e.clientY <= 0) fire('exit-intent') }
    document.addEventListener('mouseleave', onMouseLeave)

    // Scroll > 50%
    const onScroll = () => {
      const scrolled = (window.scrollY + window.innerHeight) / document.body.scrollHeight
      if (scrolled > 0.5) fire('scroll-50')
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // Tempo (30s)
    const tid = setTimeout(() => fire('timer'), 30000)

    return () => {
      document.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('scroll', onScroll)
      clearTimeout(tid)
    }
  }, [])

  const dismiss = () => {
    setVisible(false)
    try { localStorage.setItem(STORAGE_DISMISSED, String(Date.now())) } catch {}
  }

  const submit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return
    setStatus('sending')
    setErrorMsg('')

    try {
      const res = await fetch('/api/capture-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, hp }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setErrorMsg(data.message || 'Algo deu errado. Tenta de novo daqui a pouco.')
        return
      }
      setStatus('success')
      try { localStorage.setItem(STORAGE_KEY, 'captured') } catch {}
    } catch (err) {
      setStatus('error')
      setErrorMsg('Erro de rede. Tenta de novo.')
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={dismiss}>
          <motion.div
            initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl overflow-hidden"
            style={{ background: '#0a0a0a', border: '1px solid rgba(244,196,48,0.25)' }}>

            <button onClick={dismiss}
              className="absolute top-3 right-3 z-10 p-2 rounded-lg transition opacity-50 hover:opacity-100"
              aria-label="Fechar">
              <X className="w-4 h-4" style={{ color: '#888' }} />
            </button>

            {/* Top gradient */}
            <div className="px-7 pt-8 pb-5"
              style={{ background: 'linear-gradient(135deg, rgba(244,196,48,0.12), rgba(244,196,48,0.02))', borderBottom: '1px solid rgba(244,196,48,0.15)' }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold mb-3"
                style={{ background: 'rgba(244,196,48,0.15)', color: GOLD, border: '1px solid rgba(244,196,48,0.3)' }}>
                GRÁTIS
              </div>
              <h2 className="text-2xl md:text-3xl font-black leading-tight mb-2">
                5 Hábitos que <span style={{ color: GOLD }}>mudam tudo</span>
              </h2>
              <p className="text-sm" style={{ color: '#aaa' }}>
                Antes de comprar mais um curso, instala essa base. 1 hábito por semana, em 35 dias você não é mais a mesma pessoa.
              </p>
            </div>

            {/* Body */}
            <div className="px-7 py-6">
              {status === 'success' ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(34,197,94,0.15)' }}>
                    <CheckCircle2 className="w-7 h-7" style={{ color: '#22c55e' }} />
                  </div>
                  <h3 className="text-lg font-black mb-2">Cheque seu email</h3>
                  <p className="text-sm mb-5" style={{ color: '#aaa' }}>
                    O guia foi enviado pra <strong>{email}</strong>. Pode levar 1-2 minutos.
                  </p>
                  <button onClick={dismiss} className="px-5 py-2 rounded-xl text-sm font-bold transition"
                    style={{ background: GOLD, color: '#000' }}>
                    Fechar
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold mb-1.5 block" style={{ color: '#aaa' }}>Seu nome (opcional)</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition focus:border-yellow-400"
                      style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}
                      placeholder="Como prefere ser chamado(a)" />
                  </div>
                  <div>
                    <label className="text-xs font-bold mb-1.5 block" style={{ color: '#aaa' }}>Seu melhor email</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition focus:border-yellow-400"
                      style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}
                      placeholder="voce@exemplo.com" />
                  </div>
                  {/* Honeypot */}
                  <input type="text" value={hp} onChange={(e) => setHp(e.target.value)}
                    style={{ position: 'absolute', left: '-9999px' }} tabIndex={-1} autoComplete="off" />

                  {errorMsg && (
                    <div className="text-xs px-3 py-2 rounded-lg"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
                      {errorMsg}
                    </div>
                  )}

                  <button type="submit" disabled={status === 'sending' || !email}
                    className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-50"
                    style={{ background: GOLD, color: '#000' }}>
                    {status === 'sending' ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                    ) : (
                      <><Mail className="w-4 h-4" /> Receber o guia gratuito</>
                    )}
                  </button>

                  <p className="text-[11px] text-center" style={{ color: '#555' }}>
                    Sem spam. Pode descadastrar a qualquer momento. <br/>
                    Você recebe 1 email com o link, e só se você quiser, depois conteúdos sobre hábitos e produtividade.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
