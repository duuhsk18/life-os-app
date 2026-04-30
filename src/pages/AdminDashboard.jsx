// =============================================================================
// ADMIN DASHBOARD — métricas em tempo real
// =============================================================================
// Acesso restrito ao email do owner. Não é navegável (sem link público).
// URL: /admin (descoberta apenas pelo owner)
// =============================================================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { TrendingUp, ShoppingBag, Users, Clock, Package, RefreshCw, ArrowLeft, AlertCircle } from 'lucide-react'

const GOLD = '#F4C430'

const PRODUCT_LABELS = {
  'receitas-low-carb':     'Low Carb',
  'planilhas-treino':      'Treino',
  'receitas-indigenas':    'Indígenas',
  'templates-notion':      'Notion',
  'ebooks-autoajuda':      'Ebooks',
  'planilhas-financeiras': 'Financeiras',
  'kit-completo':          'Kit Completo',
  'life-os':               'Life OS',
}

const SOURCE_LABELS = {
  'mercado_pago': 'Mercado Pago (Pix)',
  'stripe':       'Stripe (Cartão)',
  'kiwify':       'Kiwify (legacy)',
  'unknown':      'Outros',
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [lastFetch, setLastFetch] = useState(null)

  const fetchStats = async () => {
    if (!user?.email) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin-stats?email=${encodeURIComponent(user.email)}`)
      if (!res.ok) {
        if (res.status === 403) {
          setError('Acesso negado. Esse painel é só pro owner.')
        } else {
          setError(`Erro: ${res.status}`)
        }
        setLoading(false)
        return
      }
      const json = await res.json()
      setData(json)
      setLastFetch(new Date())
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 60_000) // refresh a cada 1min
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#000', color: '#fff' }}>
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: GOLD }} />
          <h1 className="text-2xl font-black mb-2">Login necessário</h1>
          <p className="text-sm mb-6" style={{ color: '#888' }}>Você precisa estar logado pra acessar o painel.</p>
          <Link to="/login"
            className="inline-block px-6 py-3 rounded-xl font-bold"
            style={{ background: GOLD, color: '#000' }}>
            Fazer login
          </Link>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#000', color: '#fff' }}>
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#ef4444' }} />
          <h1 className="text-2xl font-black mb-2">{error}</h1>
          <Link to="/" className="text-sm mt-4 inline-block" style={{ color: GOLD }}>← Voltar</Link>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000', color: '#fff' }}>
        <RefreshCw className="w-8 h-8 animate-spin" style={{ color: GOLD }} />
      </div>
    )
  }

  // Calcula max do gráfico de série diária
  const maxDaily = Math.max(...data.dailySeries.map((d) => d.count), 1)
  const maxProduct = Math.max(...data.topProducts.map((p) => p.count), 1)

  return (
    <div className="min-h-screen px-4 py-6" style={{ background: '#000', color: '#fff' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/" className="text-xs mb-2 inline-flex items-center gap-1.5" style={{ color: '#666' }}>
              <ArrowLeft className="w-3 h-3" /> Voltar
            </Link>
            <h1 className="text-3xl font-black">Painel — Vendas</h1>
            <p className="text-xs mt-1" style={{ color: '#666' }}>
              {lastFetch && `Atualizado ${lastFetch.toLocaleTimeString('pt-BR')}`}
              {' · '}
              <button onClick={fetchStats} disabled={loading} className="underline">
                {loading ? 'Atualizando...' : 'Atualizar agora'}
              </button>
            </p>
          </div>
          <span className="text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-widest"
            style={{ background: 'rgba(244,196,48,0.1)', color: GOLD, border: '1px solid rgba(244,196,48,0.3)' }}>
            ● Live
          </span>
        </div>

        {/* Stats principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard icon={Clock}       label="Hoje (24h)"        value={data.windowed.today} accent="#22c55e" />
          <StatCard icon={TrendingUp}  label="Últimos 7 dias"    value={data.windowed.week}  accent={GOLD} />
          <StatCard icon={ShoppingBag} label="Últimos 30 dias"   value={data.windowed.month} accent="#3b82f6" />
          <StatCard icon={Users}       label="Total usuários"    value={data.totals.users}   accent="#a855f7" />
        </div>

        {/* Gráfico daily */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: '#aaa' }}>Vendas por dia (últimos 30)</h2>
          <div className="flex items-end gap-1 h-32">
            {data.dailySeries.map((d, i) => {
              const h = (d.count / maxDaily) * 100
              const isToday = i === data.dailySeries.length - 1
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer relative">
                  <div className="w-full rounded-t transition-all hover:opacity-100"
                    style={{
                      height: `${Math.max(h, 2)}%`,
                      background: isToday ? GOLD : 'rgba(244,196,48,0.4)',
                      opacity: d.count === 0 ? 0.15 : 1,
                    }}
                    title={`${d.date}: ${d.count} venda${d.count !== 1 ? 's' : ''}`}
                  />
                  <span className="text-[8px]" style={{ color: '#444' }}>
                    {d.date.slice(8, 10)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top produtos */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl p-5" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: '#aaa' }}>Top produtos (mês)</h2>
            <div className="space-y-3">
              {data.topProducts.length === 0 && <p className="text-xs" style={{ color: '#666' }}>Sem vendas ainda no mês.</p>}
              {data.topProducts.map((p) => (
                <div key={p.slug}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-bold">{PRODUCT_LABELS[p.slug] || p.slug}</span>
                    <span className="text-xs font-black" style={{ color: GOLD }}>{p.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full transition-all"
                      style={{ width: `${(p.count / maxProduct) * 100}%`, background: GOLD }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Distribuição por source */}
          <div className="rounded-2xl p-5" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: '#aaa' }}>Origem das vendas (mês)</h2>
            <div className="space-y-3">
              {Object.entries(data.sources).length === 0 && <p className="text-xs" style={{ color: '#666' }}>Sem dados.</p>}
              {Object.entries(data.sources).map(([src, count]) => {
                const total = Object.values(data.sources).reduce((a, b) => a + b, 0)
                const pct = ((count / total) * 100).toFixed(1)
                return (
                  <div key={src}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-bold">{SOURCE_LABELS[src] || src}</span>
                      <span className="text-xs">
                        <span className="font-black" style={{ color: GOLD }}>{count}</span>
                        <span className="ml-2" style={{ color: '#666' }}>{pct}%</span>
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="h-full" style={{ width: `${pct}%`, background: GOLD, opacity: 0.7 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Últimos pedidos */}
        <div className="rounded-2xl p-5" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: '#aaa' }}>Últimos 10 pedidos</h2>
          <div className="space-y-2">
            {data.recentOrders.length === 0 && <p className="text-xs" style={{ color: '#666' }}>Sem pedidos ainda.</p>}
            {data.recentOrders.map((o, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{PRODUCT_LABELS[o.product_slug] || o.product_slug}</p>
                  <p className="text-[11px]" style={{ color: '#666' }}>{o.email || '?'}</p>
                </div>
                <div className="text-right ml-2">
                  <p className="text-[11px] font-bold" style={{ color: '#22c55e' }}>{SOURCE_LABELS[o.source] || o.source}</p>
                  <p className="text-[10px]" style={{ color: '#555' }}>
                    {new Date(o.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total geral */}
        <p className="text-center mt-6 text-xs" style={{ color: '#444' }}>
          Total acumulado: {data.totals.entitlements} entitlements · {data.totals.users} usuários
        </p>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color: accent }} />
        <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#888' }}>{label}</p>
      </div>
      <p className="text-3xl font-black" style={{ color: accent }}>{value}</p>
    </div>
  )
}
