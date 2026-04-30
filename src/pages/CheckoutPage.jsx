import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ShieldCheck, Lock, CreditCard, CheckCircle2, Loader2, Sparkles, Gift, QrCode } from 'lucide-react'
import { getProduct, KIT_COMPLETO } from '@/lib/sales-data'
import GarantiaBadge from '@/components/sales/GarantiaBadge'
import CountdownTimer from '@/components/sales/CountdownTimer'
import SocialProofToast from '@/components/sales/SocialProofToast'
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
  const [paymentMethod, setPaymentMethod] = useState('card') // 'card' (Stripe) | 'pix' (MP)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Pix bloqueado pra Life OS (subscription não funciona com Pix)
  const isLifeOS = slug === 'life-os'

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

  // Validação de email
  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())
  const emailValid = isValidEmail(email)
  // Pix exige email — sem email a gente NÃO consegue mandar magic link depois
  const canSubmit = paymentMethod === 'pix' ? emailValid : true

  async function submit(e) {
    e?.preventDefault()
    if (loading) return

    // Bloqueia Pix sem email válido (acesso fica preso)
    if (paymentMethod === 'pix' && !emailValid) {
      setErrorMsg('Pra Pix precisamos do seu email — é onde mandamos o acesso depois do pagamento.')
      return
    }

    setLoading(true)
    setErrorMsg('')

    // Monta items: produto principal (substituído por kit-completo se bump)
    const items = withBump ? ['kit-completo'] : [slug]

    try {
      // Pix: novo fluxo embedado — gera QR + redireciona pra /pagamento/pix
      if (paymentMethod === 'pix') {
        const res = await fetch('/api/create-mp-pix', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ items, email: email.trim() }),
        })
        const data = await res.json()

        if (!res.ok || !data.qrCode) {
          setErrorMsg(data.message || data.error || 'Não foi possível gerar o Pix. Tenta de novo.')
          setLoading(false)
          return
        }

        // Vai pra nossa página de Pix (com polling)
        navigate('/pagamento/pix', {
          state: {
            paymentId:    data.paymentId,
            qrCode:       data.qrCode,
            qrCodeBase64: data.qrCodeBase64,
            ticketUrl:    data.ticketUrl,
            amount:       data.amount,
            slugs:        items,
            email:        email.trim(),
          },
        })
        return
      }

      // Cartão: Stripe Checkout (redirect)
      const res = await fetch('/api/create-checkout-session', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ items, email: email.trim() }),
      })
      const data = await res.json()

      if (!res.ok || !data.url) {
        setErrorMsg(data.message || data.error || 'Não foi possível abrir o pagamento. Tenta de novo.')
        setLoading(false)
        return
      }
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

      {/* Toast de social proof recente */}
      <SocialProofToast />

      {/* Banner de escassez no topo (sticky) */}
      <div className="max-w-md mx-auto mb-4">
        <div className="rounded-2xl p-3 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))', border: '1px solid rgba(239,68,68,0.4)' }}>
          <span className="text-xl flex-shrink-0">🔥</span>
          <div className="flex-1">
            <p className="text-xs font-black uppercase tracking-wider" style={{ color: '#fca5a5' }}>Oferta termina em</p>
            <CountdownTimer minutes={15} />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {/* Voltar */}
        <Link to={`/p/${slug}`}
          className="inline-flex items-center gap-2 text-sm mb-4 transition"
          style={{ color: '#888' }}>
          <ArrowLeft className="w-4 h-4" /> Voltar pra página do produto
        </Link>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3"
            style={{ background: 'rgba(244,196,48,0.1)', color: GOLD, border: '1px solid rgba(244,196,48,0.25)' }}>
            <Lock className="w-3.5 h-3.5" /> Checkout 100% seguro
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-1">Confirme seu pedido</h1>
          <p className="text-sm" style={{ color: '#888' }}>
            Pagamento processado pela Stripe · garantia 7 dias
          </p>
        </div>

        {/* Card produto principal — imagem maior + destaques */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="rounded-2xl p-4 mb-3"
          style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-start gap-4">
            {product?.image ? (
              <img src={product.image} alt={product.title}
                className="w-24 h-28 object-cover rounded-xl flex-shrink-0 shadow-lg" />
            ) : (
              <div className="w-24 h-28 rounded-xl flex items-center justify-center text-5xl flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                {product?.emoji || '⚡'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: GOLD }}>Você está comprando</p>
              <h2 className="font-black text-base leading-tight mb-2">
                {product?.title || (slug === 'kit-completo' ? KIT_COMPLETO.title : 'Life OS')}
              </h2>
              <div className="flex items-baseline gap-2 flex-wrap">
                {product?.originalPrice && product.originalPrice > mainPrice && (
                  <span className="text-xs line-through" style={{ color: '#555' }}>
                    R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                  </span>
                )}
                <span className="font-black text-xl" style={{ color: GOLD }}>
                  R$ {mainPrice.toFixed(2).replace('.', ',')}
                </span>
                {product?.originalPrice && product.originalPrice > mainPrice && (
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded" style={{ background: '#22c55e', color: '#000' }}>
                    -{Math.round((1 - mainPrice / product.originalPrice) * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Mini features do produto */}
          {product?.benefits && product.benefits.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/5">
              {product.benefits.slice(0, 4).map((b, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: GOLD }} />
                  <p className="text-[11px] leading-tight" style={{ color: '#bbb' }}>{b.title}</p>
                </div>
              ))}
            </div>
          )}
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

        {/* SELETOR DE FORMA DE PAGAMENTO */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}
          className="mb-4">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#888' }}>
            Como prefere pagar?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {/* Cartão (Stripe) */}
            <button type="button" onClick={() => setPaymentMethod('card')}
              className="rounded-xl p-3 text-left transition-all active:scale-95"
              style={{
                background: paymentMethod === 'card' ? 'rgba(244,196,48,0.1)' : '#0f0f0f',
                border: paymentMethod === 'card' ? `2px solid ${GOLD}` : '2px solid rgba(255,255,255,0.06)',
              }}>
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-4 h-4" style={{ color: paymentMethod === 'card' ? GOLD : '#666' }} />
                <span className="text-xs font-black">Cartão</span>
              </div>
              <p className="text-[10px] leading-tight" style={{ color: '#888' }}>
                Crédito/débito · até 12x · imediato
              </p>
            </button>

            {/* Pix (MP) */}
            <button type="button" onClick={() => setPaymentMethod('pix')}
              disabled={isLifeOS}
              className="rounded-xl p-3 text-left transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: paymentMethod === 'pix' ? 'rgba(34,197,94,0.08)' : '#0f0f0f',
                border: paymentMethod === 'pix' ? '2px solid #22c55e' : '2px solid rgba(255,255,255,0.06)',
              }}>
              <div className="flex items-center gap-2 mb-1">
                <QrCode className="w-4 h-4" style={{ color: paymentMethod === 'pix' ? '#22c55e' : '#666' }} />
                <span className="text-xs font-black">Pix</span>
              </div>
              <p className="text-[10px] leading-tight" style={{ color: '#888' }}>
                {isLifeOS ? 'Indisp. pra assinatura' : 'Aprovação na hora'}
              </p>
            </button>
          </div>
        </motion.div>

        {/* Email opcional (UX) */}
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
          className="space-y-3 mb-4">
          <div>
            <label className="text-xs font-bold mb-1.5 block" style={{ color: '#aaa' }}>
              Seu email {paymentMethod === 'pix' ? <span style={{ color: GOLD }}>(obrigatório — acesso vai pra cá)</span> : '(opcional — pode preencher na próxima tela)'}
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
              required={paymentMethod === 'pix'}
              className="w-full bg-transparent border rounded-xl px-4 py-3 text-sm outline-none transition focus:border-yellow-400"
              style={{
                borderColor: paymentMethod === 'pix' && email && !emailValid ? '#ef4444' : 'rgba(255,255,255,0.1)',
                color: '#fff',
              }} />
            {paymentMethod === 'pix' && email && !emailValid && (
              <p className="text-[11px] mt-1" style={{ color: '#fca5a5' }}>Email inválido. Confere se digitou direito.</p>
            )}
          </div>

          {errorMsg && (
            <div className="text-xs px-3 py-2 rounded-lg"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
              {errorMsg}
            </div>
          )}

          <button type="submit" disabled={loading || !canSubmit}
            className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 active:scale-95 transition shadow-2xl disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: GOLD, color: '#000', boxShadow: '0 8px 32px rgba(244,196,48,0.3)' }}>
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Abrindo pagamento...</>
            ) : paymentMethod === 'pix' ? (
              <><QrCode className="w-5 h-5" /> Pagar R$ {total.toFixed(2).replace('.', ',')} via Pix</>
            ) : (
              <><CreditCard className="w-5 h-5" /> Pagar R$ {total.toFixed(2).replace('.', ',')}</>
            )}
          </button>

          <p className="text-[11px] text-center" style={{ color: '#666' }}>
            {paymentMethod === 'pix'
              ? 'QR Code aparece na próxima tela · acesso liberado em segundos após pagar'
              : 'Próxima tela: pagamento seguro pela Stripe (cartão crédito/débito)'}
          </p>
        </motion.form>

        {/* Mini-depoimentos rápidos abaixo do CTA */}
        {product?.testimonials && product.testimonials.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}
            className="rounded-2xl p-4 mt-6"
            style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.15)' }}>
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-yellow-400 text-sm">★★★★★</span>
              <span className="text-xs font-bold" style={{ color: '#86efac' }}>
                4.9/5 · +2.000 clientes
              </span>
            </div>
            <p className="text-xs leading-relaxed mb-2 italic" style={{ color: '#ccc' }}>
              "{product.testimonials[0].text.length > 120 ? product.testimonials[0].text.slice(0, 117) + '…' : product.testimonials[0].text}"
            </p>
            <p className="text-[10px]" style={{ color: '#888' }}>
              — {product.testimonials[0].name} · {product.testimonials[0].city}
            </p>
          </motion.div>
        )}

        {/* Trust signals expandido */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.4 }}
          className="flex flex-col gap-4 items-center mt-6">
          <GarantiaBadge />

          {/* Trust badges row */}
          <div className="grid grid-cols-3 gap-2 w-full">
            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <ShieldCheck className="w-4 h-4 mx-auto mb-1" style={{ color: '#22c55e' }} />
              <p className="text-[10px] font-bold leading-tight" style={{ color: '#aaa' }}>Pagamento<br/>criptografado</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Sparkles className="w-4 h-4 mx-auto mb-1" style={{ color: GOLD }} />
              <p className="text-[10px] font-bold leading-tight" style={{ color: '#aaa' }}>Acesso<br/>imediato</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <CheckCircle2 className="w-4 h-4 mx-auto mb-1" style={{ color: '#22c55e' }} />
              <p className="text-[10px] font-bold leading-tight" style={{ color: '#aaa' }}>Garantia<br/>7 dias</p>
            </div>
          </div>

          {/* Logos de pagamento */}
          <div className="flex items-center gap-3 opacity-50 mt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#666' }}>Pagamento via</span>
            <span className="text-xs font-black" style={{ color: '#aaa' }}>Stripe</span>
            <span className="text-xs" style={{ color: '#444' }}>·</span>
            <span className="text-xs font-black" style={{ color: '#aaa' }}>Mercado Pago</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
