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
import { trackPixel } from '@/components/MetaPixel'

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

  // Meta Pixel: ViewContent quando entra na página do produto
  useEffect(() => {
    if (!product) return
    trackPixel('ViewContent', {
      content_ids:  [product.slug],
      content_name: product.title,
      content_type: 'product',
      value:        product.price,
      currency:     'BRL',
    })
  }, [product?.slug])

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

      {/* === HERO RICO === badge + stats inline + mockup + price + dual CTA */}
      <section className={`bg-gradient-to-br ${product.color} text-white px-4 pt-8 pb-12 relative overflow-hidden`}>
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ background: 'rgba(255,255,255,0.4)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-15 blur-3xl" style={{ background: 'rgba(0,0,0,0.5)', transform: 'translate(-30%, 30%)' }} />

        <div className="max-w-lg mx-auto text-center relative">
          {/* Top bar — social proof inline */}
          <div className="flex items-center justify-center gap-2 text-xs mb-4 flex-wrap">
            <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur px-2.5 py-1 rounded-full border border-white/20">
              <span className="text-yellow-300">★★★★★</span>
              <span className="font-bold">4.9/5</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur px-2.5 py-1 rounded-full border border-white/20">
              <span>👥</span>
              <span className="font-bold">+1.200 clientes</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur px-2.5 py-1 rounded-full border border-white/20">
              <span>🛡</span>
              <span className="font-bold">Garantia 7 dias</span>
            </span>
          </div>

          {product.badge && (
            <span className="inline-block bg-white/25 border border-white/50 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-3 backdrop-blur">
              {product.badge}
            </span>
          )}

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.05] mb-4 tracking-tight">
            {product.title}
          </h1>
          <p className="text-base sm:text-lg text-white/90 mb-7 leading-relaxed max-w-md mx-auto">{product.subtitle}</p>

          {/* Mockup do produto */}
          {product.image ? (
            <div className="mx-auto mb-7 max-w-xs rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/20" style={{ boxShadow: '0 32px 64px rgba(0,0,0,0.4)' }}>
              <img src={product.image} alt={product.title} className="w-full h-auto block" loading="eager" fetchPriority="high" />
            </div>
          ) : (
            <div className="text-6xl mb-7">{product.emoji}</div>
          )}

          {/* Price card */}
          <div className="bg-white/15 backdrop-blur rounded-2xl p-5 mb-5 text-center border border-white/20">
            <p className="text-white/70 text-xs mb-1 line-through">
              De R$ {product.originalPrice.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-white/80 text-xs uppercase tracking-widest font-black mb-1">Hoje você paga</p>
            <p className="text-5xl font-black text-white tracking-tight">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </p>
            {product.installment && (
              <p className="text-yellow-300 font-black text-base mt-1">
                ou {product.installment.times}× R$ {product.installment.value.toFixed(2).replace('.', ',')}
              </p>
            )}
            <p className="text-white/70 text-[11px] mt-2">acesso vitalício · sem mensalidade</p>
          </div>

          {/* CTA primário grande */}
          <a
            href={checkoutUrl}
            onClick={() => trackPixel('AddToCart', { content_ids: [product.slug], value: product.price, currency: 'BRL' })}
            className="block w-full bg-white text-gray-900 font-black py-5 rounded-2xl text-lg shadow-2xl active:scale-95 transition-transform mb-2"
            style={{ boxShadow: '0 16px 40px rgba(0,0,0,0.3)' }}
          >
            QUERO ACESSAR AGORA →
          </a>

          {/* CTA secundário — descer pra ver mais */}
          <a href="#detalhes" className="block w-full text-white/80 text-sm py-2 underline-offset-4 hover:text-white">
            Ver tudo que tá incluído ↓
          </a>

          <p className="text-[11px] text-white/70 mt-4 flex items-center justify-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1">🔒 Compra segura</span>
            <span>·</span>
            <span>Acesso em 2min</span>
            <span>·</span>
            <span>7d garantia</span>
          </p>
        </div>
      </section>

      {/* === DOR PRIMEIRO === Pain points — conexão emocional logo após o hero */}
      <section className="bg-gray-900 text-white px-4 py-12">
        <div className="max-w-lg mx-auto">
          <p className="text-center text-xs uppercase tracking-widest font-black mb-3" style={{ color: '#f87171' }}>Você se identifica?</p>
          <h2 className="text-2xl md:text-3xl font-black mb-8 text-center leading-tight">
            Algumas dessas situações <span style={{ color: '#f87171' }}>são você</span> hoje?
          </h2>
          <ul className="space-y-4">
            {product.painPoints.map((pain, i) => (
              <li key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-4 border border-white/5">
                <span className="text-red-400 text-2xl flex-shrink-0 leading-none">✗</span>
                <p className="text-gray-200 text-base leading-snug">{pain}</p>
              </li>
            ))}
          </ul>
          <div className="mt-8 bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-5 text-center">
            <p className="text-white font-bold text-base leading-relaxed">
              Se respondeu sim pra <span className="text-yellow-400">qualquer uma</span> dessas...
              <br />
              <span className="text-yellow-400 font-black text-lg block mt-1">a gente preparou a saída.</span>
            </p>
          </div>
        </div>
      </section>

      {/* === SOLUÇÃO === 4 Pilares — apresentação da solução depois da dor */}
      {Array.isArray(product.benefits) && product.benefits.length > 0 && (
        <section className="bg-white px-4 py-12">
          <div className="max-w-lg mx-auto">
            <p className="text-center text-xs uppercase tracking-widest font-black text-green-600 mb-3">A solução</p>
            <h2 className="text-2xl md:text-3xl font-black mb-2 text-center text-gray-900 leading-tight">
              Não é mais um ebook.
            </h2>
            <p className="text-center text-base text-gray-600 mb-8 leading-relaxed">
              É um <strong className="text-gray-900">sistema funcional</strong> que faz o trabalho por você.
            </p>
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

      {/* What you get + value stack — com imagem do produto lado-a-lado (estilo concorrente validado) */}
      <section id="detalhes" className="bg-white px-4 py-10 scroll-mt-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-widest font-black text-green-600 mb-2 text-center md:text-left">DENTRO DO SISTEMA</p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 text-center md:text-left mb-2 leading-tight">
            Tudo que você acessa hoje
          </h2>
          <p className="text-sm text-gray-600 mb-8 text-center md:text-left">Acesso vitalício · pelo celular, tablet ou pc · funciona offline</p>
          <div className="grid md:grid-cols-2 gap-8 md:items-start">
            <div className="space-y-4 md:pt-2">
              {product.whatYouGet.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-base font-black shadow-sm">✓</span>
                  <p className="text-gray-900 font-semibold text-base leading-snug">{item.item}</p>
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

      {/* === COMPARAÇÃO === Mata posicionamento de concorrentes (PDF comum vs sistema) */}
      <section className="bg-gray-900 text-white px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs uppercase tracking-widest font-black text-yellow-400 mb-3">A diferença</p>
          <h2 className="text-2xl md:text-3xl font-black mb-2 text-center leading-tight">
            Por que outros <span style={{ color: '#f87171' }}>nunca funcionaram</span> pra você?
          </h2>
          <p className="text-center text-sm text-gray-400 mb-8 max-w-xl mx-auto">
            A maioria vende PDF. A gente entrega um sistema que funciona no seu celular.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Coluna ESQUERDA — concorrentes */}
            <div className="rounded-2xl p-5 bg-red-950/30 border border-red-900/40">
              <p className="text-xs uppercase tracking-widest font-black text-red-400 mb-3">Comum no mercado</p>
              <h3 className="text-lg font-black mb-4 text-white/80">Ebook genérico</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-2"><span className="text-red-400 flex-shrink-0">✗</span>PDF estático que cai na pasta de downloads</li>
                <li className="flex items-start gap-2"><span className="text-red-400 flex-shrink-0">✗</span>Você lê uma vez, esquece pra sempre</li>
                <li className="flex items-start gap-2"><span className="text-red-400 flex-shrink-0">✗</span>Sem ferramenta interativa</li>
                <li className="flex items-start gap-2"><span className="text-red-400 flex-shrink-0">✗</span>Nada de planejamento ou tracker</li>
                <li className="flex items-start gap-2"><span className="text-red-400 flex-shrink-0">✗</span>Suporte nenhum</li>
                <li className="flex items-start gap-2"><span className="text-red-400 flex-shrink-0">✗</span>"Conteúdo" mas zero sistema</li>
              </ul>
            </div>

            {/* Coluna DIREITA — nós */}
            <div className="rounded-2xl p-5 bg-yellow-500/10 border-2 border-yellow-400/50 relative">
              <span className="absolute -top-3 right-4 bg-yellow-400 text-gray-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Você aqui</span>
              <p className="text-xs uppercase tracking-widest font-black text-yellow-400 mb-3">Agência Criativa</p>
              <h3 className="text-lg font-black mb-4 text-white">{product.title.split('—')[0].trim()}</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2"><span className="text-green-400 flex-shrink-0">✓</span><span><strong className="text-white">Sistema</strong> que funciona no celular, tablet e pc</span></li>
                <li className="flex items-start gap-2"><span className="text-green-400 flex-shrink-0">✓</span><span><strong className="text-white">Funciona offline</strong> depois de abrir uma vez</span></li>
                <li className="flex items-start gap-2"><span className="text-green-400 flex-shrink-0">✓</span><span><strong className="text-white">Ferramentas interativas</strong> (planejador, calculadoras, tracker)</span></li>
                <li className="flex items-start gap-2"><span className="text-green-400 flex-shrink-0">✓</span><span><strong className="text-white">Persistência</strong> — você marca e fica salvo</span></li>
                <li className="flex items-start gap-2"><span className="text-green-400 flex-shrink-0">✓</span><span><strong className="text-white">Suporte WhatsApp</strong> direto comigo</span></li>
                <li className="flex items-start gap-2"><span className="text-green-400 flex-shrink-0">✓</span><span><strong className="text-white">Atualizações grátis</strong> pra sempre</span></li>
              </ul>
            </div>
          </div>

          <p className="text-center text-xs text-gray-500 mt-8 italic">
            Por isso a gente cobra R$ {product.price.toFixed(0)} em vez de R$ 9,90 com 10 bônus inúteis.
          </p>
        </div>
      </section>

      {/* === GARANTIA VISUAL === selo grande pra reduzir risco percebido */}
      <section className="bg-white px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-3xl p-7 md:p-10 text-center" style={{ background: 'linear-gradient(135deg, #fef3c7, #fff)', border: '2px dashed #F4C430' }}>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5" style={{ background: 'rgba(244,196,48,0.2)', border: '3px solid #F4C430' }}>
              <span className="text-4xl">🛡</span>
            </div>
            <p className="text-xs uppercase tracking-widest font-black text-yellow-700 mb-2">Garantia incondicional</p>
            <h2 className="text-2xl md:text-3xl font-black mb-3 text-gray-900 leading-tight">
              7 dias pra testar. <span className="text-yellow-700">Sem pegadinha.</span>
            </h2>
            <p className="text-base text-gray-700 mb-5 leading-relaxed max-w-xl mx-auto">
              Acessa, usa, testa. Não gostou em 7 dias?
              <br /><strong>Manda 1 email e devolvemos 100%</strong> — sem pergunta, sem burocracia.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Risco zero pra você
            </div>
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

      {/* Sticky bottom CTA — versão melhorada com gradient + animação */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        {/* Backdrop blur subtle */}
        <div className="absolute inset-0 bg-white/95 backdrop-blur border-t border-gray-200" />
        <div className="relative max-w-lg mx-auto p-3 flex items-center gap-3">
          <div className="flex-shrink-0">
            <p className="text-[10px] text-gray-400 line-through leading-tight">De R$ {product.originalPrice.toFixed(2).replace('.', ',')}</p>
            <p className="font-black text-gray-900 text-base leading-tight">
              R$ {bumpChecked
                ? (product.price + KIT_COMPLETO.bumpPrice).toFixed(2).replace('.', ',')
                : product.price.toFixed(2).replace('.', ',')}
            </p>
            {product.installment && (
              <p className="text-green-600 text-[10px] font-bold leading-tight">
                ou {product.installment.times}× R$ {product.installment.value.toFixed(2).replace('.', ',')}
              </p>
            )}
          </div>
          <a
            href={checkoutUrl}
            onClick={() => trackPixel('AddToCart', { content_ids: [product.slug], value: product.price, currency: 'BRL' })}
            className={`flex-1 bg-gradient-to-r ${product.color} text-white font-black py-3.5 rounded-xl text-center text-sm active:scale-95 transition-transform shadow-lg`}
            style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
          >
            QUERO ACESSAR →
          </a>
        </div>
      </div>

      {/* Bottom padding for sticky bar */}
      <div className="h-24" />
    </div>
  )
}
