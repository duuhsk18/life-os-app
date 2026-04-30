import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProduct, getRelatedProducts, KIT_COMPLETO, LIFE_OS } from '@/lib/sales-data'
import CountdownTimer from '@/components/sales/CountdownTimer'
import ExitIntentPopup from '@/components/sales/ExitIntentPopup'
import OrderBump from '@/components/sales/OrderBump'
import SocialProofToast from '@/components/sales/SocialProofToast'
import CartButton from '@/components/sales/CartButton'
import CartDrawer from '@/components/sales/CartDrawer'
import EscassezBanner from '@/components/sales/EscassezBanner'
import PageMeta from '@/components/PageMeta'
import { useCart } from '@/contexts/CartContext'

const SITE = 'https://www.agenciacriativa.shop'

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

  // Manda pro checkout customizado — bump nativo é tratado lá
  // (o bump na SalesPage é referencial; o real está em /checkout/:slug)
  const checkoutUrl = `/checkout/${product.slug}`

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.subtitle,
    brand: { '@type': 'Brand', name: 'Agência Criativa' },
    offers: {
      '@type': 'Offer',
      url: `${SITE}/p/${product.slug}`,
      priceCurrency: 'BRL',
      price: product.price.toFixed(2),
      availability: 'https://schema.org/InStock',
      priceValidUntil: '2026-12-31',
    },
    aggregateRating: product.testimonials?.length ? {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: product.testimonials.length,
    } : undefined,
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <PageMeta
        title={`${product.title} — R$ ${product.price.toFixed(2).replace('.', ',')} | Agência Criativa`}
        description={product.subtitle}
        canonical={`${SITE}/p/${product.slug}`}
        ogType="product"
        ogImage={product.image ? `${SITE}${product.image}` : undefined}
        schema={productSchema}
      />
      <ExitIntentPopup product={product} />
      <SocialProofToast />
      <CartButton />
      <CartDrawer />
      <EscassezBanner />

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
          {product.image ? (
            <div className="mx-auto mb-5 max-w-xs rounded-2xl overflow-hidden shadow-2xl">
              <img src={product.image} alt={product.title} className="w-full h-auto block" loading="eager" fetchPriority="high" />
            </div>
          ) : (
            <div className="text-6xl mb-4">{product.emoji}</div>
          )}
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

      {/* 4 Pilares de Benefícios — copy positivo logo após o hero */}
      {Array.isArray(product.benefits) && product.benefits.length > 0 && (
        <section className="bg-white px-4 py-10">
          <div className="max-w-lg mx-auto">
            <h2 className="text-xl font-black mb-6 text-center text-gray-900">
              O que você ganha com este guia
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {product.benefits.map((b, i) => (
                <div key={i} className="rounded-2xl p-4 border-2 border-gray-100 bg-gray-50">
                  <div className="text-3xl mb-2">{b.icon}</div>
                  <h3 className="font-black text-sm mb-1 text-gray-900 leading-tight">{b.title}</h3>
                  <p className="text-xs text-gray-600 leading-snug">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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

      {/* What you get + value stack — com imagem do produto lado-a-lado (estilo concorrente validado) */}
      <section className="bg-white px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-widest font-black text-green-600 mb-2 text-center md:text-left">CONTEÚDO DO EBOOK</p>
          <h2 className="text-2xl md:text-3xl font-black text-center md:text-left mb-6 leading-tight">
            Tudo que você vai receber hoje
          </h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-3">
              {product.whatYouGet.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-black">✓</span>
                  <p className="text-gray-800 font-medium text-sm leading-snug">{item.item}</p>
                </div>
              ))}
            </div>
            {(product.whatYouGetVideo || product.image) && (
              <div className="order-first md:order-last">
                {product.whatYouGetVideo ? (
                  <video
                    src={product.whatYouGetVideo}
                    poster={product.whatYouGetPoster || product.image}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full max-w-sm mx-auto rounded-2xl shadow-2xl block"
                  />
                ) : (
                  <img src={product.image} alt={product.title}
                    className="w-full max-w-sm mx-auto rounded-2xl shadow-2xl" />
                )}
              </div>
            )}
          </div>

          <div className="mt-8 bg-green-50 border-2 border-green-200 rounded-2xl p-5 text-center max-w-md mx-auto">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Valor total do pacote</p>
            <p className="text-sm text-gray-400 line-through">R$ {totalValue.toFixed(2).replace('.', ',')}</p>
            <p className="text-4xl font-black text-green-700 my-1">R$ {product.price.toFixed(2).replace('.', ',')}</p>
            <p className="text-xs text-green-700 font-bold">Você economiza R$ {(totalValue - product.price).toFixed(2).replace('.', ',')} hoje</p>
          </div>
        </div>
      </section>

      {/* Transformação Real — antes/depois (só aparece se produto tiver transformImage) */}
      {product.transformImage && (
        <section className="px-4 py-12" style={{ background: 'linear-gradient(180deg, #f0fdf4, #ffffff)' }}>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs uppercase tracking-widest font-black text-green-600 mb-2">Resultado real</p>
            <h2 className="text-2xl md:text-4xl font-black mb-3 leading-tight text-gray-900">
              A transformação que <span className="text-green-600">você merece</span>
            </h2>
            <p className="text-gray-600 text-sm md:text-base mb-8 max-w-xl mx-auto">
              Comendo bem, com receitas práticas e gostosas. <strong>Sem fome, sem dieta restritiva.</strong>
            </p>
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img src={product.transformImage} alt="Antes e depois — transformação real" className="w-full block" />
            </div>
            <p className="text-[11px] text-gray-400 mt-3 italic">
              Resultados podem variar de pessoa para pessoa.
            </p>
          </div>
        </section>
      )}

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

      {/* Upsell — Life OS (vem antes dos produtos individuais) */}
      <section className="bg-gradient-to-br from-yellow-600 via-yellow-700 to-orange-700 px-4 py-10">
        <div className="max-w-lg mx-auto">
          <p className="text-white/80 text-xs text-center uppercase tracking-widest mb-2 font-bold">
            🚀 Quer levar tudo de uma vez?
          </p>
          <h2 className="text-white font-black text-2xl text-center mb-4 leading-tight">
            Assine o Life OS e leve <br/>
            <span className="text-yellow-200">os 6 produtos + sistema completo</span>
          </h2>
          <div className="bg-white/15 backdrop-blur rounded-2xl p-5 mb-5">
            <ul className="space-y-2 text-white text-sm">
              <li className="flex items-start gap-2"><span className="text-yellow-200">✓</span> Biblioteca completa com os 6 produtos</li>
              <li className="flex items-start gap-2"><span className="text-yellow-200">✓</span> App gamificado: hábitos, treinos, journal, finanças</li>
              <li className="flex items-start gap-2"><span className="text-yellow-200">✓</span> Novos materiais adicionados todo mês</li>
              <li className="flex items-start gap-2"><span className="text-yellow-200">✓</span> Cancele quando quiser, sem multa</li>
            </ul>
          </div>
          <div className="text-center mb-5">
            <p className="text-white/70 text-sm line-through">De R$ {LIFE_OS.originalPrice.toFixed(2).replace('.', ',')}/mês</p>
            <p className="text-5xl font-black text-white mt-1">
              R$ {LIFE_OS.price.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-yellow-200 font-bold text-sm mt-1">
              no 1º mês — depois R$ {LIFE_OS.monthlyAfter.toFixed(2).replace('.', ',')}/mês
            </p>
          </div>
          <button
            onClick={() => navigate('/produto/clube-life-os')}
            className="block w-full bg-white text-gray-900 font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-transform"
          >
            Ver oferta completa do Life OS →
          </button>
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
