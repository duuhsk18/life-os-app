import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CreditCard, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useUserProducts } from '@/lib/entitlements'

const GOLD = '#F4C430'

export default function Assinatura() {
  const { user, loading: authLoading } = useAuth()
  const { products, hasLifeOS, loading: productsLoading } = useUserProducts()
  const navigate = useNavigate()
  const [opening, setOpening] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    }
  }, [authLoading, user, navigate])

  const openPortal = async () => {
    setOpening(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setError('Sua sessão expirou. Faça login de novo.')
        setOpening(false)
        return
      }

      const res = await fetch('/api/stripe-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'no_customer') {
          setError('Você ainda não tem assinatura. Confira nosso catálogo.')
        } else if (data.error === 'portal_not_configured') {
          setError('O portal está sendo configurado. Entre em contato pelo email contato@agenciacriativa.shop.')
        } else {
          setError(data.message || data.error || 'Erro ao abrir portal de assinatura.')
        }
        setOpening(false)
        return
      }

      window.location.href = data.url
    } catch (err) {
      setError('Erro de rede. Tenta de novo daqui a pouco.')
      setOpening(false)
    }
  }

  if (authLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: GOLD }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: '#000', color: '#fff' }}>
      <div className="max-w-2xl mx-auto">
        {/* Voltar */}
        <Link to="/minha-conta"
          className="inline-flex items-center gap-2 text-sm mb-6 transition"
          style={{ color: '#888' }}>
          <ArrowLeft className="w-4 h-4" /> Voltar para Minha Conta
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-3xl md:text-4xl font-black mb-2">Sua assinatura</h1>
          <p className="text-sm mb-8" style={{ color: '#888' }}>
            Gerencie pagamentos, cancele ou atualize seu cartão a qualquer momento
          </p>

          {/* Status */}
          {hasLifeOS ? (
            <div className="rounded-2xl p-6 mb-6"
              style={{ background: 'rgba(244,196,48,0.05)', border: '1px solid rgba(244,196,48,0.3)' }}>
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: GOLD }} />
                <div>
                  <h2 className="font-black text-lg" style={{ color: GOLD }}>Life OS — ativo</h2>
                  <p className="text-sm mt-1" style={{ color: '#ccc' }}>
                    Você tem acesso completo ao app gamificado e à biblioteca dos 6 produtos.
                  </p>
                </div>
              </div>

              <button
                onClick={openPortal}
                disabled={opening}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm active:scale-95 transition disabled:opacity-50"
                style={{ background: GOLD, color: '#000' }}>
                {opening ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Abrindo portal...</>
                ) : (
                  <><CreditCard className="w-4 h-4" /> Gerenciar assinatura</>
                )}
              </button>

              <p className="text-[11px] text-center mt-3" style={{ color: '#666' }}>
                No portal você pode atualizar cartão, ver faturas e cancelar
              </p>
            </div>
          ) : (
            <div className="rounded-2xl p-6 mb-6"
              style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#888' }} />
                <div>
                  <h2 className="font-black text-lg">Você não tem assinatura ativa</h2>
                  <p className="text-sm mt-1" style={{ color: '#888' }}>
                    Suas compras avulsas / Kit ficam vitalícias. O Life OS é a única opção com assinatura.
                  </p>
                </div>
              </div>
              <Link to="/" className="inline-block px-5 py-2.5 rounded-xl text-sm font-bold transition"
                style={{ background: GOLD, color: '#000' }}>
                Conhecer Life OS →
              </Link>
            </div>
          )}

          {/* Produtos avulsos */}
          {products.length > 0 && (
            <div className="rounded-2xl p-6 mb-6"
              style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="font-black mb-3">Seus produtos vitalícios</h3>
              <ul className="space-y-2">
                {products.filter((p) => p.kind === 'deliverable').map((p) => (
                  <li key={p.slug} className="flex items-center gap-3 text-sm">
                    <span className="text-2xl">{p.emoji}</span>
                    <span style={{ color: '#ccc' }}>{p.title}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs mt-3" style={{ color: '#666' }}>
                Estes produtos são pagamentos únicos — não tem mensalidade nem renovação.
              </p>
            </div>
          )}

          {/* Erro */}
          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4 mb-6 flex items-start gap-3"
              style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
              <p className="text-sm" style={{ color: '#fca5a5' }}>{error}</p>
            </motion.div>
          )}

          {/* Help */}
          <div className="text-center text-xs" style={{ color: '#555' }}>
            Precisa de ajuda? Manda um email pra{' '}
            <a href="mailto:contato@agenciacriativa.shop" style={{ color: GOLD }} className="underline">
              contato@agenciacriativa.shop
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
