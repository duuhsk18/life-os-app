import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useUserProducts } from '@/lib/entitlements'
import { ExternalLink, Sparkles, ShoppingBag, LogOut, Loader2 } from 'lucide-react'

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
          <button
            onClick={handleLogout}
            className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5"
            style={{ color: '#888' }}
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair
          </button>
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
