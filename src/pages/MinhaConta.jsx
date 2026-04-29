import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useUserProducts } from '@/lib/entitlements'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ExternalLink, Sparkles, ShoppingBag, LogOut, Loader2, CreditCard, KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

const GOLD = '#F4C430'

export default function MinhaConta() {
  const navigate = useNavigate()
  const { user, loading: authLoading, signOut } = useAuth()
  const { products, deliverables, hasLifeOS, loading } = useUserProducts()

  if (authLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#000' }}>
        <Loader2 className="w-7 h-7 animate-spin" style={{ color: GOLD }} />
      </div>
    )
  }

  if (!user) {
    navigate('/login', { replace: true })
    return null
  }

  const firstName = (user.user_metadata?.full_name || user.email || '').split(' ')[0] || 'Olá'

  async function handleLogout() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen" style={{ background: '#000', color: '#f0f0f0' }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-base font-black tracking-tight" style={{ color: GOLD }}>
              agência criativa
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Link
              to="/conta/assinatura"
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5 transition"
              style={{ color: '#888' }}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Assinatura</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5 transition"
              style={{ color: '#888' }}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-10">
        {/* Greeting */}
        <div className="mb-10">
          <p className="text-sm" style={{ color: '#666' }}>Olá,</p>
          <h1 className="text-3xl font-black mt-1">{firstName}</h1>
          <p className="text-sm mt-2" style={{ color: '#777' }}>
            Esta é sua área de acesso. Todos os produtos que você comprou ficam disponíveis aqui.
          </p>
        </div>

        {/* Life OS spotlight (se assinante) */}
        {hasLifeOS && (
          <Link
            to="/membros"
            className="block mb-10 rounded-2xl p-6 transition-all hover:scale-[1.005]"
            style={{
              background: 'linear-gradient(135deg, rgba(244,196,48,0.15), rgba(244,196,48,0.04))',
              border:     `1px solid rgba(244,196,48,0.3)`,
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: 'rgba(244,196,48,0.2)' }}
              >
                ⚡
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-black">Clube Life OS</h2>
                  <Sparkles className="w-4 h-4" style={{ color: GOLD }} />
                </div>
                <p className="text-xs" style={{ color: '#999' }}>
                  Hábitos, treinos, journal, finanças e biblioteca completa.
                </p>
              </div>
              <div
                className="text-xs font-bold px-3 py-2 rounded-lg flex-shrink-0"
                style={{ background: GOLD, color: '#000' }}
              >
                Entrar →
              </div>
            </div>
          </Link>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#444' }} />
          </div>
        )}

        {/* Empty state */}
        {!loading && products.length === 0 && (
          <div
            className="rounded-2xl p-10 text-center"
            style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <ShoppingBag className="w-10 h-10 mx-auto mb-4" style={{ color: '#333' }} />
            <h3 className="text-lg font-bold mb-2">Nenhum produto na sua conta ainda</h3>
            <p className="text-sm mb-6" style={{ color: '#666' }}>
              Quando você comprar qualquer produto, ele aparece aqui automaticamente.
            </p>
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm"
              style={{ background: GOLD, color: '#000' }}
            >
              Ver catálogo
            </Link>
          </div>
        )}

        {/* Deliverables grid */}
        {!loading && deliverables.length > 0 && (
          <>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-lg font-black">Seus produtos</h2>
              <span className="text-xs" style={{ color: '#555' }}>
                {deliverables.length} {deliverables.length === 1 ? 'item' : 'itens'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {deliverables.map((p) => (
                <a
                  key={p.slug}
                  href={p.access_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-2xl p-5 transition-all hover:scale-[1.01]"
                  style={{
                    background: '#0a0a0a',
                    border:     '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{
                        background: `${p.color}22`,
                        border:     `1px solid ${p.color}33`,
                      }}
                    >
                      {p.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold mb-1 leading-tight">{p.title}</h3>
                      <p className="text-xs leading-relaxed" style={{ color: '#666' }}>
                        {p.description}
                      </p>
                      <div
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold"
                        style={{ color: p.color }}
                      >
                        Acessar
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}

        {/* Senha */}
        <PasswordSection />

        {/* Footer note */}
        <div
          className="mt-12 rounded-xl p-4 text-xs"
          style={{
            background: 'rgba(59,130,246,0.05)',
            border:     '1px solid rgba(59,130,246,0.15)',
            color:      '#6b8caf',
          }}
        >
          💡 <strong>Dica:</strong> ao abrir um produto no celular, toque em "Instalar app" para fixar
          como ícone na tela inicial. Tudo funciona offline depois.
        </div>
      </main>
    </div>
  )
}

function PasswordSection() {
  const [pwd, setPwd]       = useState('')
  const [pwd2, setPwd2]     = useState('')
  const [showPwd, setShow]  = useState(false)
  const [status, setStatus] = useState('idle') // idle | saving | saved | error
  const [errMsg, setErrMsg] = useState('')

  async function save(e) {
    e.preventDefault()
    setStatus('saving')
    setErrMsg('')

    if (pwd.length < 6) {
      setStatus('error')
      setErrMsg('Senha precisa ter ao menos 6 caracteres.')
      return
    }
    if (pwd !== pwd2) {
      setStatus('error')
      setErrMsg('As senhas não coincidem.')
      return
    }

    const { error } = await supabase.auth.updateUser({ password: pwd })
    if (error) {
      setStatus('error')
      setErrMsg(error.message || 'Erro ao salvar senha.')
      return
    }

    setStatus('saved')
    setPwd('')
    setPwd2('')
    setTimeout(() => setStatus('idle'), 4000)
  }

  return (
    <div className="mt-10 rounded-2xl p-6"
      style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(244,196,48,0.12)', border: '1px solid rgba(244,196,48,0.25)' }}>
          <KeyRound className="w-4 h-4" style={{ color: GOLD }} />
        </div>
        <div>
          <h3 className="font-bold text-sm">Definir senha de acesso</h3>
          <p className="text-xs" style={{ color: '#666' }}>
            Pra entrar mais rápido nas próximas vezes (sem precisar do email)
          </p>
        </div>
      </div>

      <form onSubmit={save} className="space-y-3 mt-4 max-w-md">
        <div className="relative">
          <input
            type={showPwd ? 'text' : 'password'}
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="Nova senha (mínimo 6 caracteres)"
            autoComplete="new-password"
            minLength={6}
            required
            className="w-full bg-transparent border rounded-xl px-4 py-3 pr-11 text-sm outline-none transition focus:border-yellow-400"
            style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
          />
          <button type="button" onClick={() => setShow((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-50 hover:opacity-100 transition" tabIndex={-1}>
            {showPwd ? <EyeOff className="w-4 h-4" style={{ color: '#888' }} /> : <Eye className="w-4 h-4" style={{ color: '#888' }} />}
          </button>
        </div>
        <input
          type={showPwd ? 'text' : 'password'}
          value={pwd2}
          onChange={(e) => setPwd2(e.target.value)}
          placeholder="Confirmar senha"
          autoComplete="new-password"
          minLength={6}
          required
          className="w-full bg-transparent border rounded-xl px-4 py-3 text-sm outline-none transition focus:border-yellow-400"
          style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
        />

        {status === 'error' && errMsg && (
          <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
            {errMsg}
          </p>
        )}

        {status === 'saved' && (
          <p className="text-xs px-3 py-2 rounded-lg flex items-center gap-2"
            style={{ background: 'rgba(34,197,94,0.08)', color: '#86efac', border: '1px solid rgba(34,197,94,0.3)' }}>
            <CheckCircle2 className="w-4 h-4" /> Senha salva! Use email + senha no próximo login.
          </p>
        )}

        <button type="submit" disabled={status === 'saving' || !pwd || !pwd2}
          className="px-5 py-2.5 rounded-xl font-bold text-sm transition active:scale-95 disabled:opacity-50"
          style={{ background: GOLD, color: '#000' }}>
          {status === 'saving' ? 'Salvando...' : 'Salvar senha'}
        </button>
      </form>
    </div>
  )
}
