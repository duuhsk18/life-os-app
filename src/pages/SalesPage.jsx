import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProduct, getRelatedProducts, KIT_COMPLETO } from '@/lib/sales-data'
import CountdownTimer from '@/components/sales/CountdownTimer'
import ExitIntentPopup from '@/components/sales/ExitIntentPopup'
import OrderBump from '@/components/sales/OrderBump'
import SocialProofToast from '@/components/sales/SocialProofToast'
import CartButton from '@/components/sales/CartButton'
import CartDrawer from '@/components/sales/CartDrawer'
import { useCart } from '@/contexts/CartContext'

function Stars({ n = 5 }) {
  return <span className="text-yellow-400">{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>
}

export default function SalesPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const product = getProduct(slug)
  const related = getRelatedProducts(slug)
  const [bumpChecked, setBumpChecked] = useState(false)
  const { addItem, hasItem, items } = useCart()
  const inCart = product ? hasItem(product.slug) : false
  const cartFull = items.length >= 3

  useEffect(() => { window.scrollTo(0, 0) }, [slug])

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-8">
        <div>
          <p className="text-4xl mb-4">😕</p>
          <h1 className="text-xl font-bold mb-2">Produto não encontrado</h1>
          <Link to="/" className="text-blue-600 underline">Voltar ao início</Link>
        </div>
      </div>
    )
  }

  const totalValue = product.whatYouGet.reduce((sum, i) => {
    const num = parseFloat(i.value.replace('R$', '').trim())
    return sum + (isNaN(num) ? 0 : num)
  }, 0)

  const checkoutUrl = bumpChecked
    ? `${product.checkoutUrl}&bump=kit`
    : product.checkoutUrl

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <ExitIntentPopup product={product} />
      <SocialProofToast />
      <CartButton />
      <CartDrawer />

      {/* Top countdown */}
      <CountdownTimer minutes={15} />

      {/* Hero */}
      <section className={`bg-gradient-to-br ${product.color} text-white px-4 pt-10 pb-12`}>
        <div className="max-w-lg mx-auto text-center">
          {product.badge && (
            <span className="inline-block bg-white/20 border border-white/40 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">
              {product.badge}
            </span>
          )}
          <div className="text-6xl mb-4">{product.emoji}</div>
          <h1 className="text-2xl sm:text-3xl font-black leading-tight mb-3">
            {product.title}
          </h1>
          <p className="text-base text-white/90 mb-6 leading-relaxed">{product.subtitle}</p>

          {/* Price */}
          <div className="bg-white/15 backdrop-blur rounded-2xl p-5 mb-6 text-center">
            <p className="text-white/70 text-sm line-through mb-1">
              De R$ {product.originalPrice.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-white/80 text-sm mb-1">ou à vista por</p>
            <p className="text-5xl font-black text-white">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </p>
            {product.installment && (
              <p className="text-yellow-300 font-black text-lg mt-1">
                ou {product.installment.times}x de R$ {product.installment.value.toFixed(2).replace('.', ',')}
              </p>
            )}
            <p className="text-white/70 text-xs mt-1">sem juros · acesso vitalício</p>
          </div>

          <a
            href={checkoutUrl}
            className="block w-full bg-white text-gray-900 font-black py-4 rounded-2xl text-lg shadow-lg active:scale-95 transition-transform"
          >
            Comprar agora →
          </a>
          <button
            onClick={() => addItem(product)}
            disabled={inCart || cartFull}
            className={`mt-3 w-full border-2 border-white/40 text-white font-bold py-3 rounded-2xl text-sm active:scale-95 transition-all ${
              inCart ? 'opacity-60 cursor-default' : cartFull ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/10'
            }`}
          >
            {inCart ? '✓ Adicionado ao carrinho' : cartFull ? 'Carrinho cheio (máx. 3)' : '🛒 Adicionar ao carrinho'}
          </button>
          <p className="text-xs text-white/70 mt-3">🔒 Compra 100% segura · Acesso imediato por e-mail</p>
        </div>
      </section>

      {/* Pain points */}
      <section className="bg-gray-900 text-white px-4 py-10">
        <div className="max-w-lg mx-auto">
          <h2 className="text-xl font-black mb-6 text-center">Você se identifica com alguma dessas situações?</h2>
          <ul className="space-y-4">
            {product.painPoints.map((pain, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-red-400 text-xl flex-shrink-0">✗</span>
                <p className="text-gray-200">{pain}</p>
              </li>
            ))}
          </ul>
          <div className="mt-8 bg-white/10 rounded-xl p-4 text-center">
            <p className="text-white font-semibold text-base">
              Se respondeu sim para alguma dessas... <br />
              <span className="text-yellow-400 font-black">esse produto foi feito para você.</span>
            </p>
          </div>
        </div>
      </section>

      {/* What you get + value stack */}
      <section className="bg-white px-4 py-10">
        <div className="max-w-lg mx-auto">
          <h2 className="text-xl font-black text-center mb-2">O que está incluído</h2>
          <p className="text-center text-gray-500 text-sm mb-6">
            Valor total: <span className="line-through">R$ {totalValue.toFixed(2).replace('.', ',')}</span>{' '}
            <span className="text-green-600 font-black">você paga apenas R$ {product.price.toFixed(2).replace('.', ',')}</span>
          </p>
          <div className="space-y-3">
            {product.whatYouGet.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-start gap-3">
                  <span className="text-green-500 font-black mt-0.5">✓</span>
                  <p className="text-gray-800 font-medium text-sm">{item.item}</p>
                </div>
                <span className="text-gray-400 line-through text-xs flex-shrink-0 ml-2">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-600">Valor total do pacote</p>
            <p className="text-3xl font-black text-green-700">R$ {product.price.toFixed(2).replace('.', ',')}</p>
            <p className="text-xs text-gray-500 mt-1">Economize R$ {(totalValue - product.price).toFixed(2).replace('.', ',')} hoje</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 px-4 py-10">
        <div className="max-w-lg mx-auto">
          <h2 className="text-xl font-black text-center mb-6">O que dizem quem já comprou</h2>
          <div className="space-y-4">
            {product.testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <Stars n={t.stars} />
                <p className="text-gray-700 mt-2 text-sm leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-2xl">{t.avatar}</span>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Order bump */}
      <section className="bg-white px-4 py-6">
        <div className="max-w-lg mx-auto">
          <p className="text-center text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
            Antes de finalizar sua compra:
          </p>
          <OrderBump checked={bumpChecked} onChange={setBumpChecked} />
        </div>
      </section>

      {/* Main CTA */}
      <section className={`bg-gradient-to-br ${product.color} px-4 py-10`}>
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-white font-black text-2xl mb-2">Pronta para transformar sua vida?</h2>
          <p className="text-white/80 text-sm mb-6">
            Mais de 1.200 pessoas já compraram e estão {product.emoji} aproveitando
          </p>
          <div className="bg-white/15 rounded-xl p-4 mb-5 text-white text-center">
            {bumpChecked ? (
              <>
                <p className="font-black text-3xl">R$ {(product.price + KIT_COMPLETO.bumpPrice).toFixed(2).replace('.', ',')}</p>
                <p className="text-yellow-300 font-bold text-base mt-0.5">
                  ou {KIT_COMPLETO.bumpInstallment.times}x de R$ {((product.installment?.value || 0) + KIT_COMPLETO.bumpInstallment.value).toFixed(2).replace('.', ',')}
                </p>
                <p className="text-xs text-white/60 mt-0.5">Produto + Kit Completo · sem juros</p>
              </>
            ) : (
              <>
                <p className="font-black text-3xl">R$ {product.price.toFixed(2).replace('.', ',')}</p>
                {product.installment && (
                  <p className="text-yellow-300 font-bold text-base mt-0.5">
                    ou {product.installment.times}x de R$ {product.installment.value.toFixed(2).replace('.', ',')}
                  </p>
                )}
                <p className="text-xs text-white/60 mt-0.5">sem juros · acesso vitalício</p>
              </>
            )}
          </div>
          <a
            href={checkoutUrl}
            className="block w-full bg-white text-gray-900 font-black py-5 rounded-2xl text-xl shadow-2xl active:scale-95 transition-transform"
          >
            COMPRAR AGORA →
          </a>
          <p className="text-white/70 text-xs mt-3">🔒 Pagamento seguro · Satisfação garantida</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white px-4 py-10">
        <div className="max-w-lg mx-auto">
          <h2 className="text-xl font-black text-center mb-6">Perguntas frequentes</h2>
          <div className="space-y-3">
            {product.faq.map((item, i) => (
              <details key={i} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                <summary className="px-4 py-4 font-semibold text-gray-900 cursor-pointer text-sm">
                  {item.q}
                </summary>
                <p className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-sell — outros produtos */}
      {related.length > 0 && (
        <section className="bg-gray-900 px-4 py-10">
          <div className="max-w-lg mx-auto">
            <p className="text-white/60 text-xs text-center uppercase tracking-widest mb-2">Você também vai amar</p>
            <h2 className="text-white font-black text-lg text-center mb-6">
              Outros produtos que podem mudar sua vida
            </h2>
            <div className="space-y-3">
              {related.map(p => (
                <button
                  key={p.slug}
                  onClick={() => navigate(`/p/${p.slug}`)}
                  className={`w-full bg-gradient-to-r ${p.color} rounded-2xl p-4 text-left flex items-center gap-4 active:scale-95 transition-transform`}
                >
                  <span className="text-4xl">{p.emoji}</span>
                  <div className="flex-1">
                    <p className="text-white font-black text-sm leading-tight">{p.title.split('—')[0].trim()}</p>
                    <p className="text-white/70 text-xs mt-1 line-clamp-1">{p.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-black">R$ {p.price.toFixed(2).replace('.', ',')}</p>
                    <p className="text-white/60 text-xs">→</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate('/catalogo')}
              className="block w-full text-center text-white/50 text-sm mt-4 underline"
            >
              Ver todos os produtos
            </button>
          </div>
        </section>
      )}

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-xl z-40">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <div className="flex-shrink-0">
            <p className="text-xs text-gray-500 line-through">R$ {product.originalPrice.toFixed(2).replace('.', ',')}</p>
            <p className="font-black text-gray-900 text-sm leading-tight">
              R$ {bumpChecked
                ? (product.price + KIT_COMPLETO.bumpPrice).toFixed(2).replace('.', ',')
                : product.price.toFixed(2).replace('.', ',')}
            </p>
            {product.installment && (
              <p className="text-green-600 text-xs font-bold leading-tight">
                {product.installment.times}x R$ {product.installment.value.toFixed(2).replace('.', ',')}
              </p>
            )}
          </div>
          <button
            onClick={() => addItem(product)}
            disabled={inCart || cartFull}
            className={`flex-1 border-2 font-bold py-3 rounded-xl text-center text-xs transition-all ${
              inCart
                ? 'border-green-400 text-green-600 bg-green-50'
                : cartFull
                ? 'border-gray-200 text-gray-400'
                : 'border-gray-300 text-gray-700 active:scale-95'
            }`}
          >
            {inCart ? '✓ No carrinho' : '🛒 Carrinho'}
          </button>
          <a
            href={checkoutUrl}
            className={`flex-1 bg-gradient-to-r ${product.color} text-white font-black py-3 rounded-xl text-center text-sm active:scale-95 transition-transform`}
          >
            Comprar →
          </a>
        </div>
      </div>

      {/* Bottom padding for sticky bar */}
      <div className="h-20" />
    </div>
  )
}
