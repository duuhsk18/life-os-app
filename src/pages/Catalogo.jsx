import { useNavigate } from 'react-router-dom'
import { PRODUCTS } from '@/lib/sales-data'
import CountdownTimer from '@/components/sales/CountdownTimer'
import SocialProofToast from '@/components/sales/SocialProofToast'
import CartButton from '@/components/sales/CartButton'
import CartDrawer from '@/components/sales/CartDrawer'
import { useCart } from '@/contexts/CartContext'

export default function Catalogo() {
  const navigate = useNavigate()
  const products = Object.values(PRODUCTS)
  const { addItem, hasItem, items } = useCart()
  const cartFull = items.length >= 3

  return (
    <div className="min-h-screen bg-gray-950">
      <SocialProofToast />
      <CartButton />
      <CartDrawer />
      <CountdownTimer minutes={15} />

      {/* Header */}
      <div className="text-center px-4 pt-10 pb-6">
        <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-2">Todos os produtos</p>
        <h1 className="text-white font-black text-2xl sm:text-3xl mb-2">Escolha sua transformação</h1>
        <p className="text-gray-400 text-sm">Cada produto por apenas R$ 10,90 — ou leve todos por mais R$ 19</p>
      </div>

      {/* Grid */}
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

      {/* Kit completo CTA */}
      <div className="px-4 pb-16 max-w-lg mx-auto">
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-center shadow-2xl">
          <p className="text-white/80 text-xs uppercase tracking-widest font-bold mb-1">Melhor oferta</p>
          <h3 className="text-white font-black text-xl mb-2">Kit Completo — Todos os 6 produtos</h3>
          <p className="text-white/80 text-sm mb-4">Leve todos por apenas R$ 10,90 + R$ 19 = R$ 29,90</p>
          <button
            onClick={() => navigate('/p/receitas-low-carb')}
            className="w-full bg-white text-gray-900 font-black py-4 rounded-xl text-base active:scale-95 transition-transform"
          >
            Quero o Kit Completo →
          </button>
        </div>
      </div>
    </div>
  )
}
