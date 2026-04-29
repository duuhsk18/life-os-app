import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ShieldCheck, Lock, CreditCard, CheckCircle2, Loader2, Sparkles, Gift } from 'lucide-react'
import { getProduct, KIT_COMPLETO } from '@/lib/sales-data'
import GarantiaBadge from '@/components/sales/GarantiaBadge'
import PageMeta from '@/components/PageMeta'

const GOLD = '#F4C430'
const SITE = 'https://www.agenciacriativa.shop'

// Slugs que NÃO recebem bump (já é o "produto top" ou subscription)
const NO_BUMP_SLUGS = new Set(['kit-completo', 'life-os'])

export default function CheckoutPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const product = getProduct(slug)

  // Estado: se cliente marcou bump (upgrade pra Kit)
  const [withBump, setWithBump] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => { window.scrollTo(0, 0) }, [slug])

  if (!product && slug !== 'kit-completo' && slug !== 'life-os') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000', color: '#fff' }}>
        <div className="text-center">
          <p className="text-4xl mb-4">😕</p>
          <h1 className="text-xl font-bold mb-2">Produto não encontrado</h1>
          <Link to="/" className="text-yellow-400 underline">Voltar ao início</Link>
        </div>
      </div>
    )
  }

  // Determina o produto principal sendo comprado
  const mainProduct = product || (slug === 'kit-completo' ? null : null)
  const showBump = product && !NO_BUMP_SLUGS.has(slug)

  const mainPrice = product ? product.price : (slug === 'kit-completo' ? 47 : 79.90)
  const bumpDelta = 47 - mainPrice // diferença pra fazer Kit (R$47)
  const total = withBump ? 47 : mainPrice

  async function submit(e) {
    e?.preventDefault()
    if (loading) return
    setLoading(true)
    setErrorMsg('')

    // Monta items: produto principal (substituído por kit-completo se bump)
    const items = withBump ? ['kit-completo'] : [slug]

    try {
      const res = await fetch('/api/create-checkout-session', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ items, email: email.trim() }),
      })
      const data = await res.json()

      if (!res.ok || !data.url) {
        setErrorMsg(data.error || 'Não foi possível abrir o pagamento. Tenta de novo.')
        setLoading(false)
        return
      }

      // Redireciona pro Stripe
      window.location.href = data.url
    } catch (err) {
      setErrorMsg('Erro de rede. Tenta de novo daqui a pouco.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: '#000', color: '#fff' }}>
      <PageMeta
        title={`Checkout — ${product?.title || slug} | Agência Criativa`}
        description="Compra 100% segura processada pelo Stripe. Acesso imediato após o pagamento. Garantia 7 dias."
        canonical={`${SITE}/checkout/${slug}`}
        noindex
      />

      <div className="max-w-md mx-auto">
        {/* Voltar */}
        <Link to={`/p/${slug}`}
          className="inline-flex items-center gap-2 text-sm mb-6 transition"
          style={{ color: '#888' }}>
          <ArrowLeft className="w-4 h-4" /> Voltar pra página do produto
        </Link>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3"
            style={{ background: 'rgba(244,196,48,0.1)', color: GOLD, border: '1px solid rgba(244,196,48,0.25)' }}>
            <Lock className="w-3.5 h-3.5" /> Checkout seguro
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-1">Confirme seu pedido</h1>
          <p className="text-sm" style={{ color: '#888' }}>
            Pagamento processado pela Stripe · garantia 7 dias
          </p>
        </div>

        {/* Card produto principal */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="rounded-2xl p-5 mb-3 flex items-center gap-4"
          style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)' }}>
          {product?.image ? (
            <img src={product.image} alt={product.title}
              className="w-16 h-20 object-cover rounded-lg flex-shrink-0" />
          ) : (
            <div className="w-16 h-20 rounded-lg flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              {product?.emoji || '⚡'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs mb-0.5" style={{ color: '#666' }}>Produto principal</p>
            <h2 className="font-black text-base leading-tight line-clamp-2 mb-1">
              {product?.title || (slug === 'kit-completo' ? KIT_COMPLETO.title : 'Life OS')}
            </h2>
            <p className="font-black text-lg" style={{ color: GOLD }}>
              R$ {mainPrice.toFixed(2).replace('.', ',')}
            </p>
          </div>
        </motion.div>

        {/* ORDER BUMP — só aparece pra produtos individuais */}
        {showBump && (
          <motion.label
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl p-5 mb-3 cursor-pointer transition-all block"
            style={{
              background: withBump ? 'rgba(34,197,94,0.05)' : 'rgba(244,196,48,0.04)',
              border: withBump ? '2px solid rgba(34,197,94,0.4)' : '2px dashed rgba(244,196,48,0.3)',
            }}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <input type="checkbox" checked={withBump} onChange={(e) => setWithBump(e.target.checked)}
                  className="w-5 h-5 accent-yellow-400 cursor-pointer" />
              </div>
              <div className="flex-1">
                <div className="flex items-start gap-2 mb-2">
                  <Gift className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: GOLD }} />
                  <p className="font-bold text-sm leading-tight" style={{ color: withBump ? '#86efac' : '#fff' }}>
                    Adicione +R$ {bumpDelta.toFixed(2).replace('.', ',')} e leve <strong>TUDO</strong>
                  </p>
                </div>
                <p className="text-xs mb-2 leading-relaxed" style={{ color: '#aaa' }}>
                  Em vez de só este produto, leve os <strong style={{ color: '#fff' }}>6 produtos completos</strong> (Receitas Low Carb + Treino + Indígenas + Templates + Ebooks + Financeiras).
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs line-through" style={{ color: '#555' }}>
                    R$ 167,40 (separado)
                  </span>
                  <span className="font-black text-sm" style={{ color: GOLD }}>
                    + R$ {bumpDelta.toFixed(2).replace('.', ',')} = R$ 47 total
                  </span>
                </div>
                {withBump && (
                  <p className="text-xs mt-2 flex items-center gap-1" style={{ color: '#22c55e' }}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Adicionado · você economiza R$ {(167.40 - 47).toFixed(2).replace('.', ',')}
                  </p>
                )}
              </div>
            </div>
          </motion.label>
        )}

        {/* TOTAL */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl p-5 mb-4"
          style={{ background: '#0f0f0f', border: '1px solid rgba(244,196,48,0.2)' }}>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-bold" style={{ color: '#888' }}>Total</span>
            <AnimatePresence mode="wait">
              <motion.span key={total}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-3xl font-black" style={{ color: GOLD }}>
                R$ {total.toFixed(2).replace('.', ',')}
              </motion.span>
            </AnimatePresence>
          </div>
          <p className="text-xs mt-1 text-right" style={{ color: '#666' }}>
            {slug === 'life-os' ? 'no 1º mês — depois R$ 79,90/mês' : 'pagamento único · acesso vitalício'}
          </p>
        </motion.div>

        {/* Email opcional (UX) */}
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
          className="space-y-3 mb-4">
          <div>
            <label className="text-xs font-bold mb-1.5 block" style={{ color: '#aaa' }}>
              Seu email (opcional — preenche no checkout depois)
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
              className="w-full bg-transparent border rounded-xl px-4 py-3 text-sm outline-none transition focus:border-yellow-400"
              style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
          </div>

          {errorMsg && (
            <div className="text-xs px-3 py-2 rounded-lg"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
              {errorMsg}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 active:scale-95 transition shadow-2xl disabled:opacity-50"
            style={{ background: GOLD, color: '#000', boxShadow: '0 8px 32px rgba(244,196,48,0.3)' }}>
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Abrindo pagamento...</>
            ) : (
              <><CreditCard className="w-5 h-5" /> Pagar R$ {total.toFixed(2).replace('.', ',')}</>
            )}
          </button>

          <p className="text-[11px] text-center" style={{ color: '#666' }}>
            Próxima tela: pagamento seguro pela Stripe (cartão / Pix / boleto)
          </p>
        </motion.form>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.4 }}
          className="flex flex-col gap-3 items-center mt-6">
          <GarantiaBadge />
          <div className="flex items-center gap-4 text-xs" style={{ color: '#666' }}>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Pagamento criptografado
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Acesso imediato
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
