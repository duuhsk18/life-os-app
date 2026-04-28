import { useNavigate } from 'react-router-dom'
import { PRODUCTS, KIT_COMPLETO, LIFE_OS } from '@/lib/sales-data'
import CountdownTimer from '@/components/sales/CountdownTimer'
import SocialProofToast from '@/components/sales/SocialProofToast'
import CartButton from '@/components/sales/CartButton'
import CartDrawer from '@/components/sales/CartDrawer'
import EscassezBanner from '@/components/sales/EscassezBanner'
import PageMeta from '@/components/PageMeta'
import { useCart } from '@/contexts/CartContext'

const SITE = 'https://www.agenciacriativa.shop'

const CATALOGO_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Catálogo — Agência Criativa',
  description: 'Todos os produtos digitais da Agência Criativa: planilhas, ebooks, templates e a assinatura premium do Life OS.',
  url: `${SITE}/catalogo`,
  inLanguage: 'pt-BR',
}

export default function Catalogo() {
  const navigate = useNavigate()
  const products = Object.values(PRODUCTS)
  const { addItem, hasItem, items } = useCart()
  const cartFull = items.length >= 3

  return (
    <div className="min-h-screen bg-gray-950">
      <PageMeta
        title="Catálogo — 6 produtos digitais + Kit + Life OS | Agência Criativa"
        description="Receitas Low Carb, Planilhas de Treino, Templates Notion, Ebooks de Autoajuda, Planilhas Financeiras e Receitas Indígenas. Avulso (R$27,90), Kit (R$47) ou Life OS (R$59,90). Garantia 7 dias."
        canonical={`${SITE}/catalogo`}
        schema={CATALOGO_SCHEMA}
      />
      <SocialProofToast />
      <CartButton />
      <CartDrawer />
      <EscassezBanner />
      <CountdownTimer minutes={15} />

      {/* Header */}
      <div className="text-center px-4 pt-10 pb-6">
        <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-2">Todos os produtos</p>
        <h1 className="text-white font-black text-2xl sm:text-3xl mb-2">Escolha sua transformação</h1>
        <p className="text-gray-400 text-sm">3 formas de levar — escolha o que faz sentido pra você</p>
      </div>

      {/* 3 Tiers Comparison */}
      <div className="px-4 pb-10 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Tier 1: Avulso */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col">
            <p className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-3">Avulso</p>
            <h3 className="text-white font-black text-xl mb-1">1 Produto</h3>
            <p className="text-gray-400 text-xs mb-4">Pra quem quer testar 1 produto específico.</p>
            <div className="mb-5">
              <p className="text-3xl font-black text-white">R$ 27,90</p>
              <p className="text-gray-500 text-xs">vitalício · sem mensalidade</p>
            </div>
            <ul className="space-y-2 text-sm text-gray-300 mb-6 flex-1">
              <li className="flex items-start gap-2"><span className="text-gray-500">✓</span> 1 produto à sua escolha</li>
              <li className="flex items-start gap-2"><span className="text-gray-500">✓</span> PWA: instala como app no celular</li>
              <li className="flex items-start gap-2"><span className="text-gray-500">✓</span> Funciona offline</li>
              <li className="flex items-start gap-2"><span className="text-gray-500">✓</span> Acesso vitalício</li>
            </ul>
            <button
              onClick={() => document.getElementById('catalog-list')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full bg-white/10 border border-white/20 text-white font-bold py-3 rounded-xl text-sm hover:bg-white/15 transition"
            >
              Ver produtos ↓
            </button>
          </div>

          {/* Tier 2: Kit Completo */}
          <div className="bg-gradient-to-br from-orange-600 to-amber-600 border border-orange-400 rounded-2xl p-6 flex flex-col shadow-xl">
            <p className="text-white/90 text-xs uppercase tracking-widest font-bold mb-3">Kit Completo</p>
            <h3 className="text-white font-black text-xl mb-1">6 Produtos</h3>
            <p className="text-white/80 text-xs mb-4">Pra quem quer tudo, sem mensalidade.</p>
            <div className="mb-5">
              <p className="text-white/70 text-sm line-through">De R$ {KIT_COMPLETO.totalValue.toFixed(2).replace('.', ',')}</p>
              <p className="text-3xl font-black text-white">R$ 47,00</p>
              <p className="text-white/80 text-xs">vitalício · economize 72%</p>
            </div>
            <ul className="space-y-2 text-sm text-white mb-6 flex-1">
              <li className="flex items-start gap-2"><span className="text-yellow-200">✓</span> Todos os 6 produtos</li>
              <li className="flex items-start gap-2"><span className="text-yellow-200">✓</span> PWA: instala todos como app</li>
              <li className="flex items-start gap-2"><span className="text-yellow-200">✓</span> Funcionam offline</li>
              <li className="flex items-start gap-2"><span className="text-yellow-200">✓</span> Acesso vitalício</li>
              <li className="flex items-start gap-2"><span className="text-white/50">✗</span> <span className="text-white/50">Sem sistema gamificado</span></li>
              <li className="flex items-start gap-2"><span className="text-white/50">✗</span> <span className="text-white/50">Sem materiais novos</span></li>
            </ul>
            <button
              onClick={() => navigate('/p/kit-completo')}
              className="w-full bg-white text-gray-900 font-black py-3 rounded-xl text-sm active:scale-95 transition"
            >
              Quero o Kit →
            </button>
          </div>

          {/* Tier 3: Life OS */}
          <div className="bg-gradient-to-br from-yellow-500 to-amber-500 border-2 border-yellow-300 rounded-2xl p-6 flex flex-col shadow-2xl relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-yellow-300 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest border border-yellow-300">
              ⚡ Mais Vendido
            </div>
            <p className="text-gray-900/80 text-xs uppercase tracking-widest font-bold mb-3">Life OS</p>
            <h3 className="text-gray-900 font-black text-xl mb-1">Tudo + Sistema</h3>
            <p className="text-gray-900/80 text-xs mb-4">Pra quem quer evoluir todo dia.</p>
            <div className="mb-5">
              <p className="text-gray-900/70 text-sm line-through">De R$ {LIFE_OS.originalPrice.toFixed(2).replace('.', ',')}/mês</p>
              <p className="text-3xl font-black text-gray-900">R$ 59,90</p>
              <p className="text-gray-900/90 text-xs font-bold">no 1º mês — depois R$ 79,90/mês</p>
            </div>
            <ul className="space-y-2 text-sm text-gray-900 mb-6 flex-1">
              <li className="flex items-start gap-2"><span className="text-gray-900 font-black">✓</span> <strong>Todos os 6 produtos inclusos</strong></li>
              <li className="flex items-start gap-2"><span className="text-gray-900 font-black">✓</span> <strong>App gamificado completo</strong></li>
              <li className="flex items-start gap-2"><span className="text-gray-900 font-black">✓</span> <strong>Novos materiais todo mês</strong></li>
              <li className="flex items-start gap-2"><span className="text-gray-900 font-black">✓</span> Tracker de hábitos com XP</li>
              <li className="flex items-start gap-2"><span className="text-gray-900 font-black">✓</span> Journal, finanças, metas</li>
              <li className="flex items-start gap-2"><span className="text-gray-900 font-black">✓</span> Cancele quando quiser</li>
            </ul>
            <button
              onClick={() => navigate('/produto/clube-life-os')}
              className="w-full bg-gray-900 text-yellow-300 font-black py-3 rounded-xl text-sm active:scale-95 transition shadow-lg"
            >
              Assinar Life OS →
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="px-4 max-w-5xl mx-auto">
        <div className="h-px bg-gray-800 my-4" />
      </div>

      {/* List of individual products */}
      <div id="catalog-list" className="px-4 pb-6 max-w-lg mx-auto pt-6">
        <h2 className="text-white font-black text-xl text-center mb-2">Produtos individuais</h2>
        <p className="text-gray-400 text-sm text-center mb-6">R$ 27,90 cada · vitalício</p>
      </div>

      {/* Grid de produtos */}
      <div className="px-4 pb-10 max-w-lg mx-auto space-y-4">
        {products.map(p => {
          const inCart = hasItem(p.slug)
          return (
            <div
              key={p.slug}
              className={`bg-gradient-to-br ${p.color} rounded-2xl p-5 shadow-lg`}
            >
              <div
                className="flex items-start gap-4 cursor-pointer"
                onClick={() => navigate(`/p/${p.slug}`)}
              >
                <span className="text-5xl">{p.emoji}</span>
                <div className="flex-1">
                  {p.badge && (
                    <span className="inline-block bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full mb-2 uppercase tracking-wide">
                      {p.badge}
                    </span>
                  )}
                  <h2 className="text-white font-black text-base leading-tight mb-1">{p.title}</h2>
                  <p className="text-white/75 text-xs leading-relaxed line-clamp-2">{p.subtitle}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <span className="text-white/50 text-xs line-through block">R$ {p.originalPrice.toFixed(2).replace('.', ',')}</span>
                      <span className="text-white font-black text-xl">R$ {p.price.toFixed(2).replace('.', ',')}</span>
                      {p.installment && (
                        <span className="text-yellow-300 text-xs font-bold block">
                          {p.installment.times}x R$ {p.installment.value.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </div>
                    <span className="bg-white text-gray-900 font-black text-sm px-4 py-1.5 rounded-xl">
                      Ver →
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <a
                  href={p.checkoutUrl}
                  className="flex-1 bg-white/20 border border-white/40 text-white font-bold py-2.5 rounded-xl text-center text-sm hover:bg-white/30 transition"
                >
                  Comprar agora
                </a>
                <button
                  onClick={() => addItem(p)}
                  disabled={inCart || cartFull}
                  className={`flex-1 font-bold py-2.5 rounded-xl text-sm transition active:scale-95 ${
                    inCart
                      ? 'bg-white/10 text-white/60 cursor-default'
                      : cartFull
                      ? 'bg-white/10 text-white/40 cursor-not-allowed'
                      : 'bg-white text-gray-900 hover:bg-white/90'
                  }`}
                >
                  {inCart ? '✓ No carrinho' : '🛒 Carrinho'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer reminder */}
      <div className="px-4 pb-16 max-w-lg mx-auto">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center">
          <p className="text-gray-400 text-sm mb-3">Ainda na dúvida?</p>
          <p className="text-white text-sm">
            Comece pelo <strong>avulso</strong> que mais te chama (R$ 27,90), <br/>
            e depois evolua para o <strong>Life OS</strong> quando quiser tudo.
          </p>
        </div>
      </div>
    </div>
  )
}
