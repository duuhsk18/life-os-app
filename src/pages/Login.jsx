import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, CheckCircle2, AlertCircle, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const GOLD = '#F4C430'

/**
 * Login com 2 modos:
 *   - 'password': email + senha (rápido, sem email — pra returning users)
 *   - 'magic':    só email, recebe link mágico (primeiro acesso, esqueci senha)
 */
export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState('password') // 'password' | 'magic'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [status, setStatus] = useState('idle') // idle | loading | sent | error
  const [errorMsg, setErrorMsg] = useState('')

  // Login com senha
  async function submitPassword(e) {
    e.preventDefault()
    if (status === 'loading') return
    setStatus('loading')
    setErrorMsg('')

    const { error } = await signIn(email.trim(), password)

    if (error) {
      setStatus('error')
      const msg = (error.message || '').toLowerCase()
      if (msg.includes('invalid login credentials') || msg.includes('invalid')) {
        setErrorMsg('Email ou senha incorretos. Se for primeiro acesso, use "Esqueci a senha / primeiro acesso".')
      } else {
        setErrorMsg(error.message || 'Algo deu errado. Tenta de novo.')
      }
      return
    }

    navigate('/minha-conta')
  }

  // Magic link
  async function submitMagicLink(e) {
    e.preventDefault()
    if (status === 'loading') return
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/send-login-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()

      if (res.status === 429) {
        setStatus('error')
        setErrorMsg(data.message || 'Aguarde alguns segundos e tenta de novo.')
        return
      }
      if (!res.ok) {
        setStatus('error')
        setErrorMsg(data.message || 'Não conseguimos enviar o link. Tenta de novo.')
        return
      }
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
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg" style={{ background: GOLD, color: '#000' }}>L</div>
          <span className="font-black text-xl text-white">Life OS</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="p-6 rounded-2xl"
          style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)' }}>

          <AnimatePresence mode="wait">

            {/* TELA 1 — formulário de senha */}
            {mode === 'password' && status !== 'sent' && (
              <motion.div
                key="password"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}>
                <h1 className="text-white font-black text-lg text-center mb-1">Acessar minha conta</h1>
                <p className="text-gray-500 text-xs text-center mb-6">
                  Entre com email e senha
                </p>

                <form onSubmit={submitPassword} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    autoComplete="email"
                    required
                    className="w-full bg-transparent border rounded-xl px-4 py-3 text-sm outline-none text-white transition focus:border-yellow-400"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                  />

                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha"
                      autoComplete="current-password"
                      required
                      minLength={6}
                      className="w-full bg-transparent border rounded-xl px-4 py-3 pr-11 text-sm outline-none text-white transition focus:border-yellow-400"
                      style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                    />
                    <button type="button" onClick={() => setShowPwd((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition opacity-50 hover:opacity-100"
                      tabIndex={-1}>
                      {showPwd ? <EyeOff className="w-4 h-4" style={{ color: '#888' }} /> : <Eye className="w-4 h-4" style={{ color: '#888' }} />}
                    </button>
                  </div>

                  {status === 'error' && errorMsg && (
                    <div className="text-xs px-3 py-2 rounded-lg flex items-start gap-2"
                      style={{ background: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button type="submit" disabled={status === 'loading' || !email || !password}
                    className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
                    style={{ background: GOLD, color: '#000' }}>
                    {status === 'loading' ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Entrando...</>
                    ) : (
                      <><KeyRound className="w-4 h-4" /> Entrar</>
                    )}
                  </button>
                </form>

                <button onClick={() => { setMode('magic'); tryAgain() }}
                  className="w-full mt-4 text-xs text-center py-2 transition hover:underline"
                  style={{ color: GOLD }}>
                  Esqueci a senha / primeiro acesso →
                </button>
              </motion.div>
            )}

            {/* TELA 2 — formulário magic link */}
            {mode === 'magic' && status !== 'sent' && (
              <motion.div
                key="magic"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}>
                <h1 className="text-white font-black text-lg text-center mb-1">Receber link de acesso</h1>
                <p className="text-gray-500 text-xs text-center mb-6">
                  Vamos enviar um link mágico pro seu email. Use no primeiro acesso ou se esqueceu a senha.
                </p>

                <form onSubmit={submitMagicLink} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    autoComplete="email"
                    required
                    className="w-full bg-transparent border rounded-xl px-4 py-3 text-sm outline-none text-white transition focus:border-yellow-400"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                  />

                  {status === 'error' && errorMsg && (
                    <div className="text-xs px-3 py-2 rounded-lg flex items-start gap-2"
                      style={{ background: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button type="submit" disabled={status === 'loading' || !email}
                    className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
                    style={{ background: GOLD, color: '#000' }}>
                    {status === 'loading' ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                    ) : (
                      <><Mail className="w-4 h-4" /> Receber link de acesso</>
                    )}
                  </button>
                </form>

                <button onClick={() => { setMode('password'); tryAgain() }}
                  className="w-full mt-4 text-xs text-center py-2 transition hover:underline"
                  style={{ color: GOLD }}>
                  ← Voltar ao login com senha
                </button>
              </motion.div>
            )}

            {/* TELA 3 — magic link enviado */}
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
                <p className="text-sm mb-4" style={{ color: '#aaa' }}>
                  Se o email <strong>{email}</strong> tiver conta, o link de acesso vai chegar em até 2 min.
                </p>
                <p className="text-xs mb-6" style={{ color: '#666' }}>
                  Vem de <strong style={{ color: '#888' }}>noreply@agenciacriativa.shop</strong>. Verifica spam e Promoções.
                </p>
                <p className="text-xs mb-3" style={{ color: '#888' }}>
                  Após entrar, você pode <strong>definir uma senha</strong> em "Minha Conta" pra agilizar próximos logins.
                </p>
                <button onClick={() => { setMode('password'); tryAgain() }}
                  className="text-xs underline transition" style={{ color: GOLD }}>
                  ← Voltar ao login com senha
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
